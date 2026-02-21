---
title: 『オブジェクト指向入門 第2版』の15章を読んだ
tags: ["技術書"]


---

第15章　多重継承

あるクラスが複数の親を持つとき，そのクラスは多重継承されている．例えば，ある会社が持っている飛行機（社用機）を*CompanyPlane*クラスで表現することを考える．当然，*CompanyPlane*は*Plane*を親に持つ．また，会計士から見れば，*CompanyPlane*は*Asset*（資産）でもある．この概念は，*ComnapyPlane*は*Plane*と*Asset*を親にすることで表現できる．

---

*CompanyPlane*は*Plane*のインスタンスな気もする．自分だったら，資産クラスに飛行機（社用機）インスタンスを持たせてしまいそう．

---

別の例として，*Numeric*（数値）と*Comparable*（比較可能な値）が挙げられる．この二つのクラスを親にすることで，比較可能な何らかの値を表すクラスを自由に作成できる．

## 特性の改名

2つ以上の親が同じ名前の特性を持つとき，子は特性を改名し，名前の衝突を回避する必要がある．

## 反復継承

祖先を共有するような継承（継承の関係が菱形になるやつ）を反復継承という．祖先の特性が複数の親から継承されることになるが，その特性が同じ名前である場合，それらはひとつの特性となる．特性が改名されていた場合，それは祖先のオリジナルの特性とは異なるものとなる．以下の例では，*pay_fee*というひとつの特性を，子孫が*pay_french_fee*と*pay_us_fee*に改名している．

```erlang
class Driver {
	pay_fee
	...
}
class FrenchDriver extend Driver { ... }
class USDriver extend Driver { ... }
class FrenchUSDriver extend FrenchDriver, USDriver {
  pay_french_fee  // FrenchDriverから継承したpay_feeをpay_french_feeと改名
  pay_us_fee      // USDriverから継承したpay_feeをpay_us_feeと改名                                                   
}
```

### 複製における衝突・選択

以下のようなクラスを考える．

```erlang
class A { method_A }
class B extends A {
	method_B // method_Aをmethod_Bに改名した上，再定義
}
class C extends A { }
class D extends B, C { }
```

*A*では，特性*method_A*が実装されている．*B*は*method_A*を*method_B*に改名，再定義している．*D*は*B*と*C*を継承している．

このとき，*D*は*method_B*と*method_A*を持つことになる．ここでは，名前の衝突は起こらない．次に，以下のコードを考える．

```erlang
a: A
d: D
a := d
a.method_A()	// 何が呼び出されるのか？
```

動的束縛によって，*method_A*は動的な型によって適切なものが実行される．しかし，この場合，*D*の*method_A*は，*B*から継承されたものと，*C*から継承されたものの二つ存在するため，どちらを呼び出せば良いのかわからない．このような場合では，*D*で，どちらの親から継承された特性を有効にするかを明示しなければならない．

---

この部分あまり理解できていないんだけど，名前の衝突を回避しても，わざわざ有効な特性を選択しなければならないところに複雑さを感じた．継承するときに，祖先が持つ特性から必要なものを選択するのは大変そう．

---

<!-- https://i.imgur.com/PQG6kP3 -->