# Module Documentation

## Module Data.Inject

#### `Inject`

``` purescript
class Inject f g where
  inj :: forall a. f a -> g a
  prj :: forall a. g a -> Maybe (f a)
```


#### `injectReflexive`

``` purescript
instance injectReflexive :: Inject f f
```


#### `injectLeft`

``` purescript
instance injectLeft :: Inject f (Coproduct f g)
```


#### `injectRight`

``` purescript
instance injectRight :: (Inject f g) => Inject f (Coproduct h g)
```




