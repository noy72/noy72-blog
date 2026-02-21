---
title: Electronアプリ開発中に出会ったこといくつか
tags: ["React", "TypeScript", "Electron", "ネイティブアプリ"]

---

Electronのアプリ開発中にいくつか勘違いしたり，よく分からなかったり，調べたことをまとめた．



## React

### textboxの値を取得する

取得には，`state`か`ref`を使う．単に入力されたテキストを取得したいなら，`ref`のようが良さそう．`ref`を使えばノードの参照を得られる

```typescript
class Content extends React.Component<Record<string, unknown>> {
  searchBoxRef: RefObject<HTMLInputElement>;
  
  constructor(props: Record<string, unknown>) {
        super(props);
        this.searchBoxRef = createRef();
  }
  
  render() {
        return <>
           <input ref={this.searchBoxRef} />
        </>;
  }
  
  // this.searchBoxRef.current!.value で入力された値が取れる
}
```

`state`を使う場合は，`onChange`で変更のたびに`state`を更新する．



### forwardRefの型

`forwardRef`を使った例．`<select>`で選んだ値を取得するために`ref`を使っている．

```typescript
import React, { ForwardedRef, ForwardRefRenderFunction } from "react";

type Props = JSX.IntrinsicElements["select"];

const element: ForwardRefRenderFunction<HTMLSelectElement, Props> = ({ /*  */ }: Props, ref: ForwardedRef<HTMLSelectElement>) => {
    return (
        <select ref={ref}>
      			/* options */
        </select>
    );
};

const Selector = React.forwardRef<HTMLSelectElement, Props>(element);

export default Selector;
```

普通の関数コンポーネントだとエラーが出るので，`ForwardRefRenderFunction`にする必要がある．

 ## Spectron

### テストでメインプロセスにメッセージを送る

```typescript
import { Application } from 'spectron';
  
app = new Application(/* applicationConfig */);
```

`app.electron`は，`Electron.RemovetMainInterface`型である．この型には`ipcMain`は存在するが`ipcRenderer`は存在しない．

しかし，Spectronのドキュメントには，

> The `electron` property is your gateway to accessing the full Electron API.

と書いてある．

```typescript
app.electron.ipcRenderer.send(/* message */, /* value */));
```

と書くと，型的には`ipcRenderer`がないのでエラーが出るが，実行すると動く．

テストでメインプロセスにメッセージを送りたいときは，どうするのが正しいんだろう？





## lowdb

### 値の更新が反映されない

レンダラープロセスで値を更新した後にメインプロセスで値を取得すると，変更前の値が返ってくる．

#### 雑な解決法

```typescript
 adapter = new FileSync<型>(ファイル);
 db = low(adapter)
```

上記のコードが書かれたファイルをメインプロセスとレンダラープロセスでインポートしており，`db`が複数作成されていた．ファイルが変更された後に`new FileSync`をし直して値を読み込むと，ちゃんと変更後の値になっていた．

`nodeIntegration: true`にして，何でもかんでもレンダラープロセスから呼び出すようにしているのがそもそも良くない．





## Typescript / JavaScript

### メソッドの抽出をしたらテストが実行されない

非同期のメソッド`api.get()`のテストがしたいので，以下のようなテストを書いた．

```typescript
description('APIのテスト', () => {
	it('get', async () => {
    const res = await api.get();
    // 処理
    assert.strictEqual(/* 条件 */);
  });
});
```



別のテストと処理が重複していたので，共通部分を関数に抽出した．

```typescript
async function syori(){
	const res = await api.get();
  // 処理
  return ...
}

description('APIのテスト', () => {
	it('get', async () => {
    const syori_result = syori();
    assert.strictEqual(/* 条件 */)
  });
});
```

その結果，`syori`が実行されなくなり，テストが常に成功するようになった．

#### 原因

抽出した関数は非同期なので，`await`が必要だった（または`done`を使う）．何も考えずに抽出したらダメだった．

```typescript
description('APIのテスト', () => {
	it('get', async () => {
    const syori_result = await syori(); // await してなかった
    assert.strictEqual(/* 条件 */)
  });
});
```



### Array.findが常に一番目の値を返す

以下のようなコードを書くと，常に`xs`の一番目の値が返ってくる．

```typescript
xs.find(async (x) => await x.get())
```

#### 原因

非同期関数は`Promise`を返すので，常に真．そりゃそうだ．<!--どうも-->，「`await`で中身を取り出す」みたいな印象があるらしい．

結局は`Promise.all`を使った．



## 感想

- 非同期関数に関しては，理解せずにコピペしています，みたいな酷い間違いだった．長時間ハマっていたわけではないけど，そんなコードを書いてしまうのは良くない．
- とりあえず`nodeIntegration: true`にして開発しているけど，それのせいで複雑になっている気がする
- Electronのe2eテストは`await`だらけになるので，どうにかしたくなった
  - 書き方が悪いのかフレーキーテストで困る