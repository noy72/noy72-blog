---
title: Pytest の fixture の実行例
tags: ["Python"]
thumbnail: "https://i.imgur.com/0QPRQarm.webp"
---

実際に動かして確かめた。

<!-- https://i.imgur.com/0QPRQar -->

`scope` を変えながら以下のテストを実行して出力を見る。

```python
import pytest

count = 0


@pytest.fixture(scope="<ここを変える>")
def fixture():
    print("FIXTURE")

    global count
    count += 1
    return count


def test_func_a(fixture):
    print("func_a - ", fixture)


def test_func_b(fixture):
    print("func_b - ", fixture)


class TestClass:
    def test_class_func_a(self, fixture):
        print("class_func_a - ", fixture)

    def test_class_func_b(self, fixture):
        print("class_func_b - ", fixture)
```

`pytest -qrP <file>` で実行した。

## function

```
....                                                                     [100%]
==================================== PASSES ====================================
_________________________________ test_func_a __________________________________
---------------------------- Captured stdout setup -----------------------------
FIXTURE
----------------------------- Captured stdout call -----------------------------
func_a -  1
_________________________________ test_func_b __________________________________
---------------------------- Captured stdout setup -----------------------------
FIXTURE
----------------------------- Captured stdout call -----------------------------
func_b -  2
_________________________ TestClass.test_class_func_a __________________________
---------------------------- Captured stdout setup -----------------------------
FIXTURE
----------------------------- Captured stdout call -----------------------------
class_func_a -  3
_________________________ TestClass.test_class_func_b __________________________
---------------------------- Captured stdout setup -----------------------------
FIXTURE
----------------------------- Captured stdout call -----------------------------
class_func_b -  4
4 passed in 0.02s
```

各関数の実行時に `fixture()` が実行されている。

## class

```
....                                                                     [100%]
==================================== PASSES ====================================
_________________________________ test_func_a __________________________________
---------------------------- Captured stdout setup -----------------------------
FIXTURE
----------------------------- Captured stdout call -----------------------------
func_a -  1
_________________________________ test_func_b __________________________________
---------------------------- Captured stdout setup -----------------------------
FIXTURE
----------------------------- Captured stdout call -----------------------------
func_b -  2
_________________________ TestClass.test_class_func_a __________________________
---------------------------- Captured stdout setup -----------------------------
FIXTURE
----------------------------- Captured stdout call -----------------------------
class_func_a -  3
_________________________ TestClass.test_class_func_b __________________________
----------------------------- Captured stdout call -----------------------------
class_func_b -  3
4 passed in 0.02s
```

`TestClass` のふたつのテストメソッドが実行されているが `fixture()` は一度しか実行されていない。一方でクラスの外にある関数は両方とも `fixture()` が実行されている。

## module

```
....                                                                     [100%]
==================================== PASSES ====================================
_________________________________ test_func_a __________________________________
---------------------------- Captured stdout setup -----------------------------
FIXTURE
----------------------------- Captured stdout call -----------------------------
func_a -  1
_________________________________ test_func_b __________________________________
----------------------------- Captured stdout call -----------------------------
func_b -  1
_________________________ TestClass.test_class_func_a __________________________
----------------------------- Captured stdout call -----------------------------
class_func_a -  1
_________________________ TestClass.test_class_func_b __________________________
----------------------------- Captured stdout call -----------------------------
class_func_b -  1
4 passed in 0.02s
```

1 度しか `fixture()` が実行されていない。

## まとめ

fixture には `scope` を設定できる。`scope` が指定された fixture は、そのスコープ内では 2 度以上実行されない。2 度目以降の要求ではその fixture が最後に返した値が返ってきていそう。

テストクラスを実行する際に初期化をちょうど 1 度だけ行いたい場合は、`scope`が `class` である fixture を作成し、クラス内の各テストメソッドでその fixture を要求すれば良い。
