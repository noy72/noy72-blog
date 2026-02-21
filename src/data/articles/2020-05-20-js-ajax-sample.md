---
title: Ajax通信をする小さなアプリの作成
tags: ["JavaScript", "Node.js"]
---

JavaScript Primer の第二部をやったメモ．

[Ajax通信 · JavaScript Primer #jsprimer](https://jsprimer.net/use-case/ajaxapp/) を実際にやって見た際のメモ．

## 作るもの

- APIを呼び出して，GitHubからユーザー情報を取得する
- 取得した情報をページに表示する

## 環境

- macOS catalina
- Node.js v13.13.0

## 真っ白のページを作る

まず，サーバーを立てて，HTMLにアクセスできる状態にします．

### プロジェクトディレクトリの作成

今回は`Ajax-sample`というディレクトリを作成し，そのディレクトリ以下で作業をします．

### HTMLファイルの作成

エントリーポイントとなるhtmlファイルを作成します．`index.js`を読み込むだけの真っ白なページです．

```html:title=index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Ajax Sample</title>
</head>
<body>
<script src="index.js"></script>
</body>
</html>
```

### JavaScriptファイルの作成

読み込めているかを確認するだけなので，適当な文字列を表示するコードを書きます．

```javascript:title=index.js
console.log("OK");
```

### サーバーを立てる

Node.jsを使ってサーバーを立てます．Express.jsを使ってもいいですが，今回は`http.createServer`を使って素朴に実装します．

一部のIDEは特別な設定をしなくてもhtmlをローカルサーバー上で見られるので，この部分は省略できます．

#### 実装

<details>
<summary>Server.js</summary>

```javascript:title=server.js
const http = require('http');
const fs = require('fs');
const contentType = new Map([
    ["html", "text/html"],
    ["js", "text/javascript"],
    ["css", "text/css"],
    ["png", "image/png"],
    ["ico", "image/vnd.microsoft.icon"],
]);


http.createServer(function (req, res) {
    const ext = req.url.split('.').pop();

    try {
        const data = fs.readFileSync('.' + req.url);
        res.writeHead(200, {'Content-Type': contentType.get(ext)});
        res.write(data);
    } catch (e) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write(e.message);
    }
    res.end();
}).listen(8080);
```

</details>

#### http.createServer

`req.url`で指定されたファイルを返します．指定されたファイルが存在しない時，エラーメッセージを返します．

```javascript:title=server.js
http.createServer(function (req, res) {
    const ext = req.url.split('.').pop();

    try {
        const data = fs.readFileSync('.' + req.url);
        res.writeHead(200, {'Content-Type': contentType.get(ext)});
        res.write(data);
    } catch (e) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.write(e.message);
    }
    res.end();
}).listen(8080);
```

参考：[Node.js http.createServer() Method](https://www.w3schools.com/nodejs/met_http_createserver.asp)

#### contentType

`[拡張子, contentType]`の`Map`．リクエストされたファイルの拡張子によって，適切なContentTypeを返します．

```javascript:title=server.js
const contentType = new Map([
    ["html", "text/html"],
    ["js", "text/javascript"],
    ["css", "text/css"],
    ["png", "image/png"],
    ["ico", "image/vnd.microsoft.icon"],
]);
```

参考：[よくある MIME タイプ - HTTP | MDN](https://developer.mozilla.org/ja/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)

### HTMLの表示

```
 Ajax-sample
 ├── index.html
 ├── index.js
 └── server.js
```

`Ajax-sample`下で`node server.js`を実行し，`http://localhost:8080/index.html`にアクセスすると，以下のようなページが表示されます．コンソールには"OK"が表示されます．ファビコンは用意していないので404が返ります．

https://i.imgur.com/qReYf1C|0.9

今回の実装では`http://localhost:8080`以下の文字列をファイル名として処理するので，`http://localhost:8080`や`http://localhost:8080/index`ではファイルが読み込めません．

## HTTP通信

次に，API（https://developer.github.com/v3/users/）を呼び出して，レスポンスをコンソールに表示します．

### HTTPリクエストを送る関数の作成

`fetch`メソッドでHTTPリクエストを作成，送信ができます．このメソッドは`Promise`を返すため，`then`で成功時と失敗時に呼ばれる関数を登録します．また，レスポンスのデータをjsonに変換するメソッドも`Promise`を返すので，jsonをコンソールに表示する関数を渡しておきます．

特定の文字がURIに含まれていると正しく動作しないため，`encodeURIComponent()`でエスケープしておきます．

```javascript:title=index.js
function fetchUserInfo(userId) {
  fetch(`https://api.github.com/users/${encodeURIComponent(userId)}`)
    .then(
      (response) => {
         if (response.ok) {
           return response.json().then(userInfo =>
             console.log(userInfo));
         } else {
           console.log("Error :", response);
         }
      },
      (error) => {
        console.log(error);
      }
    );
}

```

参考：[encodeURIComponent() - JavaScript | MDN](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)

### HTTPリクエストを送るためのボタンを作成

HTMLにボタンを作成し，そのボタンを押すと`fetchUserInfo`を呼び出すようにします．ここでは，`userId`を埋め込んでいます．

```html:title=index.html
...
<body>
<button onclick="fetchUserInfo('noy72');">Get user info</button>
<script src="index.js"></script>
</body>
...
```

### 実際に送ってみる

`http://localhost:8080/index.html`にアクセスし，表示されているボタンを押すと，HTTPリクエストが送られます．結果は以下のようにコンソールに表示されます．

https://i.imgur.com/th2ZVXb|0.9

## データをページに表示する

得られたデータをページに表示するようにします．

今回は，

- アバター
- ユーザー名
- ユーザーID
- フォロー数
- フォロワー数
- レポジトリ数

を表示表示します．

### HTMLの組み立て

HTMLは以下のような構造にします．

```
.
├── ユーザー名，ユーザーID
├── アバター
└── .
    ├── フォロー数
    ├── フォロワー数
    └──レポジトリ数
```

`Element#innerHTML`プロパティに作成したHTML文字列をセットする方法がありますが，HTMLのエスケープ処理をしたくないので，今回は`Element`オブジェクトを生成してツリーを構築します．

#### 結果を表示する部分の作成

`button`要素と`script`要素の間に空の`div`要素を入れておきます．

```html:title=index.html
...
<button onclick="fetchUserInfo('noy72');">Get user info</button>
<div></div> <!-- ここにユーザー情報を表示する -->
<script src="index.js"></script>
...
```

#### HTMLの組み立てとDOMへの要素の追加

HTML要素は`document.createElement`で，単なる文字列は`document.createTextNode`で作成します．`Element#appendChild`で子要素を追加してHTMLを組み立てます．

組み立てたHTMLは，用意しておいた`div`要素に挿入します．今回は`querySelector`で`div`要素を受け取り，そこに組み立てたHTMLを挿入します．

```javascript:title=index.js
function buildHTML(info) {
    const user_name = document.createElement("h4");
    user_name.appendChild(
        document.createTextNode(`${info.name} (@${info.login})`)
    );

    const avatar = document.createElement("img");
    avatar.src = info.avatar_url;
    avatar.alt = info.login;
    avatar.height = 100;

    const list = document.createElement("ul");
    const following = document.createElement("li");
    following.appendChild(
        document.createTextNode(`Following: ${info.following}`)
    );
    const followers = document.createElement("li");
    followers.appendChild(
        document.createTextNode(`Followers: ${info.followers}`)
    );
    const repos = document.createElement("li");
    repos.appendChild(
        document.createTextNode(`Repos: ${info.public_repos}`)
    );
    list.appendChild(following);
    list.appendChild(followers);
    list.appendChild(repos);

    const result = document.querySelector('body > div');
    result.appendChild(user_name);
    result.appendChild(avatar);
    result.appendChild(list);
}
```

上記のコードは以下のようなHTMLを生成します（`${}`の部分は展開されます）．

```html
<div>
  <h4>${info.name} (@${info.login})</h4>
  <img src="${info.avater_url}" alt="${info.login}" height="100" />
  <ul>
    <li>Following: ${info.following}</li>
    <li>Followers: ${info.followers}</li>
    <li>Repos: ${info.public_repos}</li>
  </ul>
</div>
```

### buildHTMLを呼ぶ

`fetch`して得られたデータを`buildHTML`の引数にし，関数を呼びます．これで，ボタンを押すとデータが表示できるようになります．

```javascript:title=index.js
if (response.ok) {
  response.json().then(userInfo => {
    buildHTML(userInfo);
  });
} else {
...
```

https://i.imgur.com/ektGKbZ|0.9

## Asyncを使う

現在は`fetch`メソッドのコールバックで`buildHTML`メソッドを呼び，DOMに変更を加えています．

これを，`Async`を使って同期処理のように書き換えてみます．

### main関数の追加

直接`fetchUserInfo`を呼ばずに，`main`関数を通して呼ぶようにします．

```javascript:title=index.js
function main(){
    fetchUserInfo("noy72")
}
```

```html:title=index.html
...
<body>
<button onclick="main();">Get user info</button>
<div></div>
...
```

### Promiseオブジェクトを返すようにする

`fetchUserInfo`でDOMを書き換えるのではなく，`Promise`オブジェクトを返すようにします．成功した場合は`Response#json`の戻り値をそのまま返し，失敗した場合は`Promise.reject`でエラーを返します．

```javascript:title=index.js
function fetchUserInfo(userId) {
    return fetch(`https://api.github.com/users/${encodeURIComponent(userId)}`).then(
        (response) => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(
                    new Error(`${response.status} ${response.statusText}`)
                );
            }
        }
    );
}
```

### mainでPromiseを処理

`fetchUserInfo`は`Promise`を返すようになったので，`main`で処理します．成功した場合は`(userInfo) => buildHTML(userInfo)`が実行され，DOMを書き換えます．エラーが発生した場合は，`(error) => console.log(error)`が実行されます．

```javascript:title=index.js
function main() {
    fetchUserInfo("noy72")
        .then((userInfo) => buildHTML(userInfo))
        .catch((error) => console.log(error))
}
```

これで`Promise`を使った処理ができるようになりました．コードは変わりましたが意味的には`Promise`を使っていないのと同じなので，前回実行した時と同様の動作をします．

### Asyncを使う

`Promise`を返す`fetchUserInfo`は`await`することができます．

```javascript:title=index.js
async function main() {
    try {
        const userInfo = await fetchUserInfo("noy72");
        buildHTML(userInfo);
    } catch (error) {
        console.log(error);
    }
}
```

`fetch`のコールバックで処理を行う実装から，手続的に処理を行う実装になりました．

### 作成したアプリのリポジトリ

[https://github.com/noy72/JavaScript-Sample-Apps/tree/master/Ajax-sample:title]

## まとめ

GithubのAPIを呼び出し，取得したデータを表示するアプリを作成しました．

- サーバーを立てて，HTMLの表示とJavaScriptの実行をした
- `fetch`を使ってHTTPリクエストを送った
- DOMを書き換えて，APIから取得したデータを表示した
- `Async function`に置き換えた．

現在の実装ではユーザー名を埋め込んでいますが，[Promiseを活用する · JavaScript Primer #jsprimer](https://jsprimer.net/use-case/ajaxapp/promise/) ではユーザー名を変更できるように実装しています．
