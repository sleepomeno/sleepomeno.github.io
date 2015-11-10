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

main = putStrLn . show . choose $ comb1 k numbers
