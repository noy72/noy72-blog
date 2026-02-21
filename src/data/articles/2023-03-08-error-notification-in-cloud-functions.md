---
title: "[GCP] Cloud Functions のエラー通知方法"
tags: ["Google Cloud"]
thumbnail: "https://i.imgur.com/5JWthBsm.webp"
---

Python でのログの出し方と Cloud Monitoring を使った監視の方法を書いた。

## アプリケーションでのエラー通知

### 例外を通知する

特に何も設定しなくても、例外が発生すると Cloud Logging と Error Reporting にログが記録される。Error Reporting で通知の設定をしておけば、Function で例外が発生したときに通知を受け取ることができる。

ただし、コールド スタートの原因になるので、捕捉されない例外を投げるのは推奨されない。

> 例外処理を使用する言語では、捕捉されない例外をスローしないでください。これは、以降の呼び出しでコールド スタートが強制されるためです。
>
> https://cloud.google.com/functions/docs/bestpractices/tips?hl=ja#error_reporting

捕捉されない例外を出さないようにするためには、呼び出しのトップレベルで例外をキャッチして、エラーメッセージを出力するなどが考えられる。

```python
def trigger(requests):
    """Cloud Functions のエントリーポイント"""
    try:
        main()  # 処理
    except Exception as e:
        logger.error(e, exc_info=True)
        return "Error", 500
    return "Ok", 200


def main():
    raise Exception
```

例外オブジェクトを出力することでも Cloud Logging や Error Reporting に記録される。

### 構造化ロギング

Function 内の出力はログに記録されるが、単に `dict` を出力すると textPayload に文字列として入ってしまうし、改行があるとその分だけログが分かれてしまう。

https://i.imgur.com/5JWthBs
logger.error("1\n2\n3") と書くと改行ごとに別々のログに分かれる

また、Python の logger には、`info` や `error` などのメソッドがあるが、Cloud Functions ではそれらは区別されない。Severity が "Default" のログが記録されるだけで、`error` を使ったとしても Error Reporting に記録されない。

Severity を設定したり、辞書や複数行からなる文字列を jsonPayload として記録するには構造化された形式でログを出力する必要がある。

[構造化ロギング  |  Cloud Logging  |  Google Cloud](https://cloud.google.com/logging/docs/structured-logging?hl=ja)

具体的には以下のように書く。

```python
logger.error(json.dump({
    "message": "Validation Failed\n無効な文字が含まれています\n困る",
    "value": value,
    "severity": "ERROR"
}))
```

`logger.error` を使っているが、ログレベルに合わせて Severity が設定されるわけではないので、明示的に Severity を設定する必要がある。また、Error Reporting にエラーイベントを取得してほしい場合は

```
"@type": "type.googleapis.com/
          google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent"
```

を構造化ログに含める必要がある。

[ログでエラーをフォーマットする  |  Error Reporting  |  Google Cloud](https://cloud.google.com/error-reporting/docs/formatting-error-messages?hl=ja)

#### スニペット

ログを出すのがやや面倒なので、その辺りの設定をやってくれる小さなライブラリ（といえるほどのものではない）を使っている

https://github.com/noy72/google-cloud-structured-logger|embed

`logger.error("error")` と書けば、

```json
{
  "message": "error",
  "timestamp": "2022-08-18T12:55:52.064381",
  "severity": "ERROR",
  "@type": "type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent"
}
```

という文字列を出力してくれる。

既存のもっと良いやつがあれば誰か教えてください。

## Function 自体が失敗した時

Function のメモリ制限や実行時間の制限によってFunction が失敗した場合は、特にエラーは通知されず、ログレベル debug で「正常に終了しなかった」というログが出る。

当然だが、アプリケーション（Function のコード）では、Function の失敗を検知することができない。

Function 自体の失敗の検知は、Cloud Monitoring で行える。

### Cloud Monitoring を使った監視

監視できるメトリクスは以下のドキュメントに書いてある。

[Google Cloud metrics  |  Cloud Monitoring](https://cloud.google.com/monitoring/api/metrics_gcp)

function/execution_count の status を監視することで、正常に終了したかどうかを判定できる。status が取り得る値は以下である。

> `status`: Execution status of the function: 'ok', 'timeout', 'error', 'crash', 'out of memory', 'out of quota', 'load error', 'load timeout', 'connection error', 'invalid header', 'request too large', 'system error', 'response error', 'invalid message'.

#### terraform での設定

```
resource "google_monitoring_alert_policy" "function_execution_count" {
  display_name = "Cloud Functions Execution Count (status != ok)"
  documentation {
    <説明>
  }
  combiner = "OR"
  conditions {
    display_name = "Cloud Functions Execution Count (status != ok)"
    condition_threshold {
      filter = "resource.type = \"cloud_function\" AND metric.type = \"cloudfunctions.googleapis.com/function/execution_count\" AND metric.labels.status != \"ok\""
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_SUM"
      }
      threshold_value = 0
      comparison      = "COMPARISON_GT"
      trigger {
        count = 1
      }
      duration = "0s"
    }
  }
  alert_strategy {
    auto_close = "604800s"
  }
  notification_channels = [
    <通知先>
  ]
}
```

status を監視すること以外にも、特定のログの数を監視することで Function の失敗を検知できる。

[ログベースの指標の概要  |  Cloud Logging  |  Google Cloud](https://cloud.google.com/logging/docs/logs-based-metrics?hl=ja)

例えば、アプリケーションが正常に終了した場合にログを書き出しそのログの数を数えたり、システム側が勝手に書き出すログの数を数えるなどが考えられる。

システム側が書き出すログは変更され得るので、やや信頼性に欠けるかもしれない。

### 懸念点

上記の監視ルールだと、Function 自体が失敗したかどうかに関わらず通知されてしまう。Cloud Monitoring からの通知と Error Reporting からの通知が二重に通知されてしまうかもしれない。

閾値を調整して、Function が 2 回連続で失敗していたら通知するなど、条件を考えたほうが良いかもしれない。

status が取り得る値はいくつかあるが、Function がタイムアウトで失敗した場合でもstatue が `error` になるケースがあるらしい。これはもうちょっと調査をしたい。

<br>

いい感じに Function の異常終了を検知する仕組みがあったら教えてください。
