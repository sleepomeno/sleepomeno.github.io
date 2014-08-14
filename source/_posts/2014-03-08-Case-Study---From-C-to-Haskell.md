---
layout: post
title: Migrating a mutating algorithm from C to Haskell
date: 2014-03-11 
comments: true
external-url:
categories: [programming]
tags: [haskell,performance,ST,laziness,mutation,C]
published: true
sidebar: collapse
---
I've recently stumbled on a C implementation of an algorithm computing
the *combinations without repetition* (of a certain size **k**) of the first **n** natural
numbers. So the wanted result is a list of combinations like for
example `0 1 2 3 4` or `11 13 20 33 49` in the case of `k=5` and
`n=50` (*without repetition* means that no number occurs twice in the
same combination). As a matter of fact, I wanted to migrate that
function to Haskell; so this post is about the evolution of the
solution I came up with. I guess this case study is somehow kind of exemplary for
the thought process which you need to undergo whenever you migrate a
not-so-trivial algorithm from C to Haskell as it touches upon the
topics of *laziness* and *mutation*.

<!-- more -->

# The C Version
So let's start with the C Version:

``` c
#include <stdio.h>

int idx = 0;
/* puts all combinations into the array of its first argument */
void combinationsWithoutRepetition(int *combinations, int *feld,int bound,int length,int pos,int val){ 
  if(pos==length) {
    int i;
    for(i=0; i<length; i++) {
      combinations[idx++] = feld[i];
    }
  } else {
    int* feldPos = &feld[pos];
    int i;
    for(i=val;i<bound;++i){ 
      *feldPos=i; 
      combinationsWithoutRepetition(combinations,feld,bound,length,pos+1,i+1); 
    }
  }
} 
int main(int argc, char **argv) {
  int n=50;
  int k=5;
  int nrOfCombinations = 2118760; // assume that's correct for n=50,k=5
  int *combinations;
  combinations = malloc(nrOfCombinations*k*sizeof(int));

  int *singleCombination;
  singleCombination = malloc(k*sizeof(int));

  combinationsWithoutRepetition(combinations,singleCombination,n,k,0,0); 
  int i = 0;
  for (i=0; i < 50; i=i+5) {
    printf("%d %d %d %d %d \n", combinations[i],combinations[i+1],combinations[i+2],combinations[i+3],combinations[i+4]);
  }
}
```

So `combinationsWithoutRepetition` does all the work, however, memory
needs to be allocated for the two pointers to int first. (Surely, in a
real program `nrOfCombinations` would call a subroutine computing the
necessary number of computations, I omitted it for brevity's sake.) In
the end, the computed combinations can be accessed through the pointer
`combinations`.

Anyway, `combinationsWithoutRepetition` didn't look straightforward to
me, I didn't really understand how it worked and above all, I couldn't
see how I could tweak the algorithm so that I could do without the mutation
of `combinations` and `idx` in the Haskell solution. Consequently, I decided to
translate the C version more or less directly to Haskell, using the
`ST` monad.

The `ST` monad makes it possible to have references pointing to
mutable memory in Haskell. This comes in handy when you want to solve
a problem for which there is no efficient algorithm known doing
without mutation. In our case it gives us the power to create a first
running Haskell version without fully understanding the underlying
algorithm of the C implementation. Bear in mind that you always need to run `runST` to
get a value out of the `ST` monad like below.

## The ST Version
``` haskell
comb1 :: Int -> [Int] -> [[Int]]
comb1 k elements = runST $ do
  let bound = length elements
      boundMinus1 = bound-1
      elementArray = listArray (0, bound-1) elements

      comb1' :: STRef s [[Int]] -> (Int, Int) -> ST s ()
      comb1' combos  (pos, val) = 
        let comb1'' currentCombo (!pos, val)
              | pos == k  = modifySTRef combos ((:) currentCombo)
              | otherwise = forM_ [val..boundMinus1] $ \x -> comb1'' (elementArray!x : currentCombo) (pos+1,x+1)
        in
         comb1'' [] (pos, val)
  combos <- newSTRef []
  comb1' combos (0,0)
  readSTRef combos
```

This version already has two conceptual advantages: It can use an arbitrary list
of `Int` s as its second parameter (actually it could even be polymorphic
in the type of the list) and returns a list of lists which is
semantically more correct than the C implementation which implicitly
returned a long concatenation of the combination lists. Moreover, I
didn't need any mutable equivalent of `idx`.

Obviously, I wasn't too satisfied with this implementation, though.
Above all, the lack of *laziness* proves to be really annoying - the
whole list of combinations needs to be computed before you can access
the first element of it! This is devastating as in every real word
scenario of a decently large `n` and `k` the resulting list of
combinations is unlikely to fit into your available memory. So comes
the lazy `ST` monad to the rescue! 

## The Lazy ST Version
``` haskell
comb2 :: Int -> [Int] -> [[Int]]
comb2 k elements = L.runST $ do
  let bound = length elements
      boundMinus1 = bound-1
      elementArray = listArray (0, bound-1) elements

      comb2' :: STRef s [[Int]] -> (Int, Int) -> L.ST s [[Int]]
      comb2' combos  (pos, val) = 
        let comb2'' currentCombo (!pos, val)
              | pos == k  = do { L.strictToLazyST $ modifySTRef combos ((:) currentCombo); return [currentCombo] }
              | otherwise = fmap concat $ forM [val..boundMinus1] $ \x -> comb2'' (elementArray!x : currentCombo) (pos+1,x+1)
        in
         comb2'' [] (pos, val)
  combos <- L.strictToLazyST $ newSTRef []
  comb2' combos (0,0)
```

Anyway, that's the first lazy `ST` implementation I could come up with
and luckily, it gave me the intuition how I could get completely rid of the `ST`
monad. It is obvious that the `modifySTRef` calls are absolutely
pointless as `fmap concat` just concatenates the `[currentCombo]`
lists returned by the base cases of the recursion and `combos` is not
even considered in the result of the computation. So let's see the
version resulting from throwing the `ST` monad into the garbage can:

## The No ST Version
``` haskell
comb3 :: Int -> [Int] -> [[Int]]
comb3 k elements = 
  let bound = length elements
      boundMinus1 = bound-1
      elementArray = listArray (0, bound-1) elements
      comb3'  (pos, val) = comb3'' [] (pos, val)
        where
        comb3'' currentCombo (!pos, val)
          | pos == k  = [currentCombo]
          | otherwise = concat [comb3'' (elementArray!x : currentCombo) (pos+1, x+1) | x <- [val..boundMinus1]]
      in
  comb3' (0,0)
```

That's much better but still a little obscure. In the end, I found a nice
declarative solution at last:

## The Declarative Version
``` haskell
comb4 :: Int -> [Int] -> [[Int]]
comb4 0 _      = [[]]
comb4 n (x:xs) = map (x:) (comb4 (n-1) xs) ++ comb4 n xs
comb4 _ _      = []
```

It just reads as: "In order to get all *k*-combinations of a *n*
length list take the first element of the list, prepend it to all
combinations of size *k-1* of the tail of the list and then add all
those *k*-combations of the tail of the list!" It finally makes sense
when you think about it for a long time ;) In addition, that approach
can be made a little bit more efficient for certain *n* and *k* using
a very simple memoization strategy. (This simple strategy very quickly
eats up your memory, though.)

## The memoized Declarative Version
``` haskell
-- Version with very simple memoization ("memo table")
combTable = [[ comb5 n (drop elementNr numbers) | elementNr <- zeroToLength] | n <- zeroToLength]
   where
   zeroToLength = [0..length numbers]

comb5 :: Int -> [Int] -> [[Int]]
comb5 0 _      = [[]]
comb5 k (x:xs) = map (x:) (combTable !! (k-1) !! newlength) ++ (combTable !! k !! newlength)
                where
                    newlength = n-length xs
comb5 _ _      = []
```

# Conclusion
Originally, I planned to examine each version's performance in detail,
however, that soon felt too cumbersome to me. Anyway, the *lazy*
versions do have a significant practical advantage as they do not need
to compute all combinations in order to get the first 10 combinations!
Judging from a few tests I have made, it also turns out that `comb3` (not using mutation) performs better
than both versions using `ST` even when all combinations are
requested so this seems to be a case where mutation does not buy you
anything in Haskell. If things look differently on your machine, feel
free to tell me ;)

You can find all solution versions <a href="/combinations/haskell-all.hs" target="_blank">here</a>, ready for GHCi. Anyway, feel
free to post other solutions to the problem which may score better in
terms of laziness/time performance/space performance/etc.
