---
title: multiprocessing.pool.Pool のサブプロセスはどう動くか
tags: ["Python"]
thumbnail: "https://i.imgur.com/0QPRQarm.webp"
---

並列実行について調べた



<!-- https://i.imgur.com/0QPRQar -->



[multiprocessing --- プロセスベースの並列処理 — Python 3.10.4 ドキュメント](https://docs.python.org/ja/3/library/multiprocessing.html#module-multiprocessing.pool)



## グローバル変数を共有しているように見える

```python
import multiprocessing as mp
from time import sleep

x = 0


def add(n):
    global x
    x += n
    return x


if __name__ == "__main__":
    with mp.Pool(5) as p:
        print(p.map(add, [1] * 5))
```

上記のコードを実行すると、たまに `[1, 2, 3, 4, 5]` が出力される。これだけ見ると各プロセスが `x` を共有して加算していっているように見える……気がする……

当然これはグローバル変数を共有しているのではなく、**同じプロセスで `add` を実行しているだけ**である 。`add` 関数内で `os.getpid` や `multiprocessing.current_process` で `pid` やワーカー名を確認してみるとそれがわかる。

`add` 関数内で `sleep(1)` したりすると大抵は別プロセスで動くはず。



## 処理方法を想像する

↓のように動いていて、タスクを完了したワーカーはまたワーカーキューに `put` される、と想像していた。

https://i.imgur.com/qBe8h1b
キューの先頭をマッチングする



[実装](https://github.com/python/cpython/blob/f4c03484da59049eb62a9bf7777b963e2267d187/Lib/multiprocessing/pool.py#L97)を眺めてみると、ワーカーみんなでタスクキューを `get` しているように見える。つまり↓みたいな感じ。



https://i.imgur.com/MQxZ37j
複数のワーカーがタスクキューからタスクを取り出す



「タスクキューの先頭のタスクを取得して実行する関数」を指定された個数の `Process` で実行している。確かに、ワーカーをキューに入れて先頭から割り当てる必要は全くない。暇なワーカーが勝手にタスクをこなしてくれれば良い。

`Pool.map` で 1 つのワーカーしか動かない理由は、たまたまもっとも早く動いた `Process` が、別の `Process` が動く前に全てのタスクを完了させたからだと思う（本当かは怪しい）。

実装はこの辺り → [cpython/pool.py at f4c03484da59049eb62a9bf7777b963e2267d187 · python/cpython](https://github.com/python/cpython/blob/f4c03484da59049eb62a9bf7777b963e2267d187/Lib/multiprocessing/pool.py#L312)



### 順序は不定

`for` で順番に `Process.start` しても関数の実行順序は一定ではない。

```python
import multiprocessing as mp


def func(n):
    print(f"{n}: {mp.current_process().name}")


if __name__ == "__main__":
    pool = []
    for i in range(1, 10):
        p = mp.Process(target=func, args=(i,))
        print(p.name)
        p.start()
        pool.append(p)

    for p in pool:
        p.join()

```

**出力**

```
Process-1
Process-2
Process-3
Process-4
Process-5
Process-6
Process-7
Process-8
Process-9
4: Process-4
2: Process-2
1: Process-1
3: Process-3
6: Process-6
5: Process-5
8: Process-8
7: Process-7
9: Process-9
```

`Pool.map` で最初に動く `Process` がどれかもわからない。



## 感想

並列・並行、プロセス・スレッドみたいな話題が出るとめちゃくちゃあやふやな理解でいることに気がついた。トランザクション処理とか何も考えずに実装してバグに苦しみそう。

