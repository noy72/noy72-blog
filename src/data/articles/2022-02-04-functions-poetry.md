---
title: Poetry で開発して Cloud Functions にデプロイする
tags: ["Python", "Google Cloud"]
---

requirements.txt を生成する方法をメモ


結論：以下のコマンドで生成する。
```
!poetry export -f requirements.txt --output src/requirements.txt --without-hashes
```

<br>

Cloud Functions では pip を使うので、Poetry で開発している場合は requirements.txt を生成する必要がある。

> Python で記述された Cloud Functions の依存関係を指定するには、2 つの方法があります。1 つは [pip](https://pip.pypa.io/en/stable/) パッケージ マネージャーの `requirements.txt` ファイルを使用する方法、もう 1 つは関数と一緒にローカル依存関係をパッケージ化する方法です。  
>
> [Python での依存関係の指定  |  Google Cloud Functions に関するドキュメント](https://cloud.google.com/functions/docs/writing/specifying-dependencies-python)



## 試す

### 依存関係

Poetry で requests パッケージをインストールする。



### コード

[Python クイックスタート  |  Google Cloud Functions に関するドキュメント](https://cloud.google.com/functions/docs/quickstart-python)

このドキュメントのコードをほぼそのまま使う。`import requests`を追加しておく。



### ディレクトリ構造

```
.
├── poetry.lock
├── pyproject.toml
├── venv
│   └── ...
└── src
    └── main.py
```



## デプロイコマンド

[gcloud functions deploy  |  Google Cloud CLI Documentation](https://cloud.google.com/sdk/gcloud/reference/functions/deploy)

```
gcloud functions deploy my_function \
    --runtime=python39 \
    --entry-point=hello_world \
    --source=src \
    --trigger-http \
    --project=<Project名>
```



`requirements.txt` がない状態でデプロイすると、当然 requests が見つからないのでエラーが返ってくる。

```
ERROR: (gcloud.functions.deploy) OperationError: code=3, message=Function failed on loading user code. This is likely due to a bug in the user code. Error message: Error: please examine your function logs to see the error cause: https://cloud.google.com/functions/docs/monitoring/logging#viewing_logs. Additional troubleshooting documentation can be found at https://cloud.google.com/functions/docs/troubleshooting#logging. Please visit https://cloud.google.com/functions/docs/troubleshooting for in-depth troubleshooting documentation.
```



## requirements.txt

### pip freeze

```bash
pip freeze > src/requirements.txt
```

以下のような形式でパッケージ名が列挙される。

```bash:title=requirements.txt
requests @ file:///Users/noy72/Library/Caches/pypoetry/artifacts/ff/f3/bc/a6781f93c2f9488431db494169bb514a083a1d77f3c325a277d8699398/requests-2.27.1-py2.py3-none-any.whl
```

デプロイすると当然エラーが起こる。

```
ERROR: Could not install packages due to an OSError: [Errno 2] No such file or directory: '/Users/noy72/Library/Caches/pypoetry/artifacts/71/9a/ba/a51b34ce9aacf9ac5dbb90d7c7335877522ee188189d9a521ee1a9c411/certifi-2021.10.8-py2.py3-none-any.whl'; Error ID: c84b3231
```



## poetry export

[Commands | Documentation | Poetry - Python dependency management and packaging made easy](https://python-poetry.org/docs/cli/#export)

poetry で requirements.txt を生成する。

```bash
poetry export -f requirements.txt --output src/requirements.txt
```

以下のような形式になる。

```bash:title=requirements.txt
requests==2.27.1; (python_version >= "2.7" and python_full_version < "3.0.0") or (python_full_version >= "3.6.0") \
    --hash=sha256:f22fa1e554c9ddfd16e6e41ac79759e17be9e492b3587efa038054674760e72d \
    --hash=sha256:68d7c56fd5a8999887728ef304a6d12edc7be74f1cfa47714fc8b414525c9a61
```

デプロイすると `== 使ってね、ハッシュはダメだよ` 的なエラーが出るはず……と思ったらデプロイできた。なんで？

## poetry export --without-hashes
Poetry で export したのにエラーが出る場合は `--without-hashes` オプションを使う。

```bash
poetry export -f requirements.txt --output src/requirements.txt --without-hashes
```

以下のような形式になる。
```bash:title=requirements.txt
requests==2.27.1; (python_version >= "2.7" and python_full_version < "3.0.0") or (python_full_version >= "3.6.0")
```
