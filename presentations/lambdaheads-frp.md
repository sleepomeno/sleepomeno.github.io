% Haskell FRP in the browser
% Gregor Riegler
% Lambdaheads --  Nov 11, 2015

# Functional Reactive Programming

## FRP is...

* 'spread-sheet'-like programming

* used for GUIs, robotics, music...

* about datatypes that represent 'a value over time'
       + 'somehow compose them' to wire your GUI components

. . . 
 
$\Rightarrow$ _no need for mutation, handlers, callbacks_

## Event

![](imgs/event.png)

. . .

e.g. a Mouse click :: Event ()

## Behavior

![](imgs/behavior.png)

. . .

e.g. the content of an input field :: Behavior String

## FRP Frameworks 1/2

* GHC: Threepenny-gui
      + uses FRP library 'reactive-banana'
      + uses the web browser as a display $\Rightarrow$ all 'logic' is done in the server process
      + alternative to desktop applications built with native toolkits

## FRP Frameworks 2/2

* GHCJS: Reflex-DOM
      + GUI 'logic' is compiled to JavaScript
      + = web binding for FRP library 'reflex'
      + alternative to typical JavaScript MVC Frameworks

# Threepenny-gui

## No-FRP Example

```
document.getElementById("displayInput").value = "Not set";

function buttonClicked() {
   var content = document.getElementById("sourceInput").value;
   document.getElementById("displayInput").value = content;
}
```

```
<input id="sourceInput" type="text" />
<button onclick="buttonClicked()">Click me</button>
<input id="displayInput" type="text" />
```

<input id="name" type="text" />
<button onclick="buttonClicked()">Click me</button>
<input id="value" type="text" />


<script language="javascript">
document.getElementById("value").value = "Not set";
function buttonClicked() {
   var content = document.getElementById("name").value;
   document.getElementById("value").value = content;
}
</script>



## FRP Thinking 1/3

* `bSource :: Behavior String`
       + the content of the sourceInput
* `eClick :: Event ()`
       + the button gets clicked
* `bDisplay :: Behavior String`
       + must be composed from the above
 

## FRP Thinking 2/3

* `bSource :: Behavior String, eClick :: Event ()`
* `bDisplay :: Behavior String`
       + It should contain "Not Set" at first
       + When _eClick_ occurs it should have the value of _bSource_
* $\Rightarrow$ find the appropriate combinators for expression that in [the documentation](http://hackage.haskell.org/package/threepenny-gui-0.6.0.3/docs/Reactive-Threepenny.html)
 
## FRP Thinking 3/3

```
bSource :: Behavior String
eClick :: Event ()
```

```
-- Combinators we find in Reactive.Threepenny
stepper :: MonadIO m => a -> Event a -> m (Behavior a)
(<@) :: Behavior a -> Event b -> Event a
```

```
-- Our solution
bDisplay = stepper "Not Set" (bSource <@ eClick)

-- Make displayInput show bDisplay
```

## Threepenny Example

```
app :: Window -> UI ()
app w = void $ do
  rec sourceInput <- UI.input
      displayInput <- UI.input
      clickBtn   <- UI.button #+ [ string "Click Me" ]

      let eClick :: Event () = UI.click clickBtn
      sourceB  <- stepper ""  . UI.valueChange $ sourceInput
      displayB <- stepper "Not Set" (sourceB <@ eClick)

      element displayInput # sink value displayB

  getBody w # set children [getElement sourceInput, getElement clickBtn
                          , getElement displayInput]
```

## Combinators
```
accumB :: MonadIO m => a -> Event (a -> a) -> m (Behavior a)
accumE :: MonadIO m => a -> Event (a -> a) -> m (Event a)
unions :: [Event a] -> Event [a]
apply :: Behavior (a -> b) -> Event a -> Event b 
stepper :: MonadIO m => a -> Event a -> m (Behavior a)
unionWith :: (a -> a -> a) -> Event a -> Event a -> Event a
```
... a few more (see the [the documentation](http://hackage.haskell.org/package/threepenny-gui-0.6.0.3/docs/Reactive-Threepenny.html))

## Threepenny Demo

## Threepenny summary

* Nice API
      + Event/Behavior composing functions have nice types,
        well-documented and are in [one module](http://hackage.haskell.org/package/threepenny-gui-0.6.0.3/docs/Reactive-Threepenny.html))
        + _Event_ and _Behavior_ are Applicative and Functor instances
* Learn how use it by analyzing the examples in the [samples directory](https://github.com/HeinrichApfelmus/threepenny-gui/tree/master/samples)
* Unfortunately, no "production-ready" binding for GHCJS yet ([Francium](https://github.com/ocharles/Francium) the only project I found)


# GHCJS

## What is GHCJS

* Haskell to JavaScript compiler, based on GHC
* has become increasingly popular, lately
* build/dependency management not yet on par with GHC

## Using Reflex with GHCJS

* There is a
  [repo of the Reflex author](https://github.com/ryantrinkle/try-reflex)
  which provides a GHCJS environment with the Reflex library in a Nix sandbox

* For build/dependency management of GHC projects there is
  [stack](https://github.com/commercialhaskell/stack/). **Does stack
  support GHCJS?**

## Not yet

* However, it is in development and can already be used experimentally providing even
a GHCJS interpreter 
      + is explained in [https://github.com/luigy/try-stack-reflex](https://github.com/luigy/try-stack-reflex)
```
stack upgrade --git
./try-stack-reflex ghcjsi   # takes a long time! 
stack ghci                  # Voilà!
```

. . .

* or wait for a few months until *stack* fully supports GHCJS

. . .

$\Rightarrow$ Using GHC/GHCJS in a single project is going to be "magical"!


# Reflex

## Reflex libraries

* [reflex](http://hackage.haskell.org/package/reflex) is the basic FRP library
       + uses a *Dynamic* type which wraps a *Behavior* and an *Event* of its changes
       + combinators in [Reflex.Class](https://hackage.haskell.org/package/reflex-0.3/docs/Reflex-Class.html) and [Reflex.Dynamic](https://hackage.haskell.org/package/reflex-0.3/docs/Reflex-Dynamic.html)
* [reflex-dom](http://hackage.haskell.org/package/reflex-dom) is the web binding for it

## Reflex example

```
app = do
  sourceInput <- textInput def

  rec let config = def { _textInputConfig_initialValue = "Not Set" }
                       & setValue .~ (updated dDisplay)
      displayInput <- textInput config
      dDisplay <- holdDyn "" eContentWhenClicked

      eClick <- button "Click Me"

      let bSource = current $ _textInput_value sourceInput
          eContentWhenClicked = tag bSource eClick 
  return ()
```
```
current :: Dynamic t a -> Behavior t a 
updated :: Dynamic t a -> Event t a 
tag :: Reflex t => Behavior t b -> Event t a -> Event t b 
holdDyn :: MonadHold t m => a -> Event t a -> m (Dynamic t a) 
```

## More combinators
```
mapDyn :: (Reflex t, MonadHold t m) =>
          (a -> b) -> Dynamic t a -> m (Dynamic t b) 
foldDyn :: (Reflex t, MonadHold t m, MonadFix m) =>
          (a -> b -> b) -> b -> Event t a -> m (Dynamic t b) 
attachDynWith :: Reflex t =>
          (a -> b -> c) -> Dynamic t a -> Event t b -> Event t c 
count :: (Reflex t, MonadHold t m, MonadFix m, Num b) =>
          Event t a -> m (Dynamic t b) 
...
```

* Type signatures not as nice as comparable threepenny combinator type signatures
* _Dynamic_ is not a a Functor, so you often need _mapDyn_ $\Rightarrow$ somehow ugly

## Reflex Demo

## Reflex/Threepenny conclusion

* Reflex type signatures more complex 
* Reflex documentation not on par with threepenny-gui's documentation
* Reflex adds DOM elements implicitly whereas threepenny does it explicitly
* Neither framework uses HTML markup directly (like AngularJS)


