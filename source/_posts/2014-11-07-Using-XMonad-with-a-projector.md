---
layout: post
title: Using XMonad with a projector
date: <span class="timestamp-wrapper"><span class="timestamp">&lt;2014-11-07 Fre&gt;</span></span> 
comments: true
external-url:
categories: [productivity,setup]
tags: [haskell,xmonad]
published: true
sidebar: nocollapse
---
I've been using XMonad for a few years now (lately in combination with
GNOME) but just recently I have found a way to make it work in a useful way
in the context of a presentation with a projector as a second screen.

In general, XMonad does have decent multi-screen support. Building on
Xinerama, the default configuration provides key-binding support for
three screens; how workspaces are mapped to the screens and how this
mapping can change, respectively, can be pretty confusing at first, though -
it is best explained in <a href="http://www.reddit.com/r/xmonad/comments/ndww5/dual_screens_multi_monitors_tips_and_tricks/c38dsfx" target="_blank">here</a>. Whenever I want to use a projector
things get pretty tricky, however.

<!-- more -->

The thing is: Using a projector as a second screen, I want to have
exactly the same workspace (accordingly the same windows, same layout,
obviously) on both screens. Apparently, I could do that by 'mirroring'
the screens and thus circumventing XMonad multi-screen support. I'm
not too happy with it, though, as, for some reason, I can't get *xrandr*
make show a reasonable resolution on both screens in that scenario -
part of what is shown on own screen is hidden on the other. Disabling
mirroring, however, it is **impossible** for XMonad to show exactly the
same on both screens - obviously, this is a restriction imposed by
Xinerama as it manages all workspaces across screens as *one*
large workspace under the hood.

The cure for that disease is the trick I found in another reddit
thread:
<a href="http://www.reddit.com/r/xmonad/comments/2ha25r/same_workspaces_on_multiple_monitors_without/ckrobfj" target="_blank">same workspaces on multiple monitors</a>.
So let's assume the following setup: Workspace 1 is shown on your
projector screen, Workspace 2 is shown on your internal screen. You
start a VNC server on workspace 1 on localhost:

{% codeblock %}
x11vnc -usepw -clip xinerama0 -noxdamage -geometry 1920x1080
{% endcodeblock %}

(You might need to replace 'xinerama0' by 'xinerama1'. '1920x1080'
conforms to the resolution of my internal screen. '-noxdamage' is
optional but seems to be recommended.)

On Workspace 2 you start a VNC client:

{% codeblock %}
vncviewer ViewOnly=1 UseLocalCursor=0 localhost:0
{% endcodeblock %}

(Again you might need to replace 'localhost:0' by 'localhost:1'.)

Well, now you get to see your projected presentation on your internal screen,
too, showing the X display of your VNC server screen! Move to Workspace 1 and start your presentation (or your live
coding, for example) while you actually watch your presentation on your internal screen on Workspace
2! As a bonus, during your presentation you could easily do things
which are not intended to be shown by the projector and/or move
windows from an internal workspace to Workspace 1 when they need to be shown.

Starting the vncviewer with the 'ViewOnly' option makes it necessary
that you actually make your live in-presentation changes on Workspace
1, as I said (while watching your own changes on Workspace 2 on your
internal screen). That's my recommendation anyway, in my experience the viewer setup thus works more
stable and some keyboard inputs wouldn't be translated correctly from
the viewer to the server using a non-ViewOnly mode.
