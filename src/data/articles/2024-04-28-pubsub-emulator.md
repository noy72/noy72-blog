---
title: Pub/Sub Node.js Client でエミュレータを使う方法
tags: ["Google Cloud"]
---

Node.js Client の PubSub と v1.SubscriberClient はエミュレータに接続するための設定方法が異なる。


## やりたいこと

エミュレータを使って、メッセージを push, pull する。

## やったこと

エミュレータを実行して、`PUBSUB_EMULATOR_HOST` と `PUBSUB_PROJECT_ID` を設定した。


## 起こったこと

作成したはずのサブスクリプションがなぜか見つからない。

- トピックとサブスクリプションは作成できる
- `v1.SubscriberClient.pull` で `Resource not found` が発生する
  - `PubSub.getSubscriptions` で subsucription 一覧を確認すると、該当の subscription は作成されている
- `v1.SubscriberClient.listSubscriptions` で `User not authorized to perform this action.` が発生する


### 例

```Typescript
const pubsub = new PubSub();
const [topic] = await pubsub.createTopic(topicNameOrId);
const [subscription] = await topic.createSubscription(subscriptionName);
console.log(
  await pubsub.getSubscriptions()  // 作成した subscription が表示される
);

const subscriberClient = new v1.SubscriberClient();
await subscriberClient.listSubscriptions({project: ...});  // Error発生。この操作の権限がなさそう
await subscriberClient.pull({  // Error発生。subscription がない
  subscription: subscriberClient.subscriptionPath(projectId, subscriptionName),
});
```

## 原因

環境変数を設定しても `v1.SubscriberClient` はエミュレータを使わない。
結果、`v1.SubscriberClient` はエミュレータではなく本番環境の Pub/Sub サービスを使っていた。

## 解決法


`v1.SubscriberClient` 作成時にオプションを渡してエミュレータを使うように設定する。
`PubSub` の Config をそのまま渡すのが簡単だと思う。

```TypeScript
const config = await pubSub.getClientConfig();
const subscriberClient = new v1.SubscriberClient({
  ...config,
  port: typeof config.port  === 'string' ? parseInt(config.port) : config.port,
});
```

`ClientConfig.port` は `string | number` で、 `ClientOptions.port` は `number | undefined` なので型を合わせている。

参考：[PubSub Emulator Error With pubsub.v1.SubscriberClient() · Issue #346 · googleapis/nodejs-pubsub](https://github.com/googleapis/nodejs-pubsub/issues/346)
