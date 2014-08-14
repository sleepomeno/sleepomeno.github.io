---
layout: post
title: Why Git is better than SVN... or is it?
date: 2014-02-24 
comments: true
external-url:
categories: [programming]
tags: [git,svn,scm]
published: true
sidebar: 
---
I don't know the numbers of SVN users vs. Git users but in any case there are
still many companies out there using SVN (probably more than using
Git?!) The question is: Why shouldn't they? Does Git actually provide
enough benefits which are worth the hassle of migrating? If yes, how
would you convince a SVN user? **Have you experienced that you couldn't comprehensively convince an SVN advocate of Git's
superiority although you're absolutely sure of it?** Or more generally:
How to best convince anybody to use another technology?

<!-- more -->

## "git svn differences"
It's interesting to actually google "*git svn differences*" and to
skim the results you get. The links I got led to some texts which rather 'objectively'
enumerate the core differences, however, there are also some which
clearly try to persuade the reader of Git's benefits. Anyway, in
both types of text the core differences tend to be the following:

<ul><li>

Git is faster

</li><li>

Branching is cheaper

</li><li>

Git is distributed, SVN is centralized

</li></ul>

Funnily enough, quite often I stumbled across what I call the tale of the 'Hermit
Programmer' scenario: The programmer has no connection to the SVN
server and can't commit therefore (imagine yourself miles away from
civilization and your life depends on the ability to commit just
*now*&#x2026; for whatever reason?!), whereas the programmer could commit to their local repository if they used Git.
Hooray! *Hooray!* Well, seriously&#x2026; it's a nice story but would it make you
shutdown your working SVN infrastructure in favor of Git, in view
of the complexity of migrating all repos, the need of learning Git
commands and your coworkers' anger when you tell them that they now
need to learn Git because some commands run *faster*?

## Wrong ways of advertising Git
Obviously, all the above arguments are valid but they are not really
convincing enough to persuade anyone to replace SVN with Git. Imagine a conversation between
a Git fan and a SVN user:

**Git fan**: Hey! You know, Git is really better, it works much
faster!

**SVN user**: Ah, I don't care. SVN is fast enough for me. I commit
once a day, that takes a few seconds, so no problem at all&#x2026;

**Git fan**: Anyway, it's not only faster, it also takes less disk
space, especially branches!

**SVN user**: Branches?! Ah, I don't even remember the last time I
created a branch. I know, theoretically you could create "feature branches" but
we don't do this at work. Why should we? Anyway, we have enough
storage in any case.

**Git fan**: Well, you know, *[dramatic pause as now comes his 'killer
argument']*, Git is distributed, so everybody has a local repository
and the whole project history. So it can't get lost when a *central*
server crashes!

**SVN User**: No problem, we create daily backups of all our
repositories. 

## The alternative
When I express my favorite Git features (and I'm somehow convinced that those actually
represent the *quintessence* of Git's benefits over SVN in daily use) it sounds like that:

<ul><li>

You can rewrite your history with Git!

</li><li>

You have "pull requests" for Open Source projects collaboration!

</li><li>

A branch is just a reference to a commit!

</li><li>

Instead of merging you can 'rebase' a branch on another!

</li></ul>

This time the above SVN User just wouldn't understand the meaning of
my arguments! I would need to first explain all that concepts in
detail and I'd need to introduce the workflows which are easily possible using Git
and impossible or a pain in SVN&#x2026; that lengthy talk doesn't go nicely with our
initial goal of convincing
our vis-à-vis with some quick bullet point arguments, obviously. So it
seems like we can't have it all. Unless you have some ideas.

## Conclusion
If you really want to convey Git's benefits to a fellow SVN coworker you need to take your
time. You need to **show** the features, you should give **examples**
and everyday **scenarios** where Git's capabilities make work at lot
easier. Believe me, such insights weigh a lot more than purely
rational arguments like *Git is faster*!
