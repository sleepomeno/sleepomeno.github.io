---
layout: post
title: Partial matching in R
date: 2015-02-20 
comments: true
external-url:
categories: [programming]
tags: [r,,syntax,,statistics]
published: true
sidebar: nocollapse
---
I've not been too exposed to statistics programming in the last few
year, however, sometimes it couldn't be avoided - and R couldn't be
avoided! (I still have too much self-esteem to think about
falling back to Excel, even for the simplest things.)

I don't hate R and I don't like R; it just strikes me as very
**strange**. Often, the syntax strikes me as odd and above all, the
multitude of ways to express the same thing reminds of my little Perl
experience. Anyway, I have subscribed to the Coursera R course for fun
and in hope to somehow "get the better of R", to grok in on a deep
level or to at least get a more profound idea as to why I don't like it ;)

Anyway, here is a language construct which is very **strange** and a
little bit absurd, no whatever how often I think about it. It's called
<span class="underline">partial matching</span>. To put it bluntly, partial matching makes it
possible to avoid spelling out the whole name of an element of a list
in oder to access it. Let's have a look.

<!-- more -->

``` r
x <- list(a_is_the_first_letter = 1 : 5)
```

Now let's access `a_is_the_first_letter`! That's the normal way:

``` r
x$a_is_the_first_letter
# 1 2 3 4 5
```

However, you could make your life a lot "easier":

``` r
x$a
# 1 2 3 4 5
```

Well, the crucial question is: what happens if the prefix of your
partial matching is not unique?

``` r
x <- list(a_is_the_first_letter = 1 : 5,
          a_is_my_first_letter_too = 6 : 10)
x$a
# NULL
```

The result is `NULL`!

``` r
x <- list(a_is_the_first_letter = 1 : 5,
          a_is_my_first_letter_too = 6 : 10)
x$a_is_m
# 6 7 8 9 10
```

Here the prefix is unique again. Hooray!

Funny, isn't it? I don't like it, though. Why? Because it's not 'obvious'.
You need to know that feature beforehand, otherwise the fact that an
accidentally misspelled field is handled the same way as a non-unique
field prefix (both returning `NULL`) is awkward, to say the least.
It's nearly as though I said to the R interpreter: 'Give me field
xy or any field that is somehow similar&#x2026; or just do what you fucking
want (= return NULL)!' Anyway, it introduces complexity and indeterminism into the code. 

There is another twist to partial matching. Of course, there is more
than one way to access a field of a list. Making use of the double bracket
syntax, that feature of partial matching is handled differently.

``` r
x <- list(a_is_the_first_letter = 1 : 5)
x[["a"]]
# NULL
```

Using the double bracket field accessing method, partial matching is
not the default. But R is perly so you still have a way to get that
behavior in a different way:

``` r
x[["a", exact = FALSE]]
# 1 2 3 4 5
```

At least I now have a better idea why I don't really like R. It
introduces a sort of laisser-faire programming which I consider too
"inexact". I mean, would you really want something like the following to be the
future of programming:

``` java
interface God { 
    void killMankind();
    void keepUpTheGoodWork();
}

// ...
god.k() // What the hell happens? Who cares.
```
