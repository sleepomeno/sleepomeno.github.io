---
layout: post
title: The notoriously point-free "((x.).)" trick
date: 2014-08-14 
comments: true
external-url:
categories: [programming]
tags: [haskell]
published: true
sidebar: collapse
---
<a href="http://www.haskell.org/haskellwiki/Pointfree" target="_blank">Point-free</a> code is ubiquitous in every well-polished Hackage library.
It's more concise than its pointed counterparts and feels more
"hygienic" as function composition immediately translates to its
mathematical background.

``` haskell
let pointFree = (+1) . read 
let notPointFree x = (+1) (read x)
-- notPointFree 'mentions' its argument "x"
```

So far, so good. However, you get a problem in your chain of function
composition when your right-most function "takes two parameters".

``` haskell
let plusOne = (+1) :: Int -> Int
let readTwoArgs = (\x y -> read x + read y) :: String -> String -> Int

let coolSolution = plusOne . readTwoArgs :: String -> String -> Int 
-- Type checker doesn't like coolSolution

let boringSolution x y = plusOne (readTwoArgs x y) 
-- it's boring since it's not point-free
```

Unfortunately, `coolSolution` is not well-typed; this might drive you
nuts for some time: It's obvious that composing those functions must
somehow work. You'd think: "Even GHCI must have understood what I
mean!" However, Haskell doesn't care for what you mean as much as it
cares for type-safety ;) ! So you might fall back on `boringSolution`
which is only half the fun as it's not point-free&#x2026; anyway, there IS
a way to compose those functions!

<!-- more -->

In the following I will use
<a href="http://www.haskell.org/haskellwiki/GHC/TypedHoles" target="_blank">Typed holes</a>. They are a nice tool to look into the type checker's
"thoughts". 
Well, first have a look at why `coolSolution` did not type-check at all.

{% codeblock %}
    Couldn't match type ‘Int’ with ‘String -> Int’
    Expected type: Int -> String -> Int
      Actual type: Int -> Int
    In the first argument of ‘(.)’, namely ‘plusOne’
    In the expression: plusOne . readTwoArgs :: String -> String -> Int
{% endcodeblock %}

Essentially, this tells us that `plusOne` does not have the right type
to be used together with `(. readTwoArgs)`. Now let's ask this
question to the type checker: What do I need to apply to `plusOne` so
that you are happy?

``` haskell
((_ plusOne) . readTwoArgs) "3" "2" :: Int
```

The answer we get is: 

{% codeblock %}
    Found hole ‘_’
      with type: (Int -> Int) -> (String -> Int) -> [Char] -> Int
    Relevant bindings include it :: Int (bound at <interactive>:88:1)
    In the expression: _
    In the first argument of ‘(.)’, namely ‘(_ plusOne)’
    In the expression: (_ plusOne) . readTwoArgs
{% endcodeblock %}

Okay, this help us. Our "hole function"'s type is `(Int -> Int) ->
(String -> Int) -> [Char] -> Int`. Now we just write that
function - actually, the type signature and our knowledge of what
should be the result of the whole expression give rise to that *unique* `holeFunction`:

``` haskell
let holeFunction plusOne' stringToInt string = plusOne' (stringToInt string)
let holeFunction plusOne' stringToInt string = plusOne' . stringToInt $ string
let holeFunction plusOne' stringToInt = plusOne' . stringToInt
let holeFunction plusOne' stringToInt = (.) plusOne' stringToInt
let holeFunction plusOne' = (.) plusOne'
let holeFunction = (.)
```

By (re)writing it in a point-free style and by applying eta-reductions we
get a very simple definition. It turns out that our `holeFunction` is
just ordinary function composition^^. Anyway, let's have a look if that works.

``` haskell
let coolSolution = ((.) plusOne). readTwoArgs
let coolSolution = (plusOne .). readTwoArgs
-- (coolSolution "3" "4") == 8
```

Yes, it does! That ".)." looks funny and will surely confuse everybody
whose doesn't know that "trick" (and does not have a type-checker in
their brain). However, it gets even funnier. When your right-most
function expects even more arguments you just add 'a couple of' ".)"s
in between!

``` haskell
let wasteFourArgs = (\a b c d -> read a + read b) :: String -> String -> String -> String -> Int
let coolSolution' = (((plusOne .) .) .). wasteFourArgs
```

## Conclusion
Thus, we have found a way to use the (point-free) function
composition even when you need to feed more than a single argument
into it!

As point-free code is more concise it can be clearer about what you
want to do, however, it can obfuscate your intentions as well! (Look
at those <a href="http://www.haskell.org/haskellwiki/Pointfree#Combinator_discoveries" target="_blank">combinators</a>). In the
case of this *((x.).)* trick, I think it can still be beneficial if
and only if everybody in your team "knows the trick" and does not have
to think about it. The nice reason is: As soon as you delete that ".)"
chain mentally you immediately grasp the meaning of the resulting function!
