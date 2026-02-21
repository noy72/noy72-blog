---
title: vimで構文ハイライトをいじった
tags: ["開発環境", "Vim"]
thumbnail: "https://i.imgur.com/icp3jFwm.webp"
---

自作マクロに色がつくようにした。

https://i.imgur.com/icp3jFw|0.7

こんな感じに。

## おしゃれしたい

競技プログラミングでよく使うマクロやデータ構造に色をつけたくなったので構文ハイライトをいじった。

これでforとrepが肩を並べるよう（同じ色）になり、デバッグ用のマクロが目立つようになった。
あと、色がついて気分が良くなる。正直、あまり意味はない。

## 構文ファイル

自分はデフォルトのカラースキームを利用している。
whichやls -lでvimフォルダを探し出し、その中のcpp.vimファイルを変更することでハイライトを変更できた。

```
syn keyword cppType vector map
syn keyword cppStatement rep range
syn keyword cppConstant INF
syn keyword cppRawStringDelimiter debug show
```

cppRawStringDelimiterが何を表しているかはわからないが、とにかく目立つ色なのでdebug用マクロに設定。
cppTypeだけ長くなったので省略。

無駄にカラフルになって読みにくくなりそうである。
