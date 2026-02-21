---
title: Fomantic-UI を import すると Webpack でバンドルできない問題
tags: ["フロントエンド"]
thumbnail: "https://i.imgur.com/9EoDhLem.webp"
---

結局原因はよくわかっていない。



https://i.imgur.com/9EoDhLe|0.7



## 状態

Electron アプリの開発中に起きた出来事。

[fomantic/Fomantic-UI-CSS: CSS only distribution of Fomantic UI](https://github.com/fomantic/Fomantic-UI-CSS) のバージョン 2.8.8 をインストールし、Renderer プロセスで `import 'fomantic-ui-css/semantic.min.css';` を書いて `electron-forge start` すると以下のエラーが出た。

```
ERROR in data:application/x-font-ttf;...
...
Module build failed: UnhandledSchemeError: Reading from "data:application/x-font-ttf;...
...
...is not handled by plugins (Unhandled scheme).
Webpack supports "data:" and "file:" URIs by default.
You may need an additional plugin to handle "data:" URIs.
```

`...` の部分はエンコードされたフォント（長い文字列）が出力されている。「"data:" を扱うためにプラグインを追加する必要があるかも」とエラーメッセージに出ているが、Renderer プロセスで base64 でエンコードした画像を表示しているので "data:" は扱えてはいる。



## Issue

探していたら以下のイシューを見つけた。エラー内容も同じ。コメントの内容は「バグ修正されたバージョン使えばいいよ」とのこと。

[Module build failed: UnhandledSchemeError: Reading from "data:application/x-font-ttf;charset=utf-8 · Issue #4227 · Semantic-Org/Semantic-UI-React](https://github.com/Semantic-Org/Semantic-UI-React/issues/4227#issuecomment-996152895)



[fomantic/Fomantic-UI: Fomantic-UI is a community fork of Semantic-UI](https://github.com/fomantic/Fomantic-UI) の 2.9.0-beta.194 をインストールして `import "fomantic-ui/dist/semantic.min.css";` と書いたらエラーが起きずに動いた。2.8.8 だとエラーが起きた。同じだからそりゃそうか。



## 感想

エラーで調べるときはエラーメッセージで検索をかけることが多いけど、それでうまくいかなかったらさっさとイシューを見た方が良さそう。あまりイシューを見る文化が身に付いていない。