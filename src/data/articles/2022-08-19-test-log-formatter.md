---
title: Python の logger の出力をテストする
tags: ["Python"]
thumbnail: "https://i.imgur.com/0QPRQarm.webp"
---

出力されるテキストを文字列として取得する方法を調べた。


<!-- https://i.imgur.com/0QPRQar -->


## 結論
ロガーのハンドラに `StringIO` オブジェクトを渡す。 


## LogRecord を取得する方法
logger の出力をテストする方法として、標準ライブラリにある `assertLogs` や pytest の `caplog` がある。
これらを使えば、[LogRecord Objects](https://docs.python.org/3/library/logging.html#logrecord-objects) を取得でき、与えられたメッセージやメッセージのレベルを確認できる。

ただし、実際に表示される文字列の取得はできない（と思う）。

```python
import logging
import unittest

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

handler = logging.StreamHandler()
handler.setLevel(logging.DEBUG)

formatter = logging.Formatter('<< %(message)s >>')
handler.setFormatter(formatter)

logger.addHandler(handler)


class TestLogger(unittest.TestCase):
    def test_log(self):
        with self.assertLogs() as cm:
            logger.info("info message")
            print("print", cm.output)
            print("print", cm.records[0].getMessage())
```

出力:
```
% python3 -m unittest test.py
<< info message >>
print ['INFO:test:info message']
print info message
.
----------------------------------------------------------------------
Ran 1 test in 0.000s

OK
```

logger の出力は `<< info message >>` だが、LogRecord にあるメッセージは `info message` である。

## StringIO を使う
[logging.StreamHandler](https://docs.python.org/3/library/logging.handlers.html#logging.StreamHandler) は stream を受け取ることができる。
ここで StringIO を渡せば、ログ出力後にそのオブジェクトから出力した文字列が取得できる。

```python
import logging
import unittest
from io import StringIO

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

buffer = StringIO()
handler = logging.StreamHandler(buffer)
handler.setLevel(logging.DEBUG)

formatter = logging.Formatter('<< %(message)s >>')
handler.setFormatter(formatter)

logger.addHandler(handler)


class TestLogger(unittest.TestCase):
    def test_log(self):
        with self.assertLogs() as cm:
            logger.info("info message")
            print(buffer.getvalue())  # << info message >>
```

buffer を使い回すと `getvalue` で取れる文字列がどんどん増えていくので、テストをちゃんと書くなら、`setUp` メソッド内で logger や StringIO オブジェクトを初期化した方が良い。


ということを [madzak/python-json-logger: Json Formatter for the standard python logger](https://github.com/madzak/python-json-logger) のテストを見て知った。ありがとう……先駆者の方……
