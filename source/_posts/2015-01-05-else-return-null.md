---
layout: post
title: else return null
date: 2015-01-05 
comments: true
external-url:
categories: [programming]
tags: [haskell,maybe,monadplus]
published: true
sidebar: 
---
I guess everybody has a story or two in store about Nullpointer
exceptions in Java (or in any language with nullable values). Sooner or later you will make the acquaintance of the dreaded stacktrace line
denoting that you did something terribly wrong, demanding a value
where none exists, and you just wonder *why, how the hell can that
object be null?!* during an hour of painful debugging&#x2026; you know
that? Good. Well, I won't ponder over how to avoid it, how to apply
proper error handling etc. (that's way too complicated, I'm tired) but I'd just like to point out my personal
favourite, the
famous `else return null` idiom.

<!-- more -->

Anyway, the below snippet shows what I actually mean by that.

``` java
// Version 1
if (password == "12345")
   return valuableTreasure;
else 
   return null;

// or, equivalently
// Version 2
if (password == "12345")
   return valuableTreasure;
return null;
```

To make things more familiar, in Version 2 you could imagine multiple `return null` lines hidden in
various control structures in an endless method and you surely get an idea
how people feel when they try to reason about an object being *null*
or not.
Anyway, spotting an `else return null` I always get a bad gut feeling
saying that things are not what they are supposed to be. I'm aware
that this obviously touches upon the question if you should avoid
*null* values altogether. Anyway, I can't help my bad gut feeling
whenever I see it ;)

The funny thing is that I recently wrote similar code myself; that
alone would not be a surprise yet, but I actually wrote it in
Haskell which does not have that notion of *null* values and the
corresponding Nullpointer exception. In Haskell, there is the <a href="https://www.haskell.org/haskellwiki/Maybe" target="_blank">Maybe monad</a> which facilitates chaining "partial" computations together without
the risk of a Nullpointer exception. Here is the snippet of that code
(obviously, only the `else Nothing` is 'important'). 

``` haskell
newState =
  if not shouldBeCompiled && w' == view T.word W.immediate' then
   (oldState ^. lastColonDefinition ) >>=
   (\x -> return $ oldState & definedWords %~ (ix x %~ set isImmediate True))
  else 
   Nothing
```

Anyway, believe me, if you ever write such an `else Nothing` in Haskell, that should
be the trigger - take a deep breath, take a coffee and think about your
problem again. At the least, you are overcomplicating things as using
the *Monad* or *MonadPlus* nature of *Maybe* would make life easier
but probably it's an indication that your thoughts are about to go
astray and you get lost in old `else return null` habits or worse - so better
stop it and take a break!

How would the *MonadPlus* and *Monad* instances make life better? Look
at the below version. In any case, it's functionally equivalent, so
how would it be 'better'? In my opinion, it conveys much
more the impression that the programmer actually knows what they are doing.

``` haskell
newState = do 
  guard $ not shouldBeCompiled && w' == (view T.word W.immediate')

  x <- oldState ^. lastColonDefinition
  return $ oldState & definedWords %~ (ix x %~ set isImmediate True)
```

Essentially, the `guard` function does the trick. `guard`, which has the type
*guard :: MonadPlus m => Bool -> m ()*, makes the containing *do*
block evaluate to `Nothing` if the `Bool` argument evaluates to
`False`. In that sense, the `guard` expression actually looks like an
assertion! The whole *MonadPlus* magic can be further explored <a href="http://en.wikibooks.org/wiki/Haskell/MonadPlus" target="_blank">here</a>.

In my case, I finally ended up removing those lines altogether. As suspected, the
good old `else Nothing` was the symptom that I had lost track of
what I was coding at all - completely lost in nothingness - and I really needed a
break.

So what is your typical 'silly code' that you typically start writing when
you should rather take a break?
