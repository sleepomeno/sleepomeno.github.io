---
layout: post
title: Book Catalogue
date: <span class="timestamp-wrapper"><span class="timestamp">&lt;2014-02-10 Mon&gt;</span></span> 
comments: true
external-url:
categories: [tech]
tags: [android,app,book]
published: true
sidebar: collapse
---
{% img left /images/book-catalogue.png 200px  %}

A week ago I've downloaded the app
<a href="https://play.google.com/store/apps/details?id=com.eleybourn.bookcatalogue&hl=de" target="_blank">Book Catalogue</a> from the Android Play store. As its name suggests it's
about creating a catalogue of your books. My family and I thought it would be handy
to file our books as we easily lose track of what books we actually own
and where we have stored them.

**Book Catalogue** makes it all possible: adding books by scanning the
barcode, by ISBN, by searching author/title or by adding all
information manually. Of course, every book is stored to be in exactly
one bookshelf - you can create as many bookshelves as necessary and
can name them as you want.

<!-- more -->

In addition, **Book Catalogue** provides syncing to a <a href="http://www.goodreads.com/" target="_blank">GoodReads</a> account.
I was really looking forward to this as it would make sharing the
digital library with my family extremely easy&#x2026; but only in theory.
It turned out that the GoodReads API only allows books to be added if
the book already exists on GoodReads. Anyway, the app makes a good
job to actually inform you which books couldn't be uploaded
successfully. You could then add those books on the GoodReads web
site, however, it's very cumbersome to do that for all missing books;
so far, I have filed a few hundred books and about a fifth of them
GoodReads does not know. So the GoodReads sync option is not *really*
usable after all (especially if you have many old or rare books as
they are then likely to be unknown to GoodReads). Luckily, a CSV
import/export is provided as well so that I'm not entirely dependent on
GoodReads's good will ;-)

Still, **Book Catalogue** really is a great app in my opinion (the imperfect GoodReads
API is not the app's fault). Firstly, it's interface is really beautiful and
provides nice ways to list the books in various ways. More
importantly, the identification of books by barcode and ISBN really
works well, including the downloading of meta information from several
sources like Amazon, LibraryThing, GoodReads and Google Books in
a blink!

Well, it needs to be mentioned that **Book Catalogue** is an Open Source
project and <a href="https://github.com/eleybourn/Book-Catalogue" target="_blank">can be found on GitHub</a>. So I might actually implement a
working syncing option when I'm really convinced it's worth the work.
Until then I'll keep fiddling with CSV export files to keep
everybody's installation up-to-date on our shared library. It's not
perfect but it works&#x2026;
