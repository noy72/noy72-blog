---
title: 『Atomic Design 堅牢で使いやすいUIを効率良く設計する』を読んだ
tags: ["技術書", "UI", "フロントエンド"]
---

UIの設計を勉強した．

https://gihyo.jp/book/2018/978-4-7741-9705-0|embed

非職業プログラマがAtomic Designを読んだ感想．

## 背景

ReactのチュートリアルをやったりDocsを読んだりしたけど，どうやってUIを作るのかがイマイチわからない．デザインモックからUIを実装する例が[ここ](https://ja.reactjs.org/docs/thinking-in-react.html)にあるが，もう少し詳細な説明が欲しいところ．UIを分割して階層構造を持たせるのはわかるけど……　しかも，世間では関数コンポーネントを使ってUIを構築したりするそう．クラスコンポーネントしかしらないよ！．

そこでとりあえず読んだのがAtomic Design．結論から言うと読んで良かった．

## Atomic Designとはなんぞや

> Atomic Design は小さいUIコンポーネントを組み合わせてより大きなコンポーネントを作っていくためのデザイン・フレームワークです．(p.66)

UIコンポーネントを粒度（抽象度）ごとに分類して，それらを組み合わせてコンポーネントやアプリケーションを作る方法．React公式の例ではUIコンポーネントが木構造になっているようなイメージで，Atomic Designの方はDAG（有向無閉路グラフ）になっているイメージ．

分類は，小さい方からAtoms, Molecules, Organisms, Templates, Pageと分かれている．分類をする際は，コンポーネントがどんな責務を負っているのか（どんなことに関心があるのか）に注目する．例えば，Templatesに分類されたコンポーネントは，「何を表示するか」ではなく，「画面全体のレイアウト」にだけ関心を持つ．各コンポーネントが1つの責務だけ持つことで，それだけに集中して開発ができる．

## この分類でなくともよい

原著の[このあたり](https://atomicdesign.bradfrost.com/chapter-2/#whats-in-a-name)で，以下のように述べている．

> Ultimately, whatever taxonomy you choose to work with should help you and your organization communicate more effectively in order to craft an amazing UI design system.

Atomic Designに限った話ではないけど，どんな手法を使うかは大事ではなくて，決められた手法に従うことでより効果的にコミュニケーションが取れるかどうかが大事．必要の応じて分類法を減らしたり増やしたりして使いやすいようにアレンジしてもよい．

## 読んだ感想

### Storybookが便利

UIコンポーネントの作成で困ったのが，期待通りに表示されているかを確認するのが面倒ということ．本書ではStorybookというUIコンポーネント開発環境を使っている．

Storybookは作成したコンポーネントを個別に表示できる．そのため，コンポーネント作成→Storybookで確認→間違いを修正→確認→……と開発を進めることができる．ユニットテストの元で関数を実装しているのと同様の気持ちで開発が進められる．

### 1つのコンポーネントに1つの責務という考え

本書では，コンポーネントが複数の責務を持たないようにコードを小さく分割している．このような，「このコンポーネント（関数，クラス）は何に責務を負っているか」に注目して実装を分割するのは，『[Clean Code](https://asciidwango.jp/post/171118672245/clean-code)』にもあるように，UIコンポーネントの開発に限った話ではない．サンプルコードを追うことで，「責務に注目する」というコードを書く上での基礎となる部分の練習ができる．

### 手を動かせるようになる

小さいものをはじめに作り，それを組み合わせて徐々に大きいものを作ることを体験できる．UIコンポーネントはどこから手をつけていけばいいのかわからなかったけど，手が動かせるようになったので，個人的にはよかった．

ただ，開発の方法を学んだだけなので，実際に作るのはやっぱり難しい．Storybookを見てはCSSを書き直し，見ては書き直し……を繰り返している．

### レイアウトはAtoms ？　Templates?

Atomsに分類されるものの例として，テキストやボタン，レイアウト・パターンを挙げている．前2つはいいとして，Atomsにレイアウト・パターンが入るのはなぜなのか？　Templatesじゃない？

> Atomic Design の大きな特徴の1つは，Atoms，Molecules，Organisms，と化学用語が続いた後で，Templates，Pages と通常の開発用語が登場することです．ここには，「開発者だけで使う用語」と「開発者以外に対しても使う用語」という区別が表現されています．(p.68)

　

> レイアウトは，特定のコンテンツに依存しない機能なので，Atoms 層のコンポーネントとして作成するといいでしょう．(p.77)

　

> Templates 層はその名の通りページの雛形です．(中略）Templates 層のコンポーネントに実際のコンテンツを流し込んだものが Pages です．(p.90)

Atomsにあるレイアウト・パターンもTemplatesも，何らかのレイアウトを決めるという点では両方同じ．ただし，TemplatesはPagesのレイアウトを決めるもので，Atomsのレイアウト・パターンはMoleculesやOrganismsのレイアウトを決めるものという気がする．別の言い方をすると，Templatesはユーザーとって必要な情報が適切な場所に置かれているかに関心を持ち，Atomsのレイアウト・パターンは単にコンポーネントが想定された通りに配置されているかに関心を持つんじゃないかと思う．

## 関連サイト

<!-- https://atomicdesign.bradfrost.com/|embed 原著のサイト． <br> -->

https://bradfrost.com/blog/post/extending-atomic-design/|embed

原著の著者のブログ．Atomic designの拡張について．

### Atomic designに関する記事

https://tech.ga-tech.co.jp/entry/react-give-up-atomic-design|embed

Atomic Designをやめた事例．コンポーネントの分類にコストがかかってしまうこと，プロダクトの性質によってはAtomic Designの運用がうまくいかないことを書いている．

<br>

https://tech.connehito.com/entry/learn-and-failure-atomic-design|embed

Atomic designでハマったポイントとかを書いている．
