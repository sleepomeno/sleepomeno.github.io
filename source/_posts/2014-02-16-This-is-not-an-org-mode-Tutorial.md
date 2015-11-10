---
layout: post
title: This is not an org-mode tutorial
date: 2014-02-16 
comments: true
external-url:
categories: [org-mode]
tags: [productivity,plaintext]
published: true
sidebar: 
---
I guess it was about a year ago when I decided to give `org-mode`
another go; I had used it before but hadn't been able to quite wrap my head
around it. This time I managed to get through the hard first
difficulties so that I'm a vivid `org-mode` user by now&#x2026; but first
make clear: what is `org-mode` anyway and what has it to do with plain text?

<!-- more -->

## Org-mode
`org-mode` is an Emacs major mode. There is lots of
<a href="http://orgmode.org/#docs" target="_blank">documentation and tutorials</a> on `org-mode` and I won't be tempted to
give another tutorial (the sheer amount of `org-mode` features to present would
make that post very, very long&#x2026;). I'd rather like to give an
explanation of its philosophy and applicability.

On its <a href="http://orgmode.org/" target="_blank">official website</a> it is characterized as
follows: **Org mode is for keeping notes, maintaining TODO lists, planning projects, and authoring documents with a fast and effective
plain-text system**. Although that obviously is a description without a doubt,
`org-mode` still has a broader area of applicability - in fact, the HTML title
of that <a href="http://orgmode.org/" target="_blank">official website</a> describes it best: **Your Life in Plain Text**.

To put it bluntly, `org-mode` can act as a replacement for any
application you normally use for structuring any text-based
information. Well, what is 'text-based' information? Actually, this is
pretty much everything; only images and audio files come to my mind as
exceptions. However, even for images and audio files you normally
store text-based information in the form of meta information. So,
generally, nearly all information that needs structuring is of a
text-based nature which is accessible to `org-mode` as a consequence.

## Org-mode's killer feature
So the 'killer feature' of `org-mode` is not any specific
application - neither 'TODO lists', nor
'planning projects' - it is rather the fact that you can use it for
structuring/managing whatever text-based information you want! You
don't need to use 20 different applications for your daily
'informational needs' any longer, you just need 1 to rule them all!
That fact alone of replacing 20 different things with 1 single, more
general thing somehow makes my programmer's soul smile - just imagine
the improvement of code quality when you factor out a common pattern
of 20 similar methods into 1 generalized method. Or: Imagine a
'collection' interface which provides methods like 'length' for all
'collection' implementations&#x2026; Anyway, I'm
convinced that such an abstraction not only shines in programming
but also in 'real life' - look at it from this point of view: for any
rise of efficiency you'll achieve in mastering
`org-mode` you would have needed an equal rise of efficiency in all 20
applications in the first place! *And:* you **own** all your information in plain
text. I'll explain in a second the benefits of 'owning'; first, let's address
another objection which will lead us there.

## We are slaves of interfaces
You might argue that you don't even need close to 20 applications but you'd be
surprised how fast they add up: preparing slides,
managing your calendar, writing your thesis, managing contacts, TODOs,
writing a blog post, adding bookmarks, etc. - with the rise of IT we have gradually become slaves
of a lot of programs. Still some of us might remember the *organizers*
we once had for taking down anything a decade or two ago - handwritten, plain text was
good enough in those times - they were the **Personal Information
Managers** of the pre-IT era. Gradually, we have been convinced to use
different desktop applications with specialized interfaces for
managing text-based information; the smartphone and tablet era has
actually even amplified that trend of veering away from plain text.

## We don't own our information
Those 20 applications from before have 'hidden' our information in databases which only understand SQL.
So you would need to learn SQL to connect to 'your' information - apart from
the fact that the application in question might be a web application
and you don't have any direct access to the server where 'your'
information is located&#x2026; that legal loss of ownership is not what bugs
me for this blog post's sake, though. It is rather losing one's grasp
on one's information.
Suppose it's a TODO list application: you need the
corresponding app for our tablet/smartphone/etc. to get to your
TODO items. For many domains of applications a plain text export option can
**not** be taken for granted. Even for an application with a that simple
domain model like a TODO list application you might have troubles to
just copy the TODO items from your browser window as this would not
save the "done" status ;) (Calendar applications normally are the
exception as they provide some standardized import/export options)

I want to emphasize that this should **not** be understood as a rant on the IT world and evil web
apps which hide my data ;) On the contrary, I like my iPad and the
applications which provide me nice interfaces to add my text-based
information. I just pity the fact all those IT developments have led to
a loss of control of our information which is equally proportional to the
degree of which we moved away from plain text! Anways, we are lucky, there is a
possible escape: Use `org-mode`'s plain text as the *data source* and
the beautiful iPad app as its *view* only! For instance, that works well
for my `org-mode` calendar data which I can sync with Google Calendar.
Another example is this blog post: I'm actually writing this in
`org-mode` and export it in a Markdown format which the Octopress
blogging framework understands.

Anyway, I will perhaps post several customizations of how I tailored `org-mode` to my
needs in future posts.

## Conclusion
`org-mode` provides the power of structuring text-based information
and numerous export options to communicate those information to the
outside-world. If you care about information and you are an Emacs user anyway, give it a try.

If you shy away from Emacs you might be interested in the web
application <a href="https://workflowy.com/" target="_blank">workflowy</a>. It provides some portion of `org-mode`'s benefits of
managing hierarchical textual information with only structure and no
layout in mind. If you need the full power there is no alternative to
`org-mode`, though. After all, there is only one ring to rule them all.