# Module Documentation

## Module Control.Monad.Rec.Class

#### `MonadRec`

``` purescript
class (Monad m) <= MonadRec m where
  tailRecM :: forall a b. (a -> m (Either a b)) -> a -> m b
```

This type class captures those monads which support tail recursion in constant stack space.

The `tailRecM` function takes a step function, and applies that step function recursively
until a return value of type `b` is found.

Instances are provided for standard monad transformers.

For example:

```purescript
loopWriter :: Number -> WriterT Sum (Eff (trace :: Trace)) Unit
loopWriter n = tailRecM go n
  where
  go 0 = do
    lift $ trace "Done!"
    return (Right unit)
  go n = do
    tell $ Sum n  
    return (Left (n - 1))
```

#### `tailRecM2`

``` purescript
tailRecM2 :: forall m a b c. (MonadRec m) => (a -> b -> m (Either { b :: b, a :: a } c)) -> a -> b -> m c
```

Create a tail-recursive function of two arguments which uses constant stack space.

#### `tailRecM3`

``` purescript
tailRecM3 :: forall m a b c d. (MonadRec m) => (a -> b -> c -> m (Either { c :: c, b :: b, a :: a } d)) -> a -> b -> c -> m d
```

Create a tail-recursive function of three arguments which uses constant stack space.

#### `tailRec`

``` purescript
tailRec :: forall a b. (a -> Either a b) -> a -> b
```

Create a pure tail-recursive function of one argument

For example:

```purescript
pow :: Number -> Number -> Number
pow n p = tailRec go { accum: 1, power: p }
  where
  go :: _ -> Either _ Number
  go { accum: acc, power: 0 } = Right acc
  go { accum: acc, power: p } = Left { accum: acc * n, power: p - 1 }
```

#### `monadRecIdentity`

``` purescript
instance monadRecIdentity :: MonadRec Identity
```


#### `monadRecEff`

``` purescript
instance monadRecEff :: MonadRec (Eff eff)
```


#### `monadRecMaybeT`

``` purescript
instance monadRecMaybeT :: (MonadRec m) => MonadRec (MaybeT m)
```


#### `monadRecErrorT`

``` purescript
instance monadRecErrorT :: (Error e, MonadRec m) => MonadRec (ErrorT e m)
```


#### `monadRecWriterT`

``` purescript
instance monadRecWriterT :: (Monoid w, MonadRec m) => MonadRec (WriterT w m)
```


#### `monadRecStateT`

``` purescript
instance monadRecStateT :: (MonadRec m) => MonadRec (StateT s m)
```


#### `forever`

``` purescript
forever :: forall m a b. (MonadRec m) => m a -> m b
```

`forever` runs an action indefinitely, using the `MonadRec` instance to
ensure constant stack usage.

For example:

```purescript
main = forever $ trace "Hello, World!"
```



