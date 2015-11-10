---
layout: post
title: Toying with Racket
date: <span class="timestamp-wrapper"><span class="timestamp">&lt;2015-09-13 Son&gt;</span></span> 
comments: true
external-url:
categories: [programming,tennis]
tags: [racket,graphics]
published: true
sidebar: 
---
2 hours to go&#x2026; I've been waiting for the men's tennis US Open final
to start. What should I do? In the end, I've been killing time listening to <a href="http://www.functionalgeekery.com/episode-24-matthew-flatt/" target="_blank">that</a> Functional Geekery podcast episode
which features Matthew Flatt talking about the <a href="http://racket-lang.org/" target="_blank">Racket</a> programming
language. Realizing the irony, my thoughts went something like: "Racket, tennis?! Can't be a coincidence! Still
some time to burn, so I will programm something tennis-like in
Racket!" So let's open the Racket <a href="http://docs.racket-lang.org/quick/" target="_blank">quickstart</a> to somehow learn Racket
and get an idea what the tennis-like thing should be.

<!-- more -->

{% img left /images/court.png 200px  %}

The idea came instantly when I saw that Racket offers quite
newbie-friendly picture drawing examples in its tutorial. Now, it's
obvious what I would do, isn't it? Exactly, I would draw a tennis
court! So I <a href="http://download.racket-lang.org/" target="_blank">downloaded</a> Racket and found the executable
for the Racket IDE DrRacket in the **bin** folder of the resulting
directory. Given the examples of the <a href="http://docs.racket-lang.org/quick/" target="_blank">quickstart</a> tutorial I could come
up with that code which got the job done. And it even has (kind of) the blue
color of the US Open hard court ;)

{% codeblock %}
(let* ([color "blue"]
      [blue (lambda (pict) (colorize pict color))]
      [double (blue (filled-rectangle 203 30))]
      [base (blue (filled-rectangle 90 133))]
      [margin 3]
      [doubles (hc-append margin double double)]
      [service (blue (filled-rectangle 110 65))]
      [services (vc-append margin service service)]
      [middle1 (hc-append margin base services)]
      [middle2 (hc-append margin services base)]
      [middles (hc-append margin middle1 middle2)])
    (frame (frame (vc-append margin doubles middles doubles) #:color "white" #:line-width 18) #:color color #:line-width 12))
{% endcodeblock %}

The code can also be found in that <a href="https://gist.github.com/sleepomeno/f8f0af59b19324166619" target="_blank">gist</a>.

Anyway, now the final is about to start, so only a few impressions of
using Racket for the first time: DrRacket proved easy to use and the
<a href="http://docs.racket-lang.org/pict/Basic_Pict_Constructors.html" target="_blank">documentation</a> made it easy to find the right functions for drawing. It
was quite pleasant to see that I could get things done in Racket even
under severe time pressure ;)

Go, Federer!
