---
layout: post
title: Preview your Github Markdown before committing!
date: 2015-01-19 
comments: true
external-url:
categories: [emacs]
tags: [github,markdown]
published: true
sidebar: 
---
Writing software documentation can be a pretty dull task and is
neglected too often (at least by me). But what purpose does the best program
serve if nobody knows how to use it? None.

Looking at Github, the Markdown formatted **README.md** is the front
 page of every repository and the first (and mostly only) source of
 documentation. 
Until recently, I have treated my **README.md** files rather shabbily; I
 would have thought that this lack of motivation originates from a
 general dislike of writing documentation, however, I might have
 changed my opinion. This <a href="http://increasinglyfunctional.com/2014/12/18/github-flavored-markdown-previews-emacs/" target="_blank">blog post</a> has opened my eyes to an
 alternative explanation: writing Github Markdown documentation is not
 trivial when you don't have a chance to preview the resulting
 markdown before committing! In that case the output will look
 not as expected more often than not - which makes the committer angry
 as s/he needs to push another commit just for improving the Markdown.
 Anyway, I remember feeling annoyed quite frequently by that procedure in
 retrospective. It does not need a stretch of imagination to foresee
 the negative influence that annoyance has on my willingness to
 provide **README.md** documentation&#x2026; ;)

The solution is obvious but not that trivial. Obviously, there surely
are plugins for various IDEs which can parse Markdown and output HTML
markup. I remember having once installed such an Eclipse plugin. But things get trickier as Github does not use vanilla
Markdown but its own brand of Markdown - it is not that easy to find a
way to display Github Markdown with good confidence in its conformity;
in addition it shouldn't force me to use any special IDE as I do most
stuff in Emacs.

The script that I use now was mentioned in the referenced blog post
above: <a href="https://gist.github.com/joshuamiller/6d58f8bd239df56cabe8" target="_blank">flavor.rb</a>. It is a ruby script which actually asks the Github API (!) to do the hard
work, namely providing the HTML output! That looks stupid at first
glance but it is actually the only way to be really sure of the
preview's congruence with the actual display on the Github page&#x2026;