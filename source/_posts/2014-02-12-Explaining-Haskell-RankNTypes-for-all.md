---
layout: post
title: Explaining Haskell RankNTypes for all
date: <span class="timestamp-wrapper"><span class="timestamp">&lt;2014-02-12 Wed&gt;</span></span> 
comments: true
external-url:
categories: [programming]
tags: [haskell,ghc,rankntypes,extension]
published: true
sidebar: collapse
---
The Glasgow Haskell Compiler supports a language extension called
`RankNTypes` which I've had my problems to understand. The moment I
understood that it mostly refers to first-order logic universal
quantification things became easier, though&#x2026; but first let's explore why we
need it in a step-by-step example.

<!-- more -->

## length :: forall a. [a] -> Int
``` haskell
:t length
-- length :: [a] -> Int
length [1,2,3]
-- 3
let intLength :: [Int] -> Int; intLength = length
:t intLength
-- intLength :: [Int] -> Int
intLength [1,2,3]
-- 3
```

We start with the well-known polymorphic function `length` in a fresh
GHCI session. Above we
see how the type checker instantiates `a` to be `Int` in the type of
`intLength`. Likewise we could create a function `charLength` -
anyway, `length` can be instantiated to oblige to a list of any type
we want, so it is defined *for all* possible types `a`. For the sake
of simplicity, I'll call a function like `intLength` (which actually
corresponds to instantiating the type variable `a` of `length`) a
*version* of `length`.

As a matter of fact, a normal Haskell type signature such as `[a]
-> Int` always implies that the type variable(s) are universally
quantified with 1 *forall* section located at the beginning of the
type declaration. `length`'s type thus corresponds to `forall a. [a] ->
Int`. We call such a type a *Rank-1-Type* as there is 1 *forall* in
the type annotation. The fact that we can omit the *forall* usually -
and aren't used to it as a consequence - will make things look complicated
when we actually need it, as we'll see later on. In the end, *forall* provides
a scope just like its first-order logic equivalent.

## Apply a length-like function to a list
``` haskell
let apply :: ([a] -> Int) -> [a] -> Int; apply f x = f x
apply length "hello world"
-- 11
apply intLength [1,2,3]
-- 3
```

The `apply` function just applies a function that takes a list and
returns an `Int` (like `length` does) to a value.
Nothing fancy nor useful at all, obviously. Still, let's note that under the hood
the type of `apply` is `forall a. ([a] -> Int) -> [a]`. So far, so
good, the type checker is happy. Now let's a write a function
`applyToTuple` that applies a function like `length` to a tuple of
lists so that the lists of the tuple can be of different types.

## Apply a length-like function to a tuple of lists
``` haskell
let applyToTuple f (a@(x:xs),b@(y:ys)) = (f a, f b) :: (Int, Int)
applyToTuple length ("hallo",[1,2,3])
--No instance for (Num Char)
--  arising from the literal `1'
-- ...
:t applyToTuple
-- applyToTuple :: ([t] -> Int) -> ([t], [t]) -> (Int, Int)
```

I wrote `applyToTuple` without a full type signature. `:: (Int,Int)`
just makes sure my wanted result type and by the help of the list
destructuring `a@(x:xs)` I make sure that the type inference algorithm
will conclude 
that I have a tuple of lists in mind. Consequently, the type of the
function given to `applyToTuple` is inferred to correspond to
`length`'s type; at least, that's what I would expect naively.

However, type inference of `applyToTuple` does not result in the type I had
in mind. As we can see the types of lists in the tuple `([t],[t])` are
the same so that calling `applyToTuple length` with a heterogeneous
tuple like `("hallo",[1,2,3])` doesn't work. Being stubborn I could
then try "forcing" the type by providing a type signature:

``` haskell
let applyToTuple :: ([a] -> Int) -> ([b],[c]) -> (Int, Int); applyToTuple f (x,y) = (f x, f y)
-- Couldn't match type `b' with `a' ...
-- Couldn't match type `c' with `a' ...
```

This attempt also fails as GHCI complains about the fact that the
types `b` and `a`, `c` and `a` respectively, do not match! However, the
`length`-like function `([a] -> Int)` should be applicable to a list of
whatever type, shouldn't it?!? That's the moment
you'd start doubting either GHCI or your mental health as you know precisely
that it *should be possible* to write such a function. After all, you
know intuitively that it **is** possible to apply a function like `length`
to both parts of a heterogeneous tuple of lists as in the code below;
doing that in a more generic way in a function like `applyToTuple`
should be possible as well!

``` haskell
-- Obviously, that works without a problem:
(\(a,b) -> (length a, length b)) ("hallo",[1,2,3])
-- (5,3)
```

## applyToTuple :: (forall a.[a] -> Int) -> ([b],[c]) -> (Int, Int)
Well, there is just one explanation: the type `([a] -> Int)
->([b],[c]) -> (Int, Int)` is not really what we need for our purpose.
In fact, we need `RankNTypes`!
We first enable the extension in GHCI and can then write the correct
`applyToTuple` implementation using the `forall` keyword in the type
of the first parameter function. (If you want to use the
`RankNTypes` extension in a file to compile, you actually need to add `{-#
LANGUAGE RankNTypes #-}` at the top of the file)

``` haskell
:set -XRankNTypes
let applyToTuple :: (forall a.[a] -> Int) -> ([b],[c]) -> (Int, Int); applyToTuple f (x,y) = (f x, f y)
applyToTuple length ("hello", [1,2,3])
-- (5,3)
```

This time it works! :-)

## Explanation
We noted earlier that every Haskell type signature's type variables
are *implicitly* universally quantified by an 'invisible' `forall`
section. Thus, under the hood we get the types as follows:

``` haskell
-- just a reminder:
-- length :: forall a. [a] -> Int 
let intLength :: [Int] -> Int; intLength = length 

-- wrong applyToTuple:
let applyToTuple :: forall a b c. ([a] -> Int) -> ([b], [c]) -> (Int, Int); applyToTuple f (x,y) = (f x, f y) 
-- correct applyToTuple:
let applyToTuple :: forall b c. (forall a. [a] -> Int) -> ([b], [c]) -> (Int, Int); applyToTuple f (x,y) = (f x, f y)
```

Now things get clearer: The function in the type of the correct
`applyToTuple` has the type `(forall a. [a] -> Int)` which is exactly
the type given for `length` above, hence it works. On the other hand,
the type `([a] -> Int)` of the function parameter in the wrong
`applyToTuple` type signature *looks* like the type of `length` **but it isn't**!

Have a look at what the type
checker would "think" confronted with the wrong `applyToTuple` type
signature. When it reads the expression `applyToTuple length` it would
expect the type variables `a`, `b` and `c` to be **different**
concrete types, so `([a] -> Int)` might become `([Char] -> Int)` or
`([Int] -> Int)` like our `intLength` function, shortly, some
*version* of `length`. In the implementation `(f x, f y)` seeks to apply that *version* of
`length` to two lists of **different** types - however, **any** *version* of
`length` expects its list to always be of 1 concrete type only, e.g. `Int` in
the case of our function `intLength`, consequently, the type checker
refuses the lists of the tuple to possibly be of different types!

Why does the correct definition of `applyToTuple` work then? It
expects a `length`-like function of type `(forall a. [a] -> Int)`, that's a function
which works **for all** types `a`, no matter what type you throw at it!
Thus, it forces that function to be a polymorphic function just like
`length` and rules out any candidate *version* of `length` (like `intLength`) as a consequence.
Since you can throw a list of any type at that function it can deal with the 2
lists of different types and the code compiles! 

## Conclusion
Using `RankNTypes` and the *forall* keyword you can specify that a
function's argument needs to be a *polymorphic* function (like
`length` in our example). In spite of the fact that you can omit the top-level
*forall* in the type signature of a polymorphic type, you need to include
it when you reference it as a parameter.

In a future blog post I will investigate an important application of
`RankNTypes` in the Haskell standard library. It will be about the
`ST` monad which provides a *safe* environment for **mutation** in
Haskell with the help of `RankNTypes`. Mutation and Haskell?! Yes,
you can do it thanks to `RankNTypes`!

*PS: There is a nice*
<a href="http://stackoverflow.com/questions/3071136/what-does-the-forall-keyword-in-haskell-ghc-do" target="_blank">stackoverflow thread</a> *which investigates the use of "forall" in other
language extensions as well. Actually, my "applyToTuple" function is based on*
<a href="http://stackoverflow.com/a/3071932/928944" target="_blank">that answer</a> of the thread.
