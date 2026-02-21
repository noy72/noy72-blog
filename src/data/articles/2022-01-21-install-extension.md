---
title: Selenium 4 で Firefox に拡張機能をインストールする
tags: ["Selenium", "ブラウザー拡張機能"]
thumbnail: "https://i.imgur.com/UOmSLAgm.webp"
---

Selenium で拡張機能がインストールされたブラウザを操作する方法を調べた。

拡張機能の開発について詳しくは [アドオン - Mozilla | MDN](https://developer.mozilla.org/ja/docs/Mozilla/Add-ons) を参照。

### 環境

- Intel Mac
- Python 3.9.10

## 準備

### Selenium

Selenium をインストールする。今回はバージョン 4.1.0 を使う。

### Firefox Browser

Mozilla によって署名されていないアドオン（拡張機能はアドオンに含まれる）はインストールできない。ただし、Firefox の中でも一部のバージョンでは設定を変更することでインストールが可能である。

> Firefox [延長サポート版 (ESR)](https://www.mozilla.org/firefox/organizations/)、Firefox [Developer Edition](https://www.mozilla.org/firefox/developer/) および [Nightly](https://nightly.mozilla.org/) バージョンでは、[Firefox の設定エディター](https://support.mozilla.org/ja/kb/about-config-editor-firefox) (_about:config_ ページ) で xpinstall.signatures.required 設定の値を **false** に変更することで、アドオン署名の強制を無効にできます。  
> [
> Firefox のアドオン署名 | Firefox ヘルプ
> ](https://support.mozilla.org/ja/kb/add-on-signing-in-firefox)

個人的に利用するだけであれば署名なしで利用できるバージョンを選んだほうが良い。今回はFirefox Developer Edition を brew でインストールした。バージョンは 97.0 である。

**余談**：Waterfox Classic ではうまくいかなかったので Firefox Developer Edition に変更したという経緯がある。ブラウザのバージョンが古いと動かすのが大変かもしれない。

## geckodriver

[GitHub - mozilla/geckodriver: WebDriver for Firefox](https://github.com/mozilla/geckodriver) からダウンロードする。今回は 0.30.0 を使う。

## 拡張機能を作る

例として https://www.google.com/ に設定した文字列を表示するだけの拡張機能を作る。拡張機能の作り方は [初めての拡張機能 - Mozilla | MDN](https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#writing_the_extension) が参考になる。

`src` ディレクトリ以下に、設定ファイルと実行するスクリプトを置く。

```json:title=manifest.json
{
    "manifest_version": 2,
    "name": "Sample Extension",
    "version": "1.0",
    "content_scripts": [
        {
            "matches": [
                "*://www.google.com/"
            ],
            "js": [
                "main.js"
            ]
        }
    ]
}
```

```javascript:title=main.js
(function () {
    const div = document.getElementById('SIvCob')
    div.innerText = "拡張機能がインストールされました。"
})();
```

拡張機能の設定が間違っていると当然読み込めない。Selenium でインストールに失敗したときのエラーメッセージでは詳細が全くわからないので、ブラウザからインストールして正しく読み込めるか試すと良い。

> Firefox で "about:debugging" を開き、"一時的なアドオンを読み込む" をクリックし、自分で作成した manifest.json ファイルを選択してください。拡張機能のアイコンが Firefox のツールバーに表示されているはずです。  
> https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Your_second_WebExtension

## Selenium で動かす

以下のように書ける。

```python:title=test_extension.py
import unittest
from pathlib import Path
from time import sleep

from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service


class TestExtension(unittest.TestCase):

    def setUp(self) -> None:
        service = Service(executable_path='./geckodriver')
        options = Options()
        options.binary = "/usr/local/Caskroom/firefox-developer-edition/latest/Firefox Developer Edition.app/Contents/MacOS/firefox-bin"
        d = webdriver.Firefox(
            service=service,
            options=options,
        )
        d.install_addon(str(Path('./src').resolve()), temporary=True)
        self.driver = d

    def test_delete_logo(self) -> None:
        self.driver.get("https://www.google.com")
        sleep(10)
        self.driver.close()
```

ディレクトリ構造はこのようになっている。

```
.
├── geckodriver
├── src
│   ├── main.js
│   └── manifest.json
└── test_extension.py
```

Firefox の特定のバージョンを利用している場合は `options.binary` にバイナリのパスを与える必要がある。参考：[firefoxOptions - WebDriver | MDN](https://developer.mozilla.org/en-US/docs/Web/WebDriver/Capabilities/firefoxOptions)

geckodriver は上記の書き方以外にも環境変数で設定しておくこともできる。

`install_addon` に与えるパスは絶対パスで `manifest.json` が入っているディレクトリを示す必要がある。ブラウザからだと `manifest.json` を選択するように指示されるが、ここではディレクトリを示す。`temporary` が `True` でないとインストールできない。

Selenium の実行方法を調べるとサンプルコードがたくさん出てくるが、現在のバージョンでは非推奨になっている部分もあった。`Profile()`を使っていたり `webdriver.Firefox(executable_path＝"/path/to/geckodriver")` にしていると警告がたくさん出てくるので使わないようにした。

警告を止めようと思ってドキュメントを読んでもよくわからなかったのでコードを読んで調べた。間違った書き方をしている可能性は十分にある。

https://i.imgur.com/UOmSLAg
拡張機能がインストールされました

##temporary=False の場合

このように書ける。

```python:title=test_extension.py
import unittest
from pathlib import Path
from time import sleep
from zipfile import ZIP_DEFLATED, ZipFile

from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service


class TestExtension(unittest.TestCase):

    def setUp(self) -> None:
        service = Service(executable_path='./geckodriver')
        options = Options()
        options.set_preference("xpinstall.signatures.required", False)
        options.binary = "/usr/local/Caskroom/firefox-developer-edition/latest/Firefox Developer Edition.app/Contents/MacOS/firefox-bin"
        d = webdriver.Firefox( service=service, options=options,)
        xpi = str(Path("./extension.xpi").resolve())
        with ZipFile(xpi, compression=ZIP_DEFLATED, mode="w") as zip:
            for file in Path('src').glob("*"):
                print(file, file.name)
                with zip.open(file.name, "w") as zip_file:
                    with open(file, "br") as f:
                        zip_file.write(f.read())
        d.install_addon(xpi, temporary=False)
        self.driver = d

    def test_delete_logo(self) -> None:
        self.driver.get("https://www.google.com")
        sleep(10)
        self.driver.close()

```

### manifest.json に id を追加

id がなくても一時的なアドオンとして読み込めるが、一時的なアドオン**ではない**場合は id が必要になる。id がない場合、インストール時に `ERROR_CORRUPT_FILE: The file appears to be corrupt.` というエラーが出る。

### 参考

> [時折、あなたの拡張機能用に ID を指定する必要があります](https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/WebExtensions_and_the_Add-on_ID#when_do_you_need_an_add-on_id)。アドオンの ID が必要なとき、`manifest.json` 内に `applications` キーを入れて `gecko.id` プロパティをセットします:

```json
"applications": {
  "gecko": {
    "id": "borderify@example.com"
  }
}
```

[初めての拡張機能 - Mozilla | MDN](https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension)

###署名がない拡張機能のインストールを許可する

```python
options.set_preference("xpinstall.signatures.required", False)
```

を追加する。`about:config`に出てくる項目はすべてこれで設定できると思う（未確認）。

### xpi ファイルに圧縮する

[zipfile --- ZIP アーカイブの処理 &#8212; Python 3.10.4 ドキュメント](https://docs.python.org/ja/3/library/zipfile.html#module-zipfile) を使えばよい。`compression=ZIP_DEFLATED`でなければいけないという情報を見た気がするが、デフォルトの `compression=ZIP_STORED` でも動いた。

`zip` コマンドが使えるなら以下のようなコマンドで圧縮できる。

```
zip -r -FS ../my-extension.zip * --exclude '*.git*'
```

[Package your extension | Firefox Extension Workshop](https://extensionworkshop.com/documentation/publish/package-your-extension/)

### install_addon する

`xpi` ファイルへの絶対パスを与える。

## 感想

- 拡張機能に関するドキュメントはたくさんある
- ドキュメント読んでもわからないときはコードを眺めるとなんとかなることもある
  - Selenium の話
