---
title: Pool.imap で引数の関数が実行されるタイミングについてメモ
tags: ["Python"]
---

Pool.imapを使ったときの挙動がわかっていなかったので調べた．

Generator を使ったコードを以下に示す．

```python
def get_time(x=None):
    sleep(1)
    return datetime.now().time()


def generator():
    while True:
        yield get_time()


if __name__ == '__main__':
    it = generator()
    sleep(5)
    print(datetime.now().time(), 'Begin')
    print(next(it))
    print(next(it))
    print(next(it))
    print(datetime.now().time(), 'End')
```

上記のコードの実行結果は以下のようになる．

```
12:01:04.985315 Begin
12:01:05.986125
12:01:06.989681
12:01:07.993368
12:01:07.993416 End
```

`get_time`は，呼ぶと1秒待ってから現在時刻を返す．
`next(it)`によって`get_time`が呼ばれるため，約1秒毎に現在時刻を返す．

`Pool.imap` を使ったコードを以下に示す．
ここで呼ばれている`get_time`は上記のコードと同様である．

```python
if __name__ == '__main__':
    with Pool(processes=2) as p:
        it = p.imap(get_time, [1, 2, 3])
        sleep(5)
        print(datetime.now().time(), 'Begin')
        print(next(it))
        print(next(it))
        print(next(it))
        print(datetime.now().time(), 'End')
```

実行結果は以下のようになる．

```
12:01:13.042683 Begin
12:01:09.043455
12:01:09.043456
12:01:10.044876
12:01:13.043180 End
```

`next(it)`が呼ばれているのは`print(datetime.now().time(), 'Begin')`の後だが，出力された時刻は`Begin`の時点より早い．

Generator を使ったコードでは，`next(it)`を呼び出した時点で`get_time`が呼び出される．

一方で，`Pool.imap` を使ったコードでは，`Pool.imap` を実行した時点で `get_time` が実行され始める．
`sleep(5)` で待機している間に，`get_time` の三度の呼び出しが非同期で実行され，結果が保持される．
その後の `next(it)` では，すでに実行した `get_time` の結果を返すだけで，`get_time` の実行はされない．
