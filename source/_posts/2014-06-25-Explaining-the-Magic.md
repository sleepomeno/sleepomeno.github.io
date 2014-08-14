---
layout: post
title: Explaining the Magic
date: 2014-06-25 
comments: true
external-url:
categories: [programming]
tags: [haskell]
published: true
sidebar: collapse
---
Yesterday I came across a <a href="http://www.reddit.com/r/haskell/comments/28zx87/whats_your_favorite_response_to_the_show_me_the/" target="_blank">post</a> on the haskell reddit where somebody
posted the following application of *replicateM*:

``` haskell
:m +Control.Monad
replicateM 3 "01"
-- ["000","001","010","011","100","101","110","111"]
```

## Dark Magic
It obviously results in all three-character combinations of zeros and
ones and in general, <em>replicateM x "01"</em> generates all x-character
combinations of zeros and ones accordingly.

*replicateM* is a standard library function and its haddock
documentation says: "*replicateM n act* performs the action n times,
gathering the results" and its type actually is `replicateM :: Monad m
=> Int -> m a -> m [a]`. So *replicateM* is **not** a function
explicitly crafted for the purpose of a "get me all x-ary combinations
of my string" task, it is actually defined for all monads. Just
imagine a more obvious application using the IO monad, which *performs the action of
printing hello 3 times and gathers the result*.

``` haskell
replicateM 3 (putStrLn "hello")
-- hello
-- hello
-- hello
-- [(),(),()]
```

It is typical Haskell practice to use a function with such a *general* look
to solve a rather *special* problem as our original one - to such a
degree that it seems like **magic** to programmers with a different
background. Actually, it might look like "dark" magic when you don't
grasp how/why the hell that result comes about in spite of looking at
the source of *replicateM*, and you might start getting annoyed with
Haskell altogether if that happens several times&#x2026; anyway, there is no
such thing as (dark) magic ;) so let's demystify that interesting example!

<!-- more -->

## Why it works
Before looking at the source - and getting to the operational side of
*replicateM* - let's ask ourselves *why* we get that result. 

By taking the documentation into account we can paraphrase <em>replicateM 3 "01"</em> by saying: 
<em>It performs "01" 3 times and gathers the results</em>. But what sort of action is <code>"01"</code>.
As a string is a list of characters, it's equal to <code>['0','1']</code> which denotes a 'non-deterministic' character value.
Imagine it as a two-faced character which doesn't know if it really is a '0' or a '1'! So what does <em>performing "01"</em> really mean?
I picture it as creating two parallel universes where that value dissolves into '0' in the first and into '1' in the second universe.
Performing another "01" branches those two universes again so that we get 4 universes. Doing that a third time, those 4 
universes branch again in choosing the third value of either '0' or '1'. As a result, we get 8 universes which really are 8 lists of characters.
When you gather them you obviously get <em>["000","001","010","011","100","101","110","111"]</em>! Confused? Maybe you like the 'How' better!

## How it works
<a href="http://www.haskell.org/hoogle/" target="_blank">Hoogle</a> is my tool of choice to quickly get to base library haskell
source. So <a href="http://hackage.haskell.org/package/base-4.7.0.0/docs/src/Control-Monad.html#replicateM" target="_blank">this</a> tells how *replicateM* is defined:

``` haskell
replicateM n x = sequence (replicate n x)
:t replicateM
-- replicateM :: Monad m => Int -> m a -> m [a]
```

By hoogling for <a href="http://hackage.haskell.org/package/base-4.7.0.0/docs/src/GHC-List.html#replicate" target="_blank">replicate</a> and <a href="http://hackage.haskell.org/package/base-4.7.0.0/docs/src/Control-Monad.html#sequence" target="_blank">sequence</a> we get the whole picture:

``` haskell

sequence ms = let k m m' = do { x <- m; xs <- m'; return (x:xs) } in foldr k (return []) ms
replicate n x           =  take n (repeat x)

:t sequence       
--sequence :: Monad m => [m a] -> m [a]
:t replicate
--replicate :: Int -> a -> [a]
```

*replicate* surely is the easiest function to grasp: `replicate n x`
results in a list with *n* elements of value *x*. For instance:

``` haskell
replicate 3 "01"
--["01","01","01"]
```

So we can actually get the following equations:

``` haskell
replicateM 3 "01" == sequence ["01","01","01"] == 
["000","001","010","011","100","101","110","111"]
```

So the magic somehow lies in the *sequence* method or rather in the
List monad!

### Sequence
As in our application *sequence* operates in the list monad you can
picture it using a list comprehension if you are more familiar with it:

``` haskell
sequence ms = let k m m' = [x:xs | x <- m, xs <- m'] in foldr k (return []) ms
-- m is a string, x is a character
-- m' is a list of strings (= the accumulator), xs is a string
:t sequence
-- sequence :: [[a]] -> [[a]]
```

Let's have a closer look at the last call of *k* in *sequence*.

``` haskell
replicateM 3 "01" 
-- == k "01" ["00","01","10","11"] ==
[x:xs | x <- "01", xs <- ["00","01","10","11"]]
-- == ["000","001","010","011"] ++ ["100","101","110","111"]
-- == ["000","001","010","011","100","101","110","111"]
```

At first *x* is selected to be '0' and prepended to all strings of
*xs*, the resulting list of strings is then concatenated with *x*
being '1' prepended to all strings of *xs* again. As a result, we will
always get a lexicographically correct ordering of all *n*-ary combinations of
"01" no matter what *n* we choose in **replicateM n ['0','1']**.

We have seen how an innocent-looking function like *replicateM* can -
when it is used with the List monad - produce a "magical" result, only to then discover that there is no magic involved ;)
