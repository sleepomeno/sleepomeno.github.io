{-# LANGUAGE NoMonomorphismRestriction,BangPatterns #-}
module Main where

import Data.STRef
import Control.Monad
import Control.Monad.ST
import Data.Array.ST
import Data.Array.MArray
import Data.Array
import qualified Control.Monad.ST.Lazy as L
import Control.DeepSeq

n = 50
k = 15

numbers = [0..n-1]

-- The function that evaluates the list of combinations to some extent
choose =  take 10 -- length

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

main = putStrLn . show . choose $ comb3 k numbers
