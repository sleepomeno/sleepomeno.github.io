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

main = putStrLn . show . choose $ comb5 k numbers
