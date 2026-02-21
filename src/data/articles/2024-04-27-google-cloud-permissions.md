---
title: Google Cloud である権限を持っているプリンシパルを検索する
tags: ["Google Cloud"]
thumbnail: "https://i.imgur.com/qiHThiem.webp"
---

「〇〇の読み取り権限持っているのは誰？」「〇〇の読み取り権限を持つロールはどれ？」を検索する方法。


https://i.imgur.com/qiHThie|0.8

## ある権限を持つプリンシパルを検索する

[Policy Analyzer](https://console.cloud.google.com/iam-admin/analyzer/query) を使う。

[IAM ポリシー用の Policy Analyzer  |  Policy Intelligence  |  Google Cloud](https://cloud.google.com/policy-intelligence/docs/policy-analyzer-overview?hl=ja) 

「XX プロジェクトで YY 権限を持つのは誰？」が検索できる。
クエリのスコープがプロジェクトの場合、親フォルダから継承されたプリンシパルは結果に出ない。


## ロールが持っている権限を一覧する

[gcloud iam roles describe](https://cloud.google.com/sdk/gcloud/reference/iam/roles/describe) コマンドを使う。

`grep` して一部だけ表示したり。
```bash
$ gcloud iam roles describe roles/owner | grep logging.fields.access
- logging.fields.access
```

## 「セキュリティ分析情報」はソートされていない
IAM ページの「セキュリティ分析情報」カラムをクリックすると、権限が一覧される（この記事上部の画像がそれ）がソートされているわけではない。

ブラウザ内検索も部分的にしか行えない。
