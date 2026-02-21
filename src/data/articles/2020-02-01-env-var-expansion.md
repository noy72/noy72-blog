---
title: subprocess.runで環境変数を展開する
tags: ["Python"]
---

pythonで環境変数を展開する方法を調べた．

## subprocessで展開する

```
> echo $HOGE
hogehoge
```

のような環境変数が定義されているとする．

以下のソースコードを実行すると，環境変数が展開されずに`$HOGE`が出力される．

```python
import subprocess

subprocess.run(['echo', '$HOGE']) # 出力：$HOGE
```

subprocessでは，環境変数の展開に限らず，ワイルドカードやチルダによるホームディレクトリの展開ができない．
上記の機能を使いたい場合は，`shell`オプションを有効にする．

```python
import subprocess

subprocess.run(['echo $HOGE'], shell=True) # 出力：hogehoge
```

これで環境変数が展開できる．

## Pythonドキュメントに書いてあること

> shell が True なら、指定されたコマンドはシェルによって実行されます。あなたが Python を主として (ほとんどのシステムシェル以上の) 強化された制御フローのために使用していて、さらにシェルパイプ、ファイル名ワイルドカード、環境変数展開、~ のユーザーホームディレクトリへの展開のような他のシェル機能への簡単なアクセスを望むなら、これは有用かもしれません。しかしながら、Python 自身が多くのシェル的な機能の実装を提供していることに注意してください (特に glob, fnmatch, os.walk(), os.path.expandvars(), os.path.expanduser(), shutil)。

引用元：[subprocess --- サブプロセス管理 &#8212; Python 3.10.4 ドキュメント](https://docs.python.org/ja/3/library/subprocess.html)

例えば，環境変数を得るなら，`expandvars`を使えば良い．

```python
import os

print(os.path.expandvars("$HOGE")) # 出力：hogehoge
```

## 思ったこと

subprocessまみれにしてPythonでシェルスリプトを書くのはやめたほうがいいと思う．
