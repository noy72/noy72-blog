---
title: vimに構文チェックのプラグインを入れた（C++）
tags: ["開発環境", "Vim"]
---

syntasticとALEを導入しました。

## syntastic

https://i.imgur.com/Oy8jdCt

このようになりました。

### 導入の流れ

https://github.com/vim-syntastic/syntastic|embed

丁寧に書いてあるので、特に迷うこともないと思います。
インストールの手順に沿って、上から順番にコマンドを実行していきましょう。

しかし、その状態ではエラーチェックが行われなかったので、正しく動作しているかを確かめるため以下のコマンドを入力しました。

```
:SyntasticInfo
```

https://i.imgur.com/39SxFZd

明らかに動いていなさそう。

Q&Aによれば、構文チェッカーが有効になっていない可能性があるのこと。
以下を.vimrcに書き込みました。

```
let g:syntastic_cpp_checkers = ['gcc']
```

https://i.imgur.com/786S8Sl

できまし……ん？

errorやwarningが出ます。
構文チェックがc++11に対応していません。

そこで、

```
let g:syntastic_cpp_compiler="gcc"
let g:syntastic_cpp_compiler_options=" -std=c++11"
```

ちゃんとオプションをつけてあげましょう。
これで正しくチェックしてくれるようになりました。

### 導入してわかったこと

#### ファイル上書き時に構文チェックされる。

リアルタイムで更新されると思っていました。
vimrcで設定を変えれば、編集モードに入ったときにチェックしてくれます( [ターミナルからプライベートIPアドレスとMACアドレス、ルーティングテーブルを確認する - bambinya's blog](https://bambinya.hateblo.jp/entry/2015/04/04/234428) )。

#### 割と重い

チェックする時に微妙に止まります。
バニラのvimがぬるぬる動くように感じる程度には止まります。

## w0rp/ale Asynchronous Lint Engine

https://i.imgur.com/5Yg1ESu

こちら [脱VimしようとしてAtomを触ってたけど、やっぱりVimを使うことにした - console.lealog();](https://lealog.hateblo.jp/entry/2017/05/17/145546) で速いとの情報を得たので、早速インストール

https://github.com/w0rp/ale|embed

同じようにインストール。
syntasticがあると衝突するのでアンインストールしておきます。

### 導入してわかったこと

#### syntasticと比べて速い

**確かに速い。** スムーズに動きます。
ただ、エラー箇所を示す矢印（\>\>）の表示がやや遅いです。

## 結論

- ファイルが小さいなら、syntasticが極端に遅くなることはない。
- Asynchronous Lint Engineの方が速い。
- 適当にコマンドをコピペするだけでインストールできる
