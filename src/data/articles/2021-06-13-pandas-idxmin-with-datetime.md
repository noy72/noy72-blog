---
title: idxmin() で TypeError; argmin() got an unexpected keyword argument 'skipna' が起こる 
tags: ["Python"]


---

idxmin() にハマった．

## 起こったこと

`idxmin()`でエラーが起こる．"unexpected" といわれているが，`skipna`はキーワード引数に存在する．

[pandas.DataFrame.idxmin &#8212; pandas 1.4.2 documentation](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.idxmin.html)

```python
time = datetime.datetime.strptime(
    '2021-05-09 00:00:00.420000+00:00',
    '%Y-%m-%d %H:%M:%S.%f%z'
)
print(time)  # 2021-05-09 00:00:00.420000+00:00
df = pd.DataFrame(
    [[time, time]],
    columns=['a', 'b'],
)
print(df.idxmin(axis=1))  # TypeError: argmin() got an unexpected keyword argument 'skipna'
```

## 解決法

UTCオフセットを消す．`pandas.Series`で時系列を表現しているなら，`s.tz_localize(None)`でUTCオフセットを消せる．

[pandas.Series.tz_localize &#8212; pandas 1.4.2 documentation](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.Series.tz_localize.html)

```python
time = datetime.datetime.strptime(
    '2021-05-09 00:00:00.420000',
    '%Y-%m-%d %H:%M:%S.%f'
)
print(time)  # 2021-05-09 00:00:00.420000
df = pd.DataFrame(
    [[time, time]],
    columns=['a', 'b'],
)
print(df.idxmin(axis=1))
#  0    a
#  dtype: object
```

## その他

比較できない値の場合は以下のようなエラーが出る．`[[time, 'aaa']]` のようなデータを与えても以下のようなエラーが出る．

```python
 df = pd.DataFrame(
     [[123, 'aa']],
     columns=['a', 'b'],
)
print(df.idxmin(axis=1))  # TypeError: reduction operation 'argmin' not allowed for this dtype
```

`TypeError: argmin() got an unexpected keyword argument 'skipna'`というエラーに惑わされたせいで余計な時間を使ってしまった．