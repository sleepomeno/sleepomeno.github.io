---
layout: post
title: Approximating PI with PureScript
date: 2015-03-14 
comments: true
external-url:
categories: [programming,web]
tags: [purescript,functional,javascript,jquery,graphics]
published: true
sidebar: collapse
---
Oh, it is Pi day! To be honest, I had not known about it until today
but it somehow made it into my Twitter stream. Well, after some relaxed Saturday morning browsing I stumbled across the <a href="http://demonstrations.wolfram.com/ApproximatingPiWithInscribedPolygons/" target="_blank">Wolfram Pi approximation demonstration</a>. It looks like this:

<script type='text/javascript' src='http://demonstrations.wolfram.com/javascript/embed.js' ></script><script type='text/javascript'>var demoObj = new DEMOEMBED(); demoObj.run('ApproximatingPiWithInscribedPolygons', '', '389', '613');</script><div id='DEMO_ApproximatingPiWithInscribedPolygons'><a class='demonstrationHyperlink' href='http://demonstrations.wolfram.com/ApproximatingPiWithInscribedPolygons/' target='_blank'>Approximating Pi with Inscribed Polygons</a> from the <a class='demonstrationHyperlink' href='http://demonstrations.wolfram.com/' target='_blank'>Wolfram Demonstrations Project</a> by Rob Morris</div><br />

Pi is approximated by computing the area of the inscribed
polygon and by dividing that area by the square of the circle radius -
after all, the area of a circle is **r²π**. Obviously, that idea is
that beautiful and so simple that Pi has thus been approximated thousands of
years ago (of course, there are many better and faster ways!), so
I decided to implement it myself.

<!-- more -->

## PureScript
Some days ago I stumbled across **PureScript** which compiles to
JavaScript. It is heavily influenced by Haskell and shares its quality
of static typing. However, it has been designed to target JavaScript
from the getgo such that it incorporates the strict evaluation
semantics of JavaScript. In addition, it provides a syntax similar to
native JavaScript for accessing object properties. Given some Haskell knowledge,
PureScript seems to be a decent alternative to Fay or Haste for
creating Javascript code! So I thought I would give
it a try and implement something similar to the above Wolfram
demonstration! So this is the result I accomplished after one day's
work on a <a href="/pi/html/index.html" target="_blank">PureScript clone</a>:

<iframe src="/pi/html/index.html" width="500" height="700" style="margin:auto;display:block"></iframe>

### PureScript learning resources
First of all these are the best resources on PureScript development that I found:

<ul><li>

<a href="https://gist.github.com/paf31/8e9177b20ee920480fbc" target="_blank">24 days of PureScript</a>

</li><li>

<a href="https://leanpub.com/purescript" target="_blank">PureScript by Example</a> - very detailed but excellent!

</li><li>

<a href="https://github.com/purescript/purescript/wiki" target="_blank">PureScript Wiki</a> 

</li></ul>

<a href="https://gist.github.com/paf31/8e9177b20ee920480fbc" target="_blank">24 days of PureScript</a> gives a very good overview of the PureScript
library landscape. Above all, running code for every introduced
library is given which is crucial to getting quickly started. In
addition, there is a project called <a href="http://pursuit.purescript.org/" target="_blank">Pursuit</a> which provides a search
engine for functions of PureScript packages. It is still far from
being as useful as Hoogle or Hayoo for Haskell development, though.

## PureScript libraries and building process
PureScript libraries are managed by **bower** which has worked
surprisingly well for me. However, at the beginning I had problems getting the interpreter `psci` running with
all dependencies as I'm not used to **grunt** (and **npm**) which are
typically needed in the whole building process. Anyway, when I decided
to use certain PureScript libraries for my implementation their
integration worked like a charm! 

## HTML5 Canvas bindings
PureScript has very decent wrappers of the HTML5 Canvas API in form
of `purescript-canvas` and `purescript-free-canvas`. Obviously, I made
heavy use of those to get the circle and the polygon drawn.

``` haskell
center = { x : 210, y : 210 }
drawCircle = do 
  arc { x: center.x, y: center.y, r: radius, start: 0, end: Math.pi * 2 }
  setFillStyle "#000000"
  fill
```

As an argument to `arc` we actually have an example of the *Object*
syntax of PureScript which is just like native JavaScript.

## Angular, React or something else?
PureScript does have bindings to AngularJS and React (find PureScript
libraries by <a href="http://bower.io/search/?q=purescript" target="_blank">searching bower</a>), however, they are both still
experimental and alpha. So I somehow didn't want to commit to something
half-working which could be very hard to understand for a PureScript
newbie like me. Anyway, I decided that the JQuery binding of
`purescript-jquery` should be enough for my Pi approximation application; in the end, I
also used `purescript-rx` (also mentioned on <a href="https://gist.github.com/paf31/8e9177b20ee920480fbc" target="_blank">24 days of PureScript)</a>
but I only scratched the surface of reactive PureScript UI modelling.

## What about the slider?
I definitely wanted a fancy slider for setting the number of vertices
of the polygon like in the Wolfram demo - without
too much ado, I immediately decided on using the vanilla <a href="http://jqueryui.com/slider/" target="_blank">JQuery-UI
slider</a>. Copy-Paste. That however means that my PureScript has to
somehow interact with the native slider JavaScript.

## The main function
The first few lines are about getting representations of the HTML
elements with `purescript-jquery`. Then I define event handlers for
changing the number of vertices and for toggling the checkbox to
show/hide the triangles. `onAsObservable` actually is from the
`purescript-rx` binding to the reactive <a href="https://github.com/Reactive-Extensions/RxJS" target="_blank">RxJS</a> libraries which could be
used to define complex event handling.

``` haskell
main = do
  canvas <- getCanvasElementById "canvas"
  context <- getContext2D canvas
  verticesInput <- select "#vertices"
  polygonArea <- select "#polygonArea"
  pi <- select "#pi"
  triangles <- select "#triangles"

  let updateUI num showTriangles = do 
      { pArea : polygonAreaPercent, pi : piApprox } <- showPolygon canvas context num showTriangles
      setText (show polygonAreaPercent <> "%") polygonArea
      setText (show piApprox) pi
  let updateUI' = do 
        showTriangles <- ((== "true") <<< stringify) <$> getProp "checked" triangles
        num <- (stringify >>> readInt 10) <$> getValue verticesInput
        updateUI num showTriangles

  trianglesChange <- "click" `onAsObservable` triangles
  trianglesChange `subscribe` \_ -> void updateUI'

  verticesChange <- "focus" `onAsObservable` verticesInput
  verticesChange `subscribe` \_ -> void updateUI'

  updateUI defaultVertices defaultShowTriangles
```

## The Foreign Function Interface
In the above code I accessed the current value of the checkbox and the
slider value with the `purescript-jquery` functions `getValue` and
`getProp`. However, it was surprisingly difficult to use those values
as they were not of type `String` but `Foreign` and I got those
dragged into the field of the Foreign Function Interface for
communicating with JavaScript code. Anyway, after some digging in I
ended up writing the function `stringify` which trivially transforms the
incoming Javascript value to a `String`.

``` haskell
foreign import stringify
  "function stringify(x) {\
  \  return x+\"\";\
  \}" :: Foreign -> String
```

That's an example of how you can integrate JavaScript functions in
PureScript. It is a little bit of a joke as of now sice you need to add all
those backslashes, however, things might get easier in case PureScript
gets a meta programming facility like **TemplateHaskell** in the Haskell
world in the future.

## Conclusion
All in all, PureScript really makes a nice impression. There is already
a surprising number of libraries available; decent, mature bindings to
Angular or React would be crucial for getting easy web development
adoption, though. Meta programming integration of JavaScript code would
also prove very nice as would be Source Map support&#x2026; anyway, I'm
looking forward to using it again and might get into improving it myself.
