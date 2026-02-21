---
title: JavaScript勉強メモ
tags: ["技術書", "JavaScript"]
---

JavaScript Primerの第一章を読んで，知らなかった部分や重要な部分のメモ．

https://jsprimer.net/|embed

## はじめに

### JavaScript って何

> [JavaScript](https://developer.mozilla.org/ja/docs/Glossary/JavaScript) はウェブページ上に複雑なものを実装することを可能にするプログラミング言語です。
>
> (引用：[JavaScript - ウェブ開発を学ぶ | MDN](https://developer.mozilla.org/ja/docs/Learn/JavaScript))

　　　

> JavaScriptは主にウェブブラウザの中で動くプログラミング言語です。
>
> (引用：[JavaScriptとは · JavaScript Primer #jsprimer](https://jsprimer.net/basic/introduction/))

### Node.js って何

> Node.js はスケーラブルなネットワークアプリケーションを構築するために設計された非同期型のイベント駆動の JavaScript 環境です。
>
> (引用：[Node.js とは | Node.js](https://nodejs.org/ja/about/))

### ECMAScript って何

JavaScriptの文法を定める仕様．ECMAScriptはどの実行環境でも共通な動作が定義されている．

ES2015は2015年にアップデートされたECMASCriptのこと．

### strict mode って何

コードの先頭に `"use strict";`を書くと，実行モードがこれになる．

ある公文や機能が禁止される．

## 基本文法

### 変数

#### const

再代入不可．ただし，オブジェクトのプロパティなどは変更できるので，定数ではない．

```javascript
const x = 5;
x = 6; // TypeError: Assignment to constant variable.

const obj = { value: 5 };
obj.value = 6;
```

#### let

再代入可．

#### var

あまり使わない方が良い．

- 再定義が可能
- 変数の巻き上げが起こる

```javascript
var x = 6;
var x = 7; // エラーは起きない

console.log(hoge); // エラーは起きない．hoge = undefined
var hoge = 5;
```

#### 命名

キャメルケース

### データ型

#### プリミティブ型

真偽値や数値などの基本的な値．イミュータブル．

- Boolean

- Number

- String

- undefined

- null

- Symbol

  一意で不変な値のデータ型

#### オブジェクト

プリミティブ型の値やオブジェクトからなる集合．ミュータブル．

### 関数

#### 引数

呼び出し時の引数が少ないと，undefinedが代入される．引数が多いと，その引数は無視される．

```javascript
function add(a, b) {
  console.log(a, b);
  return a + b;
}

console.log(add(2, 4));
// 2 4
// 6
console.log(add(2, 4, 7));
// 2 4
// 6
console.log(add(2));
// 2 undefined
// NaN
```

#### Spread構文

配列の前に`...`をつけると，配列の値を展開したものが返される．

```javascript
function add(a, b) {
  return a + b;
}

const a = [2, 4];
console.log(...a); // 2 4
console.log(add(...a)); // 6
```

#### arguments

関数に渡された引数の値が全て入ったArray-likeなオブジェクト

```javascript
function add(a, b) {
  console.log(arguments); // [Arguments] { '0': 2, '1': 4, '2': 7, '3': 'foo' }
  return a + b;
}

add(2, 4, 7, "foo");
```

#### オーバーロードはない

後から宣言した関数のみが有効．

```javascript
function f() {
  console.log(5);
}

function f(x) {
  console.log(x);
}

f(); // undefined
f(6); // 6
```

#### 分割代入

ブレースでオブジェクトのプロパティを取り出せる．引数だけでなく，変数宣言時にも使える．

```javascript
function print({ value }) {
  console.log(value);
}

const obj = {
  value: 555,
};
print(obj); // 555

const { value } = obj;
console.log(value); // 555
```

#### 即時実行関数

匿名関数の宣言と実行をまとめて行うことで，グローバルスコープの汚染を避けられる．

```javascript
(function () {
  console.log("foo");
})();
```

### クロージャー

参照されている変数のデータが保持されるため，変数`x`は`counter()`実行後も参照し続けられる．

```javascript
const counter = () => {
  let x = 0;
  return function inc() {
    return ++x;
  };
};

const inc = counter();
console.log(inc()); // 1
console.log(inc()); // 2
console.log(inc()); // 3
```

### オブジェクト

#### プロパティの存在確認

```javascript
const obj = {
  value: 1,
  str: "foo",
};
console.log("value" in obj); // true
console.log("str" in obj); // true
console.log("obj" in obj); // false
```

`in`演算子と`hasOwnProperty`メソッドは同じ動作をするが，厳密には異なる．

```javascript
const obj = {};
console.log("toString" in obj); // true
console.log(obj.hasOwnProperty("toString")); // false
```

`in`：`obj`には定義されていないが，プロトタイプオブジェクトには存在するため真

`hasOwnProperty`：`obj`自体に定義されていないため偽

### 配列

#### TypedArray

固定長，かつ型付きの配列．

```javascript
const typedArray = new Int8Array(2);
typedArray[0] = 127;
typedArray[1] = 128;
console.log(...typedArray); // 127 -128
```

#### 配列の検索

`findIndex`はインデックスを返し，`find`は要素を返す．

```javascript
const array = ["a", "bb", "ccc"];
console.log(array.findIndex((obj) => obj === "bb")); // 1
console.log(array.find((obj) => obj === "bb")); // bb
```

#### 配列の操作

push_front : unshift

pop_front : shift

```javascript
const array = ["foo"];
array.push("push");
array.unshift("unshift");
console.log(array); // [ 'unshift', 'foo', 'push' ]

console.log(array.pop()); // push
console.log(array); // [ 'unshift', 'foo' ]

console.log(array.shift()); // unshift
console.log(array); // [ 'foo' ]
```

#### 多次元配列を一次元配列にする

`Array#flat`を使う．パラメータで展開する深さを指定できる．全て展開する場合は，`Infinity`を用いる．

```javascript
const array = [[[1], [2]], [3], 4];
console.log(array.flat(1)); // [ [ 1 ], [ 2 ], 3, 4 ]
console.log(array.flat(Infinity)); // [ 1, 2, 3, 4 ]
```

#### 配列のコピー

`Array#concat`や`Array#slice`で配列をコピーすることができる．

```javascript
function f_1(array) {
  const a = array.concat();
  a[0] = "new";
  return a;
}

function f_2(array) {
  const a = array.slice();
  a[0] = "new";
  return a;
}

function f_3(array) {
  const a = array;
  a[0] = "new";
  return a;
}

{
  const array = [1, 2];
  console.log(f_1(array)); // [ 'new', 2 ]
  console.log(array); // [ 1, 2 ]
}
{
  const array = [1, 2];
  console.log(f_2(array)); // [ 'new', 2 ]
  console.log(array); // [ 1, 2 ]
}
{
  const array = [1, 2];
  console.log(f_3(array)); // [ 'new', 2]
  console.log(array); // [ 'new', 2]
}
```

## 文字列

### タグ付きテンプレート関数

`関数 テンプレート文字列`と記述すると，`${}`で区切られた文字列と`${}`の評価結果を引数にして関数を呼ぶ．

```javascript
function f(strings, ...values) {
  console.log(strings);
  console.log(values);
}

f(["aa", "bb", "cc"], 1, 2); // 普通の関数呼び出し
// [ 'aa', 'bb', 'cc' ]
// [ 1, 2 ]
f`aa${1}bb${2}cc`; // テンプレート文字列を使った関数呼び出し
// [ 'aa', 'bb', 'cc' ]
// [ 1, 2 ]
```

## クラス

コンストラクタはクラス名ではなく`constructor`で定義する．必須．

```javascript
class MyClass {
  constructor() {
    console.log("constructor");
  }
}

const myClass = new MyClass(); // constructor
```

また，クラスを値として定義できる．

```javascript
const c = class MyClass {
  constructor() {
    console.log("constructor");
  }
};
```

### メソッドの定義

`function`と書かずに`関数名(パラメータ)`と書く．このメソッドはプロトタイプメソッドと呼び，インスタンス間で共有される．

```javascript
class MyClass {
  constructor() {
    this.value = 0;
  }

  inc() {
    this.value++;
  }
}

const myClass = new MyClass();
console.log(myClass.value); // 0
myClass.inc();
console.log(myClass.value); // 1
```

以下のように`this`に対してメソッドを定義すると，インスタンス間で共有されない．

```javascript
this.inc = () => {
  this.value++;
};
```

### アクセッサプロパティ

メソッドの頭に`get`や`set`をつけると，プロパティへの参照や代入時に呼び出されるメソッドが定義できる．

アクセッサプロパティを用いると，プロパティに対する参照，代入をしたときに何らかの処理を行える．

```javascript
class MyClass {
  constructor() {
    this.value = 0;
  }

  get a() {
    return this.value;
  }

  set b(value) {
    this.value = value;
  }
}

const myClass = new MyClass();
console.log(myClass.a); // 0
console.log((myClass.b = 3)); // 3
console.log(myClass.a); // 3
```

## 非同期処理

### どのスレッドで実行されるか

```javascript
class Timer {
  constructor() {
    this.start = Date.now();
  }

  // Timerインスタンスを生成してから経過した時間を表示する．
  log(message) {
    console.log(String(Date.now() - this.start) + " ms : " + message);
  }
}

// tミリ秒コードの実行を止める．
function block(t) {
  const start = Date.now();
  while (true) {
    const diff = Date.now() - start;
    if (diff > t) {
      return;
    }
  }
}

const timer = new Timer();
timer.log("Begin");
setTimeout(() => {
  timer.log("Begin_setTimeout");
  block(1000);
  timer.log("End_setTimeout");
}, 3000);
timer.log("End");
```

このコードの実行結果は以下のようになる．

```
0 ms : Start
6 ms : End
3012 ms : Start_setTimeout
4013 ms : End_setTimeout
```

メインスレッドの`timer.log("Start")`と`timer.log("End")`が順に実行され，その約3秒後に`setTimeout`内の関数が呼ばれる．この動作から，`setTimeout`内の関数とメインスレッドは独立して動いているように見える．

次に，以下のように`block()`を増やしてみる．

```javascript
const timer = new Timer();
timer.log("Start");
setTimeout(() => {
  timer.log("Start_setTimeout");
  block(1000);
  timer.log("End_setTimeout");
}, 3000);
block(5000);
timer.log("End");
```

このコードの実行結果は以下のようになる．

```
0 ms : Start
5007 ms : End
5008 ms : Start_setTimeout
6009 ms : End_setTimeout
```

1. 実行
2. 実行してから3秒後に`setTimeout`内の関数実行
3. 実行してから5秒後に`timer.log("End")`を実行

とはならない．

1. 実行
2. 実行してから3秒後に`setTimeout`内の関数を実行しようとするが，`block(5000)`の実行が終わっていないので実行されない．
3. 実行してから5秒後に`timer.log("End")`を実行
4. `setTImeout`内の関数を実行

となる．`setTimeout`での関数実行はメインスレッドで行われるため，メインスレッドを`block()`で止めると，その分実行が遅れる．

### Promise

非同期処理の結果を表現するオブジェクト．

```javascript
const promise = new Promise(関数 foo);
promise.then(fooの実行に成功したときに呼ぶ関数，fooの実行に失敗したときに呼ぶ関数)
```

`resolve`と`reject`の２つの引数を取る関数を`Promise`に与える．与えた関数の実行が成功なら`resolve`を呼び，失敗なら`reject`を呼ぶ．

```javascript
function foo(resolve, reject) {
  resolve(123);
}

function success(value) {
  console.log("resolve", value);
}

function failure(value) {
  console.log("reject", value * 2);
}

const promise = new Promise(foo);
promise.then(success, failure); // resolve 123

// 匿名関数を使った場合
const promise = new Promise((resolve, reject) => {
  resolve(123);
}).then(
  (value) => {
    console.log("resolve", value);
  },
  (value) => {
    console.log("reject", value * 2);
  },
); // resolve 123
```

例外が起こった場合は`reject`を呼ぶ．

```javascript
const promise = new Promise((resolve, reject) => {
  throw new Error("hogehoge");
}).then(
  (value) => {
    console.log("resolve", value);
  },
  (value) => {
    console.log("reject!!", value);
  },
);
// reject!! Error: hogehoge
// (省略)
```

### Promiseチェーン

`then`は`Promise`オブジェクトを返すので，`.then().then()...`と繋げることができる．

```javascript
const timer = new Timer();
const promise = new Promise((resolve, reject) => {
  timer.log("1. 何らかの処理を実行");
  block(1000);
  resolve();
})
  .then(() => {
    timer.log("2. 処理が成功");
  })
  .then(() => {
    timer.log("3. 別の処理を実行");
    block(2000);
    timer.log("4. 処理が終了");
  });
```

```
1 ms : 1. 何らかの処理を実行
1007 ms : 2. 処理が成功
1007 ms : 3. 別の処理を実行
3008 ms : 4. 処理が終了
```

### 複数の`Promise`をまとめる

`Promise.all(Promiseのリスト)`と書く．

```javascript
const timer = new Timer();

function getPromise(ms) {
  return new Promise((resolve) => {
    timer.log(`${ms}ミリ秒待機`);
    setTimeout(() => {
      resolve(ms);
    }, ms);
  });
}

const p1 = getPromise(1000);
const p2 = getPromise(2000);
const p3 = getPromise(3000);

Promise.all([p1, p2, p3]).then((values) => {
  timer.log("Promise.all");
  console.log(values);
});
```

```
1 ms : 1000ミリ秒待機
9 ms : 2000ミリ秒待機
9 ms : 3000ミリ秒待機
3014 ms : Promise.all
[ 1000, 2000, 3000 ]
```

`Promise`が１つでも失敗すると，`Promise.all`は失敗時の処理を呼び出す．

`Promise`が１つでも成功したときにコールバック関数を呼ぶときは`Promise.race`を使う．

### Async Function

非同期処理を同期処理として書きたくなったり，`then`で無限にチェーンが繋がっていくのが辛くなったときに使える構文．

`async function`と記述すると，その関数は`Promise`を返す．

```javascript
async function f() {
  return 123456;
}

f().then((value) => {
  console.log(value); // 123456
});
```

この場合だと，`f()`は`Promise.resolve(123456);`を返す．

`async function`は`await`を使って実行が終わるまで待つことができる．

```javascript
const timer = new Timer();

async function f() {
  timer.log("Begin async function f");
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(123456), 1000);
  });
}

async function g() {
  const a = await f();
  timer.log("End async function f");
  const b = await f();
  timer.log("End async function f");
  console.log(a, b);
}

g();
```

`await f()`で約1秒間，止まっているのがわかる．

```
0 ms : Begin async function f
1009 ms : End async function f
1010 ms : Begin async function f
2015 ms : End async function f
123456 123456
```

`await`を削除するとどうなるか．

```javascript
async function g() {
  const a = f();
  timer.log("End async function f");
  const b = f();
  timer.log("End async function f");
  console.log(a, b);
}
```

```
0 ms : Begin async function f
5 ms : End async function f
5 ms : Begin async function f
5 ms : End async function f
Promise { <pending> } Promise { <pending> }
```

1秒もかからずにメインスレッドが終了する．`async function`である`f()`は`Promise`を返すだけである．

## 感想

[JavaScript Primer](https://jsprimer.net/)はJS初心者にかなりおすすめ．説明が丁寧でわかりやすく，関連した情報も併せて書いてあるので，単に文法を調べる以上の情報が得られる．また，サンプルコードをサイト上で実行できるので，コードをいじることも簡単にできる．

非同期処理が全くわかっていなかったので， [非同期処理:コールバック/Promise/Async Function · JavaScript Primer #jsprimer](https://jsprimer.net/basic/async/) は特に勉強になった．よく見るコールバックを用いたコードから，Promise，Async Functionを段階を踏んで説明してくれるので，とてもわかりやすかった．

簡単なプログラムだけど，非同期処理の関数を`Promise`で包んで，`await`を使って同期処理っぽく書くことができるようになって満足．

次はアプリ開発．
[第二部: 応用編（ユースケース） · JavaScript Primer #jsprimer](https://jsprimer.net/use-case/)
