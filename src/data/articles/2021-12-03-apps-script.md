---
title: イベント発生時に UrlFetchApp.fetch を呼ぶ
tags: ["Google Apps Script"]
---

UrlFetchApp.fetch を呼んだらエラーが起きたので調べた。



スプレッドシートで使うGoogle Apps Script (GAS) を作っているときの話。

## UrlFetchApp

GAS で API などからデータを取得するには `UrlFetchApp` を使う。

[Class UrlFetchApp &nbsp;|&nbsp; Apps Script &nbsp;|&nbsp; Google Developers](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app)

`UrlFetchApp.fetch(<URL>)` で API からデータを取得したり、サイトの HTML を取得したりすることができる。


### Oauth Scopes

GAS で `UrlFetchApp.fetch` を実行するには ` https://www.googleapis.com/auth/script.external_request` スコープをスクリプトに追加しなければならない。

ただし、

> This service requires the `https://www.googleapis.com/auth/script.external_request` scope. In most cases Apps Script automatically detects and includes the scopes a script needs, but if you are [setting your scopes explicitly](https://developers.google.com/apps-script/concepts/scopes#setting_explicit_scopes) you must manually add this scope to use `UrlFetchApp`.

とあるように、GAS でコードを書くと明示的に追加しなくても勝手に追加してくれる。

明示的にスコープを追加するには `appscript.json` の `oauthScopes` にスコープを書く。

```json:title=appscript.json
{
  "timeZone": "Asia/Tokyo",
  "dependencies": {},
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

## Simple Triggers
[Simple Triggers &nbsp;|&nbsp; Apps Script &nbsp;|&nbsp; Google Developers](https://developers.google.com/apps-script/guides/triggers)

GAS では特定の関数名をつけることで、特定のイベントの発生時に関数を実行することができる。例えば、`onEdit` だとセルを変更したときに実行される。

### Simple Triggers では UrlFetchApp が呼べない

`onEdit` 内で `UrlFetchApp.fetch` を実行すると下記のようなエラーが出る。

```
Exception: You do not have permission to call UrlFetchApp.fetch. Required permissions: https://www.googleapis.com/auth/script.external_request
    at onEdit(Code:2:22)
```

権限がないというエラーだが、`Project OAuth Scopes` に `external_request` が追加されていてもこのエラーが出る。


## Trigger を作る

特定のイベント発生時に `UrlFetchApp` を呼ぶためには、Simple Triggers ではなく自分でトリガーを作成する必要がある。
特に難しいものではなく、GAS のプロジェクトページのサイドバー > Trigegrs > Add Trigger で作成ができる。

https://i.imgur.com/ggyXgx0
トリガーを作成しているところ

”Choose which function to run" で実行する関数を指定し、"Select event source" を "From spreadsheet" にすると、"Select event type" で "On edit" などが選べる。

### From spreadsheet がない

GAS は docs や sheet などのファイルに結びついたものと、ファイルに結びついていないスタンドアロンのものがある。

スタンドアロンの GAS ではプロジェクトページからトリガーが作成できないので  `ScriptApp` を使ってトリガーを作成する必要がある。

[Class ScriptApp &nbsp;|&nbsp; Apps Script &nbsp;|&nbsp; Google Developers](https://developers.google.com/apps-script/reference/script/script-app#newtriggerfunctionname)

```typescript:title=トリガーを作成する関数の例
function addOnEditTrigger() {
	ScriptApp.newTrigger('onEditHandler')
		.forSpreadsheet(SpreadsheetApp.openByUrl(SPREAD_SHEET_URL))
		.onEdit()
		.create();
}
```

