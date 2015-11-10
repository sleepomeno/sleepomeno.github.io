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

main = putStrLn . show . choose  $ comb2 k numbers
