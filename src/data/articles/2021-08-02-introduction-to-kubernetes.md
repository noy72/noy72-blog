---
title: Kubernetes 入門メモ
tags: ["技術書", "Kubernetes"]


---

Kubernetes完全ガイド 第2版 を読みながら取ったメモ。全部は読めていない。


## 操作

- リソースの作成、更新
  - `kubectl apply <パラメータ>`
  - リソース
      - k8s を操作するために登録するもの
- 作成した Pod の確認
  - `kubectl get pods`
- Pod の再起
  - `kubectl rollout restart <リソース名>`

- ローカルマニフェストと k8s 上の登録情報の差分を取得
  - `kubectl diff <パラメータ>`

- 詳細情報
  - `kubectl describe <パラメータ>`

- コンテナに入る
  - `kubectl exec -it <pod名> -- /bin/bash`

- ポートフォワーディング
  - `kubectl port-forward <pod名> <from:to>`
      - `localhost:<from>` 宛の通信をPodの`<to>`ポートに転送 

- ログを見る
  - `kubectl logs <リソース名>`
  - 標準出力、エラー出力に出力されたログを見ることができる


## アノテーションとラベル

- アノテーション

  - リソースに対するメモ

- ラベル

  - リソースを分割する情報
  - Pod のフィルタリングに使うとか

  

## Workload API

- Pod
  - ひとつ以上のコンテナから構成される
  - Pod を構成するコンテナは IP Address を共有する
  - コンテナに割り当てられる IP アドレスは外部から疎通性がない  
      ホストのネットワークを利用（spec.hostNetworkの有効化）することで外部と通信できるが，ポート番号の衝突などの問題が起きるため、NodePort Service などで実現した方が良い。

- ReplicaSet
  - 指定した数の Pod を維持し続けるリソース
  - ラベルを使って Pod を数える
- Deployment
  - 複数のReplicaSetを管理する
  - ローリングアップデートやロールバックを実現
  - アップデート戦略
    - Recreate
      - 全部消してまた作る
    - RolingUpdate
      - 徐々にアップデートする
- DaemonSet
  - 各Kubernetes NodeにPodをひとつ配置する
  - ログを取ったり状態を監視するなど、全ノードで実行させたいプロセスのために利用する
  - アップデート戦略
      - OnDelete
        - 何かでPodが消えて、次にPodが作成されるときにアップデートする
      - RolingUpdate
- StatefulSet
  - データを永続化する仕組みを持つ
  - アップデート戦略
      - OnDelete
      - RolingUpdate
- Job
  - 一度限りの処理を実行させるリソース。バッチ的な処理を行う。
  - 処理が終わればPodが停止することが期待される
  - 並列に実行する数、要求する成功回数、許容する失敗回数を指定できる
- CronJob
  - Jobのスケジューラー





## Service APIs

### Service

- ロードバランシングする機能を提供
- サービスディスカバリの方法
  - 環境変数
  - DNS Aレコード
  - DNS SRVレコード



- ClusterIP Service
  Kubernetesクラスタ内からのみ疎通性のある仮想IPが割り当てられる。
  - External IP Service  
    特定のノードの`<IPアドレス:Port>`に対するトラフィックをコンテナに転送する。  
      - ClusterIPの中でも、spec.externalIPsが指定されたもの
  - Headless Service  
    対象となる個々のPodのIPアドレスが直接返ってくる。DNS Round Robin を使ったエンドポイントを提供する。    
      - 条件
        - spec.type が ClusterIP
        - spec.clusterIP が None

- NodePort Sevice  
  すべてのノードの`<IPアドレス:Port>`に対するトラフィックをコンテナに転送する。

- LoadBalancer Service  
  クラスタ外のロードバランサに外部疎通性のある仮想IPを払い出す。
  - ロードバランサー→ノードポート→コンテナ

- ExternalName Service   
  Service 名の名前解決に対して外部のドメイン宛のCNAMEを返す。

- None-Selector Service  
  ExternalName Service と違い、ClusterIPのAレコードを返す



### ノード間通信

- externalTrafficPolicy の設定値  
  - Cluster  
    ノード到達後に他のノードにあるPodも含めてロードバランシングする。
  - Local  
    ノード到達後にノードをまたいだロードバランシングをしない。

- Topology-aware Service Routing  
  転送先を優先度をつけて列挙することで、トポロジを考慮してトラフィックを転送することができる。



### Ingress

L7ロードバランシングを提供するリソース

https://cloud.google.com/kubernetes-engine/docs/concepts/ingress



#### GKE Ingress

クラスタ外のロードバランサを利用する Ingress。Ingress リソースを作成するだけで LoadBalancer の仮想 IP が払い出される。

GKEでは Ingress を利用するための設定がデフォルトで有効なため、クラスタを構築するだけで利用可能。



## その他

- VXLAN
  - https://datatracker.ietf.org/doc/html/rfc7348
- L2 Routing
- DNS A レコード
  - https://datatracker.ietf.org/doc/html/rfc1035
- DNS SRV レコード
  - https://datatracker.ietf.org/doc/html/rfc2782
- L4 ロードバランシング
- L7 ロードバランシング
- Canonical Name record
  - CNAME





## Config & Storage APIs カテゴリ

### 環境変数

- 静的設定  
  spec.containers[].env に定義する

- Secret  
  機密情報を別リソースとして定義しておき、Podから読み込むことができるリソース。コンテナから利用する場合は環境変数として渡すかVolumeとしてマウントする。

  - 種別
      - Opaque  
      一般的な汎用用途、スキーマレスのSecret
      - TLSタイプのSecret  
      Ingressリソースなどから利用することが一般的
      - DockerレジストリタイプのSecret  
      Dockerイメージの取得時の認証情報を定義するもの
      - Basic認証タイプのSecret  
      ユーザ名とパスワードで認証するシステムで利用する
      - SSH認証タイプのSecret   
      秘密鍵で認証するシステムで利用する

  

### ConfigMap

Key-Valueで保持できるデータを保存しておくリソース。

だいたい Secret と同じ感じ。Secret は機密情報を扱い、ConfigMap はそれ以外を扱う。



### PersistentVolumeClaim

永続化領域を利用するためのリソース。

- Volume  
  あらかじめ用意された利用可能なボリューム。ユーザーが直接操作することはできない。
- PersistentVolume  
  クラスタにボリュームを登録（利用はできない）、削除ができるボリューム。マニフェストを使ってリソースを作成する必要がある。
- PersistentVolumeClaim  
  登録されたPersistentVolumeを利用するための設定ができる。ユーザーはこれ経由で PersistentVolume を利用する。



## リソース制限

コンテナ単位でCPUやメモリの使用量に制限をかけられる。制限がないとリソースを食い尽くしてエラーを返すかも。



## ヘルスチェック

Pod が正常化を判断する機構。



判断する項目は以下の三つ。

- Liveness Probe  
  コンテナ正常に動いているか？
- Readiness Probe  
  リクエストを受け付けられるか？
- Startup Probe  
  初回起動が完了したか？



チェック方法は以下の三つ。

- exec  
  コマンドを実行して終了コードが 0 なら成功
- httpGet  
  GET してステータスコードが 200-399 なら成功
- tcpSocket  
  TCPセッションが確立できれば成功



上記の設定をマニフェストの`livenessProbe.[exec|httpGet|tcpSocket]`に書く。



Pod が停止したときの挙動は以下の三つから設定できる。

- Always  
  常に再起動
- OnFailure  
  失敗したときのみ再起動
- Never  
  再起動しない



### 参考
Kustomize のドキュメント
https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/|embed


Kubernetes の用語集
https://kubernetes.io/docs/reference/glossary/?fundamental=true|embed



## 感想

半分くらい読んだ。

サービスの開発を通してk8sの解説をするのではなくk8sの説明に終始するため、入門書としては読めないと思う。ざっと眺めて、必要になったときに詳細を見るのが良さそう。