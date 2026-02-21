---
title: 構文解析初心者でも解ける問題を集めた＋解説
tags: ["競プロ", "構文解析"]

---

水色コーダーが構文解析の問題を解きました。

問題の難易度は、AOJ−ICPC基準で300点前後だと思います。

## 構文解析とは

構文解析とは、**やるだけ**問題です。
ここ<span style="font-size: 150%"> [構文解析 Howto](https://gist.github.com/draftcode/1357281) </span>にもそう書いてあります。

構文解析初心者の方は、まずはこれを読みましょう。
**読みましょう**。

ここを読めば、この記事で解説している問題に挑めるはずです。

## [Smart Calculator](http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=0109&lang=jp)

四則演算の問題です。
テンプレを間違いなく写しましょう。

## [Unordered Operators](http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2613)

### 問題概要

四則演算の優先順位を自由に入れ替えて、解を最大化しましょう。
ただし、割り算は使いません。

### 解法

全ての優先順位を全通り試せば良いです。
テンプレを見ると分かりますが、同じ関数にある演算子は優先順位が同じで、先に処理される演算子ほど優先度が高いです。
例えば、全ての演算子の優先順位を同じにしたければ、expr関数に全ての演算子を書けばいいです。

```cpp
long long expr(State &begin) {
    long long ret = term(begin);

    for (;;) {
        if (*begin == '+') {
            begin++;
            ret += term(begin);
        } else if (*begin == '-') {
            begin++;
            ret -= term(begin);
        } else if (*begin == '*'){
            begin++;
            ret *= term(begin);
        } else {
            break;
        }
    }
    return ret;
}
```

とりあえず全部書けば通りますが、面倒なのでどうにかして楽に書きましょう。

4つのparserを書いたり( http://tubo28.me/blog/post/2015/06/21/aoj2613/ )、bitを使って全通り試したりしましょう。

ACされたコード  
http://judge.u-aizu.ac.jp/onlinejudge/review.jsp?rid=2330451#1

### 注意点

**解の初期化に注意する**  
解のmaxを取っていくのなら、解を入れる変数を小さい数値で初期化しなければいけません。
ここでは最小値で初期化しましょう。雑に小さい数値を入れるとWAです。

## [Operations with Finite Sets](http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=1012)

### 問題概要

集合の演算を行う構文解析です。
演算子は u, i, d, s, c の5つあり、式はセット名、演算子、括弧からなります。
この問題の式は、以下のように与えられます。

```
<expr> ::= <term> <op> <term>
<term> ::= c <factor> | <factor>
<factor> ::= ( <expr> ) | <set>
<set> ::= A | B | C | D | E
<op> ::= u | i | d | s
```

<span style="font-size: 80%">見様見真似なので、正しいか全く自信がないです。</span>

### 解法

形は変われどやっていることは同じです。
集合の計算は関数があるので、演算子の処理を考える必要はありません。

順番にテンプレを書き換えていきましょう。

<span style="font-size: 120%">number関数</span>  
集合を返すだけです。
文字列を数値に変換するなどの操作がないので、number関数を使わなくても問題ありません。

<span style="font-size: 120%">factor関数</span>  
括弧を処理するか数を返すかのどちらかなので、そのままで問題がなさそうです。

<span style="font-size: 120%">term関数</span>  
ここで行う演算は 'c' のみです。今見ている文字が'c'のとき、factor関数の戻り値を補集合にすればよいです。
'c'ではなかったら、戻り値をそのまま返します。

<span style="font-size: 120%">expr関数</span>  
四則演算で言うところの + や - にあたる部分を u, i, d, s を変えます。
条件分岐させて演算するようにします。

ACされたコード  
http://judge.u-aizu.ac.jp/onlinejudge/review.jsp?rid=2330475#1  
構文解析部分は50行と短いです。

### 注意点

**集合はソートしておく。**  
set\_unionやset\_intersectionは、ソートされていないと正しい集合を返しません。

**NULLを出力する。**  
解が空集合の場合、NULLを出力しなければなりません。
ここでいうNULLはテキストの "NULL" です。 '¥0' ではないです。

## [How can I satisfy thee? Let me count the ways...](http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=1155)

### 問題概要

0, 1, 2, P, Q, R, -, *, +, (, ) からなる式が与えられます。
P, Q, R は、それぞれ 0 ~ 2 までの数値へ置き換えることができます。
このとき、式の解が 2 であるような P, Q, R の組み合わせは何通りあるでしょうか。

### 解法

P, Q, R の組み合わせは 27 通りしかないので、全部試して解が 2 になる回数を数えればよさそうです。
次に、式をどのようにして演算すれば良いのかを考えます。

演算子 +, * は、与えられた数値のmax, minを取ればよいです。
 <span>-</span> 演算子は、 http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=1012 の c 演算子のように処理すればよさそうです。

つまり、expr→term（ここで <span>-</span> 演算子を処理）→factor→numberとすれば計算できます。
ただ、 <span>-</span> 演算子は連続することもあります。
ですので、もし <span>-</span> 演算子があれば、term関数を呼ぶ。
それ以外はfactor関数を呼ぶようにして、連続した <span>-</span> 演算子を処理します。

```cpp
int term(State &begin){
  if (*begin == '-') {
    begin++;
    //inverted(x) = xを反転した値
    return inverted(term(begin)); 
  } else {
    return factor(begin);
  }
}
```

ACされたコード  
http://judge.u-aizu.ac.jp/onlinejudge/review.jsp?rid=2330491#1

## [Shipura](http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570)

### 問題概要

\>\>、S<>、数値からなる式を計算する。

### 解法

まず、空白はあってもなくても変わらないので全部消します。
次に、\>\> 、S<>について考えます。
\>\>はexprで処理し、S<>はfactorの括弧の処理を少し書き換えて実装します。

\>\>を素直に実装すると、

```cpp
if(*being == '>' && *(begin + 1) == '>'){
  begin++; 
  begin++;
  ret = ret >> term(begin);
}
```

とやってしまいそうですが、少しまずいです。
まず、この条件では、”S< S< S< 1 > > >” このようなケースのときに、シフトを行ってしまいます。
３ つ '>' が並んでいるときは、シフト演算子ではありません。

```cpp
if(*begin == '>' && *(begin + 1) == '>' && *(begin + 2) != '>')
```

２つ**のみ**並んでいるときだけ、シフトしましょう。

次に、 "ret \>\> term(begin)" の部分に注目します。
上記の実装では、"1 \>\> 20000" という計算を行うこともあります。
これだとオーバーフローを起こして 0 ではない値になるので、シフト演算子の右辺は小さめに抑えたほうがよいです。

ACされたコード  
http://judge.u-aizu.ac.jp/onlinejudge/review.jsp?rid=2330540#1

### 注意点

**2 乗でオーバーフロー**
int型だとS<>を処理するときにオーバーフローします。

## まとめ

- 処理を関数にまとめて、順番を決めて、終わり。
- バグらせると辛い。
