---
title: Node.js を使った小さな CLI アプリケーションを作る
tags: ["JavaScript", "Node.js", "CLI"]
---

JavaScript Primer の第二部をやったメモ．

https://jsprimer.net/use-case/nodecli/|embed

Markdown形式のファイルを読み込み，HTMLに変換した文字列を出力するアプリケーションを作ります．

## 環境

- macOS catalina
- Node.js v13.13.0
- commander 5.1.0
- marked 1.0.0
- Mocha 7.1.2

## 準備

### Hello world

文字列を表示するだけのコードを書きます．

```javascript:title=main.js
console.log("Hello world");
```

実行して表示できるか確認します．

```
$ node main.js
Hello world
```

### パッケージのインストール

今回は以下のパッケージを使います．

- [GitHub - tj/commander.js: node.js command-line interfaces made easy](https://github.com/tj/commander.js/)

  コマンドライン引数のパース

- [GitHub - markedjs/marked: A markdown parser and compiler. Built for speed.](https://github.com/markedjs/marked)

  Markdown文字列からHTML文字列への変換

- [Mocha - the fun, simple, flexible JavaScript test framework](https://mochajs.org/)

  テストフレームワーク

各パッケージをイストールします．Mochaは開発にしか使用しないため，`--save-dev`オプションを有効にします．

```
$ npm init --yes
$ npm install commander
$ npm install marked
$ npm install --save-dev mocha
```

現在のディレクトリ構成は以下のようになっています．

```
.
├── main.js
├── node_modules
│   └── (省略)
├── package-lock.json
└── package.json
```

## ファイルの読み込み

コマンドライン引数でファイルを指定し，そのファイルの内容をコンソールに出力します．

### コマンドライン引数のパース

インストールした`commander`を使ってコマンドライン引数をパースします．

```javascript:title=main.js
const program = require("commander");

program.parse(process.argv);
console.log(program.args);

const filePath = program.args[0];
console.log(filePath);
```

```
$ node main.js foo bar
[ 'foo', 'bar' ]
foo
```

### ファイルの読み込み

引数でファイルを指定し，そのファイルの内容を出力します．

ファイル読み込みに使う，適当な`.md`のファイルを用意しておきます．

```markdown:title=sample.md
# Sample
hello

- https://sample.com
```

ファイルを読み込み，内容を出力するコードを追加します．ファイルが存在しない場合はエラーメッセージを表示し，プログラムを終了するようにします．

```javascript:title=main.js
const program = require("commander");
const fs = require("fs");

program.parse(process.argv);
const filePath = program.args[0];

fs.readFile(filePath, {encoding: "utf-8"}, (err, file) => {
    if (err) {
        console.log(err.message);
        process.exit(1);
        return;
    }
    console.log(file);
});
```

実行結果は以下のようになります．

```
$ node main.js sample.md
# Sample
hello

- https://sample.com

$ node main.js aaaa.md
ENOENT: no such file or directory, open 'aaaa.md'
```

## Markdownへの変換

[marked](https://github.com/chjj/marked)を使ってMarkdonwをHTMLに変換します．`marked`関数はMarkdown文字列を引数に，HTML文字列を返します．

```javascript
const program = require("commander");
const fs = require("fs");
const marked = require("marked");

program.parse(process.argv);
const filePath = program.args[0];

fs.readFile(filePath, { encoding: "utf-8" }, (err, file) => {
  if (err) {
    console.log(err.message);
    process.exit(1);
    return;
  }
  const html = marked(file);
  console.log(html);
});
```

実行すると，以下のようなHTMLを出力します．

```html
<h1 id="sample">Sample</h1>
<p>hello</p>
<ul>
  <li><a href="https://sample.com">https://sample.com</a></li>
</ul>
```

### gfmオプションを追加する

コマンドライン引数にgfmオプションを追加します．gfmはGithubでのMarkdownの仕様のことです．gfmに合わせた変換を行うかを選択できるようにします．

以下のようなコマンドで実行できるようにします．

```
node main.js sample.md // gfmに合わせない
node main.js --gfm sample.md // gfmに合わせて変換
```

#### オプションを扱う

`option`メソッドで扱いたいオプションを指定したのち，`opts`メソッドで指定されたオプションを得ます．以下はオプションを扱うコード例です．

```javascript
const program = require("commander");

program.option("--foo");
program.option("--bar");
program.parse(process.argv);
console.log(program.opts());
```

```
$ node tmp.js --foo
{ foo: true, bar: undefined }
```

コマンドライン で与えられた`foo`は`ture`に，何も指定されていない`bar`は`undefined`となります．

それでは，gfmオプションを使えるように実装します．

```javascript:title=main.js
const program = require("commander");
const fs = require("fs");
const marked = require("marked");


program.option("--gfm", "GFMを有効にする");
program.parse(process.argv);
const filePath = program.args[0];

fs.readFile(filePath, {encoding: "utf-8"}, (err, file) => {
    if (err) {
        console.log(err.message);
        process.exit(1);
        return;
    }
    const html = marked(file, {
        gfm: program.opts().gfm,
    });
    console.log(html);
});
```

```
$ node main.js sample.md
<h1 id="sample">Sample</h1>
<p>hello</p>
<ul>
<li>https://sample.com</li>
</ul>

$ node main.js --gfm sample.md
<h1 id="sample">Sample</h1>
<p>hello</p>
<ul>
<li><a href="https://sample.com">https://sample.com</a></li>
</ul>

```

`--gfm`の有無によって，変換結果が変わるようになりました．

## ユニットテストを追加する

作成したアプリケーションにユニットテストを追加します．今回は，MarkdownからHTMLの変換部分のテストを書きます．

### モジュール化

現在のコードでは，HTMLへの変換部分のみをテストすることができません．まずは，その部分を分割してテストできる状態にします．

```javascript:title=md2html.js
const marked = require('marked');

module.exports = (markdown, opts) => {
    return marked(markdown, {
        gfm: opts.gfm,
    });
};
```

```javascript:title=main.js
const program = require("commander");
const fs = require("fs");
const md2html = require('./md2html');
...
(略)
...
    const html = md2html(file, program.opts());
    console.log(html);
});
```

`main.js`でMarkdownをHTMLに変更していた部分を`md2html.js`に移動させました．`main.js`からモジュール化した関数を呼び出しています．

### Mochaを実行できるようにする

ユニットテストを実行するために，`package.json`を以下のように書き換えます．

```json:title=package.json
...
  "scripts": {
    "test": "mocha test/"
  },
...
```

`npm test`でテストが実行できるようになりました．

### ユニットテストを記述する

モジュール化ができたので，`md2html.js`のユニットテストを記述します．テストファイルは`test`ディレクトリ以下に保存することにします．

```javascript:title=md2html-test.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const md2html = require("../md2html");

it("converts Markdown to HTML (GFM=false)", () => {
    const sample = fs.readFileSync(
        path.resolve(__dirname, "./fixtures/sample.md"),
        { encoding: "utf8" }
    );
    const expected = fs.readFileSync(
        path.resolve(__dirname, "./fixtures/expected.html"),
        { encoding: "utf8" }
    );

    assert.strictEqual(md2html(sample, { gfm: false }), expected);
});

it("converts Markdown to HTML (GFM=true)", () => {
    const sample = fs.readFileSync(
        path.resolve(__dirname, "./fixtures/sample.md"),
        { encoding: "utf8" }
    );
    const expected = fs.readFileSync(
        path.resolve(__dirname, "./fixtures/expected-gfm.html"),
        { encoding: "utf8" }
    );

    assert.strictEqual(md2html(sample, { gfm: true }), expected);
});
```

このテストケースでは，あらかじめ変換元と想定する変換後のテキストをファイルに書き込んでおき，実際に変換したテキストと想定する変換後のテキストが一致するかを確かめています．

テストに必要なファイルを作成します．これらのファイルは，`test/fixtures`以下に置いておきます．

```markdown:title=sample.md
# Sample
hello

- https://sample.com

```

```html:title=expected.html
<h1 id="sample">Sample</h1>
<p>hello</p>
<ul>
<li>https://sample.com</li>
</ul>

```

```html:title=expected-gfm.html
<h1 id="sample">Sample</h1>
<p>hello</p>
<ul>
<li><a href="https://sample.com">https://sample.com</a></li>
</ul>

```

現在のディレクトリ構成は以下のようになっています．

```
.
├── main.js
├── md2html.js
├── node_modules
│   └── (略)
├── package-lock.json
├── package.json
├── sample.md
└── test
    ├── fixtures
    │   ├── expected-gfm.html
    │   ├── expected.html
    │   └── sample.md
    └── md2html-test.js
```

ファイルが作成できたらテストを実行し，成功することを確認します．

## まとめ

markdownをhtmlに変換するCLIアプリケーションを作成しました．

- markedを使ってmarkdownをhtmlに変換した．
- ファイルを読み込み，テキストを変更してコンソールに出力した．
- オプションを追加した．
- ユニットテストを書いた．
