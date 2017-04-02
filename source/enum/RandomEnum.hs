{-# LANGUAGE GeneralizedNewtypeDeriving #-}

module RandomEnum where

import Control.Monad.Random
import Control.Monad

data Number = One | Two | Three | Four | Five | Six
            deriving (Enum, Bounded, Eq, Show)

instance Random Number where
  randomR = enumRandomR
  random g = randomR (minBound, maxBound) g

enumRandomR (a, b) g =
  case randomR (fromEnum a, fromEnum b) g of
    (x, g') -> (toEnum x, g')

newtype MaxBoundLessLikely a = MaxLessLikely {
  getValue :: a } deriving (Bounded, Eq, Enum, Show)

instance (Enum a, Eq a, Bounded a) => Random (MaxBoundLessLikely a) where
  randomR (a,b) g = case enumRandomR (a,b) g of
    result@(MaxLessLikely value, g') -> 
       if value == maxBound then
         enumRandomR (a,b) g'
       else result
  random g = randomR (minBound, maxBound) g

data Player = Me | Opponent

rollDice Me = getRandom
rollDice Opponent = fmap getValue getRandom

howManySixes :: MonadRandom m => Player -> Int -> m Int
howManySixes player nrThrows = do
  results <- replicateM nrThrows (rollDice player)
  return $ length . filter (== Six) $ results
