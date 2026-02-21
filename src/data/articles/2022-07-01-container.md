---
title: コンテナ技術に入門した
tags: ["Docker"]
---

エンジニア Hub で公開されているコンテナ技術入門を読んだ。



https://eh-career.com/engineerhub/entry/2019/02/05/103000|embed



Docker だけではなく、コンテナの要素技術について少しは知っておく必要があったのでこの記事を読んだ。Docker の書籍で要素技術について解説していることもあるがそこまで詳細には書かれていないので、要素技術に焦点を当てて解説してくれるこの記事は足りない情報を埋めてくれてありがたい。



## 環境

UTM を使って Ubuntu を動かし、その上でコマンドを実行した。



- M1 MacBook Pro

- MacOS 11.5.2
- UTM 3.2.4
- Ubuntu 20.04.4 LTS 64-bit ARM (ARMv8/AArch64) desktop image
  - [Ubuntu 20.04.4 LTS (Focal Fossa) Daily Build](https://cdimage.ubuntu.com/focal/daily-live/current/)



## 作業ログ

### 環境構築

Vagrant は使えないのでコマンドをコピペして実行した。

```shell
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y docker-ce
```

この部分は実行せずに、`docker` と `docker.io` を `apt-get` でインストールした。

### mktemp

`mktemp` で一時的なファイルやディレクトリを作れる。`$ROOTFS` には `/tmp/tmp/xxxxx` というパスが入る。作成直後は当然空。



### docker コンテナを \$ROOTFS 以下に解凍

`docker container create xxxx`（`container` は省略できる）でコンテナを作成できる。`$CID` にはコンテナの id が入る。コンテナの id は `docker ps -a` で見られる。

`docker container export $CID` でコンテナを tar 形式で出力できる。ここでは、出力したファイルを `$ROOTFS` 以下に解凍している。

```shell
ubuntu@utm:~$ ls $ROOTFS
bin  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
```



### bash のリンク

`/usr/local/bin` 以下に bash がなかったので `/bin/bash` をリンクした。



### id

ユーザーとグループの ID を出力する。

```shell
ubuntu@utm:~$ id
uid=1000(ubuntu) gid=1000(ubuntu) groups=1000(ubuntu),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),120(lpadmin),132(lxd),133(sambashare)
```



### コンテナの作成

```shell
cgexec -g cpu,memory:$UUID \
  unshare -muinpfr /bin/sh -c "
    mount -t proc proc $ROOTFS/proc &&
    touch $ROOTFS$(tty); mount --bind $(tty) $ROOTFS$(tty) &&
    touch $ROOTFS/dev/pts/ptmx; mount --bind /dev/pts/ptmx $ROOTFS/dev/pts/ptmx &&
    ln -sf /dev/pts/ptmx $ROOTFS/dev/ptmx &&
    touch $ROOTFS/dev/null && mount --bind /dev/null $ROOTFS/dev/null &&
    /bin/hostname $UUID &&
    exec capsh --chroot=$ROOTFS --drop=cap_sys_chroot -- -c 'exec $CMD'
   "
```

何をやっているかがわからないのでひとつずつ見ていく。



### cgexec

与えたコントロールグループでタスクを実行する。ここでは、`cgset` で設定した制限が `unshare` に適用される。



### unshare

親プロセスと異なる名前空間でコマンドを実行できる。どの名前空間を共有しないかをオプションで指定する。

```shell
ubuntu@utm:~$ ps
    PID TTY          TIME CMD
   1889 pts/0    00:00:00 bash
   2711 pts/0    00:00:00 ps
ubuntu@utm:~$ sudo unshare --fork --pid --mount-proc ps
    PID TTY          TIME CMD
      1 pts/0    00:00:00 ps
```

上記の例は、PID 名前空間をオプションで指定している。`ps` を普通に実行すると PID が2711だが、`unshare`を使って `ps` を実行した場合は PID が1になっており、PID名前空間が分離されていることを確認できる。

オプションの `muinpfr` はそれぞれ以下を意味する。

- m: mount namespace

- u: UTS namespace

- i: IPC namespace

- n: network namespace

- p: PID namespace

- f: fork  

  子プロセスでコマンドを実行する

- r: map-root-user  

  > Run the program only after the current effective user and group IDs have been mapped to the superuser UID and GID in the newly created user namespace.

  よくわかってない。ユーザー名前空間を新しく作成すると既存のユーザーが持つ権限が全て失われて色々面倒だから、既存のユーザーやグループを新しく作った名前空間から参照できるようにする、といった感じ？



### mount

ファイルをマウントする。`-t` オプションで filesytem type を選べる。`mount -t proc proc $ROOTFS/proc` は filesystem type =`proc` 、 device = `proc`、dir = `$ROOTFS/proc` を意味する。

`--bind` で特定のディレクトリをマウントできる。`mount --bind $(tty) $ROOTFS$(tty)` は `$(tty)` を `$ROOTFS` 以下にマウントする





### tty

> tty - print the file name of the terminal connected to standard input



>ttyとは、標準入出力となっている端末デバイス(制御端末、controlling terminal)の名前を表示する Unix 系のコマンドである。
>
>https://ja.wikipedia.org/wiki/Tty





### ptmx, pts

> ptmx, pts - pseudoterminal master and slave

[Ubuntu Manpage: ptmx, pts - 擬似端末のマスタとスレーブ](https://manpages.ubuntu.com/manpages/jammy/ja/man4/pts.4.html)



よくわからない。

```
ubuntu@utm:~$ ps
    PID TTY          TIME CMD
   8374 pts/1    00:00:00 bash
  11041 pts/1    00:00:00 ps
```

`ps` を実行すると TTY 列に pts と表示される。普段触っているのは擬似端末なのか？

ホストマシンの MacBook で `ps` すると ttys000（末尾の数値は異なる）が表示された。



###  capsh

コマンドのラッパ。[Capability](https://man7.org/linux/man-pages/man7/capabilities.7.html) や環境を指定してコマンドを実行する。`--chroot`を使えばルートディレクトリが変更できる。`-drop`は列挙された Capabilitiy を除去する。





### コンテナ作成時の注意点

サイトに書いてある通り `docker container create bash` で進めると、コンテナ作成時に `execve '/bin/bash' failed!` というエラーが起こる。このエラーは `/bin/bash` の実行に失敗すると起きる。また、`/bin/bash` が実行できない状態で ` sudo chroot $ROOTFS` を実行すると `chroot: failed to run command ‘/bin/bash’: No such file or directory` というエラーが出る。

`/bin/bash` の実行に失敗する理由は、そもそも bash が存在しなかったり必要なライブラリがなかったりなどが考えられる。ややこしいが、bashが存在するが必要なライブラリがない場合も `No such file or directory` が出る。

必要なライブラリは `ldd`  で調べられる。

```shell
ubuntu@utm:~$ ldd /bin/bash
	linux-vdso.so.1 (0x0000ffffb109f000)
	libtinfo.so.6 => /lib/aarch64-linux-gnu/libtinfo.so.6 (0x0000ffffb0edf000)
	libdl.so.2 => /lib/aarch64-linux-gnu/libdl.so.2 (0x0000ffffb0ecb000)
	libc.so.6 => /lib/aarch64-linux-gnu/libc.so.6 (0x0000ffffb0d58000)
	/lib/ld-linux-aarch64.so.1 (0x0000ffffb106f000)
```

エラーの原因は ubuntu と `docker container create bash` で作成したコンテナのアーキテクチャが異なることだと考えられる。bash の代わりに arm 版の ubuntu を利用すると（`sudo docker container create ubuntu --platform linux/arm64`）、`execve '/bin/bash' failed!` は起こらなくなった。

（`--platform linux/arm64` をつけて bash コンテナを作成しても実行できなかったが、それについては深掘りしていない）



### コンテナ内でのコマンド実行例

```shell
# uname -n
c75b7d0e-2ab4-42c8-8fd8-14d5e0a58b94
# id
uid=0(root) gid=0(root) groups=0(root),65534(nogroup)
# ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.0   2308   836 pts/0    S    03:18   0:00 /bin/sh
root          13  0.0  0.0   6420  1656 pts/0    R+   03:19   0:00 ps aux
# mount
proc on /proc type proc (rw,relatime)
devpts on /dev/pts/0 type devpts (rw,nosuid,noexec,relatime,gid=5,mode=620,ptmxmode=000)
devpts on /dev/pts/ptmx type devpts (rw,nosuid,noexec,relatime,gid=5,mode=620,ptmxmode=000)
udev on /dev/null type devtmpfs (rw,nosuid,noexec,relatime,size=1948692k,nr_inodes=487173,mode=755,inode64)
# ip link
/bin/sh: 5: ip: not found
```

` /bin/hostname $UUID` を実行したので `uname -n` で uuid が返っている。コンテナの外では uid や gid は `1000(ubuntu)` だったが、コンテナ内では `0(root)` になっている。

`ip` は実行できなかった。



### IPC Namespace

IPC Namespace では SysV IPC オブジェクトや POSIX キューを隔離する。 interprocess communication mechanisms なので、プロセス間の通信をするための資源を隔離するのに使っていそう。



#### SysV IPCオブジェクト

[sysvipc(7) - Linux manual page](https://man7.org/linux/man-pages/man7/sysvipc.7.html)

System V interprocess communication (IPC) mechanisms というものがある。これは

- message queues
- semaphore sets
- shared memory segment

のことらしい。



#### Posix キュー

[mq_overview(7) - Linux manual page](https://man7.org/linux/man-pages/man7/mq_overview.7.html)

プロセス間でメッセージをやり取りするためのキュー。



### \$\$

\$\$ で現在のプロセスを取得できる。

```shell
    PID TTY          TIME CMD
   7276 pts/0    00:00:00 bash
   7361 pts/0    00:00:00 bash
   8143 pts/0    00:00:00 bash
   8608 pts/0    00:00:00 ps
ubuntu@utm:~$ echo $$
8143
```

上記の例では bash が複数動いている。\$\$ が 8143 なので、`echo $$` を実行したのは3番目の bash である。

```
unshare --mount-proc -uipr --fork /bin/sh
# echo $$
1
```

当然だが、`unshare`で PID を共有しないことで `$` が1を返すことが確認できる。



#### Namespace に接続する

> Dockerではdocker execコマンドが実行中のコンテナに接続するコマンドとして広く使われていますが、こちらも実行中のコンテナ(プロセス)の Namespace に関連付けて、指定したコマンドを実行するものです。
>
> [コンテナ技術入門 - 仮想化との違いを知り、要素技術を触って学ぼう - エンジニアHub｜Webエンジニアのキャリアを考える！](https://eh-career.com/engineerhub/entry/2019/02/05/103000)

なるほど〜〜



### SUID rootとCapability

> 次の例はコピーした `/bin/ping` に RAW ソケットを扱う権限(CAP_NET_RAW)だけを与えます。コピーした ping のオーナーは非特権ユーザとなります。そのままでは権限がないため実行時にエラーとなります。

とあるが、手元の環境ではコピーした `ping` を実行できた。

```
ubuntu@utm:~$ ls -l ping
-rwxr-xr-x 1 ubuntu ubuntu 76552  6月 29 17:01 ping
ubuntu@utm:~$ ./ping -c1 -q 127.0.0.1
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.

--- 127.0.0.1 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.110/0.110/0.110/0.000 ms
```

理由は調べていない。





## 感想

知らない概念がいくつも出てきた。全部を理解するのは難しそうなので、とりあえず概念や機能を知る程度の理解にとどめておく。

実際にコマンドを実行して名前空間の分離や Control Group を使った資源の制限をしたことで、単に文章を読むよりも内容を頭に入れられた気がする。



>また、コンテナの要素技術の使い方を学ぶにはこの記事で登場した `unshare` コマンドや `capsh` コマンド、ip(`ip netns`)コマンドのソースコードを読むのがおすすめです。システムコールをどのように使っているかを知れば、他のコンテナラインタイムの実装を調査する際にも大いに役に立つでしょう。
>
>ここから、さらに掘り下げて学びたい方はカーネルのソースコードを読みましょう。コンテナの要素技術をすべて一度に学ぶのは大変です。まずはそれぞれの概要を理解して、その中から興味をもったものに的を絞って掘り下げていくことをおすすめします。

コードリーディングはあまりやったことはないけど、確かに勉強になるなー。使っている言語とかフレームワークとかを眺めてみようかな。





