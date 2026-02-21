---
title: google api client の認証についてメモ
tags: ["Google Cloud"]
---

毎回調べているのでメモしておく。

これが良い方法かはわからない。とりあえず API を利用できる方法のひとつぐらいの気持ちで書いている。例として gmail の API を使っている。

## ADC を使った認証

 `gcloud auth application-default login` すれば Cloud Storage や Secret Manager は利用できる。ただし、Drive や Gmail などの個人のデータにアクセスできる API は利用できない。

この場合はログインするときに `--client-id-file` オプションを与えれば良い。具体的には、

1. https://console.cloud.google.com/apis/credentials から OAuth client ID（Desktop app）を作成する
2. 作成した ID をダウンロードする
3. `--client-id-file=client_secret_*.json` のように、オプションにダウンロードしたファイルへのパスを与える

とすれば良い。

ログインできていればクライアントライブラリは勝手に Application Default Credential を使うので、明示的に credentials を指定せずとも認証ができる。例えば、自分宛のメールは以下のように取得できる

```python
service = build('gmail', 'v1')
messages = service.users().message().get(userId='me', id='<id>').execute()
```

## Token を使った認証

Cloud Function などから特定のユーザーのメールを読みたい場合は ADC を使った方法は取れない気がする。

この場合は、

1. https://console.cloud.google.com/apis/credentials から OAuth client ID（Web application）を作成する
   
   1. Authorized redirect URIs に `https://developers.google.com/oauthplayground` を入れておく

2. https://developers.google.com/oauthplayground から Gmail API にチェックをつけて Authorize APIs する
   
   1. 右上の歯車アイコン > "Use your own OAuth credentials" にチェックを入れて、作成した Oauth client ID を入力する

3. ログインする

4. `access_token` と `refresh_token` を取得する

5. ```python
   from google.oauth2.credentials import Credentials
   
   credentials = Credentials(
               token=<access_token>,
               token_uri="https://oauth2.googleapis.com/token",
               refresh_token=<refresh_token>,
               client_id=<client_id>,
               client_secret=<client_secret>,
           )
   service = build('gmail', 'v1', credentials=credentials)```
   ```

こんな感じで認証情報を渡す。

こうすると、ログインしたユーザーのメールが取得できる。

## こんな概念もあるよ

[サービス アカウントの権限借用の管理  |  IAM のドキュメント  |  Google Cloud](https://cloud.google.com/iam/docs/impersonating-service-accounts)

今回の話とは関係ないかも。