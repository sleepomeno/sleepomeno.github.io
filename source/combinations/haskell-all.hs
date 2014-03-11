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

comb4 :: Int -> [Int] -> [[Int]]
comb4 0 _      = [[]]
comb4 n (x:xs) = map (x:) (comb4 (n-1) xs) ++ comb4 n xs
comb4 _ _      = []

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

-- Evaluate combinations of running every combX version
main = mapM_ (putStrLn . show . choose) $ map (\x -> x k numbers) [comb1, comb2, comb3, comb4, comb5]
