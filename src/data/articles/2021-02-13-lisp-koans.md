---
title: lisp公案をやった
tags: ["Lisp"]
thumbnail: "https://i.imgur.com/dRmgM8Om.webp"
---

Googleが公開しているlisp-koansを解いた．

https://i.imgur.com/dRmgM8O

https://github.com/google/lisp-koans|embed

lispを書いた経験は，Land of lispを写経したぐらい．環境はvim + vlime．2, 3 時間ぐらいで終わるかと思ったら，まったくそんな量ではなかった．

lisp-koansは，例えるなら計算ドリル．テストに成功するように，プログラム中の穴が開いている部分を埋める．内容はlispの関数や構文についてで，問題の多くは関数の戻り値を問うものである．アルゴリズムに関する問題はない．

問題だけがずらずら並んでいるのではなくて，所々に説明も入っているため，問題集を解いているような気分になった．問題の解答もついているので，詰まって先に進めなくなるといったことは起こらない．lisp-koansは単なる問題集としてではなく，lispの関数や構文を確認するためのチートシート的な使い方もできるかもしれない．

前半部分は馴染みのある内容で分かりやすいけど，後半のマクロやCLOS（Common Lisp Object System）は，問題中の説明だけではわからないと思う（実際，自分はあまりわかっていない）．

## 参考サイト

lispを書くのに参考になる（なりそうな）サイト．

- [Common Lisp the Language, 2nd Edition](https://www.cs.cmu.edu/Groups/AI/html/cltl/clm/index.html)  
  関数の一覧．
- [Practical Common Lisp](http://www.gigamonkeys.com/book/)  
  詳しい説明が欲しいときに．
- [cl-cookbook](https://lispcookbook.github.io/cl-cookbook/)  
  上記と同じ．さらに，このサイトの「Other CL Resources」には書籍やサイトのリンクが複数ある．

## vlimeメモ

- `\cc`: サーバに接続．
- `\ss` : 式の評価．
- `\i`: インタラクションモードに入る / 戻る．カーソルが式の上にある状態でエンターを押すと，式が評価される．
- `<CTRL>-x <CTRL>-o`: omni-completion
- `\dda`: リファレンスを表示．
- `\of`: コンパイル
