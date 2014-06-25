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

comb4 :: Int -> [Int] -> [[Int]]
comb4 0 _      = [[]]
comb4 n (x:xs) = map (x:) (comb4 (n-1) xs) ++ comb4 n xs
comb4 _ _      = []

main = putStrLn . show . choose $ comb4 k numbers
