---
layout: post
title: Using Google Universal Analytics with Octopress
date: 2014-08-16 
comments: true
external-url:
categories: [octopress]
tags: [blog,analytics]
published: true
sidebar: nocollapse
---
When I first set up my Github pages Octopress blog I followed <a href="http://stefanalfbo.github.io/blog/2013/04/17/octopress-google-analytics-github-pages/" target="_blank">those
instructions</a> to set Google Analytics tracking up - and it worked. However, in May Google
Analytics somehow decided to move my account to *Universal
Analytics* - maybe I had approved it without really knowing what it
meant&#x2026;

Well, what is *Universal Analytics*? I have no idea! The
important thing to notice is, though, that you need to change your
JavaScript **tracking code** if you make that transition; obviously, I
didn't know that. Otherwise tracking wouldn't work any longer; would
it? As a matter of fact, it *somehow* did.

{% blockquote Wolfgang Pauli %}
It is not only not right, it is not even wrong.
{% endblockquote %}

Actually, my Analytics dashboard **did** show some visits and hits, that's
why I didn't notice the problem for a long time, however, I guess it
only mentioned 10% of them! Anyway, after a long
debugging session with <a href="https://www.google.at/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0CCAQFjAA&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Ftag-assistant-by-google%2Fkejbdjndbnbjgmefkgdddjlbokphdefk&ei=xivvU6rFCoTE7AbJ54GgBw&usg=AFQjCNHiOEtvqJl1-RFk6_Q6oVWZTGRFPw&sig2=cuQ2UpUVHzSDJBg77fP0hw&bvm=bv.73231344,d.ZGU" target="_blank">Google Tag Assistant</a> and <a href="https://www.google.at/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0CCAQFjAA&url=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fgoogle-analytics-debugger%2Fjnkmfdileelhofjcijamephohjechhna&ei=NizvU-u2Nef17AaSp4CIAg&usg=AFQjCNHR1yQN0Rdzn4xwMA1bTPZkNEGK_Q&sig2=CEZMIArRE6i7HVQLoSVTiQ&bvm=bv.73231344,d.ZGU" target="_blank">Google Analytics Debugger</a> I figured out the necessity to change the code, finally.

Shortly, you just need to change your
`source/_includes/google_analytics.html` to this code:  

{% codeblock %}
{% raw %}
{% if site.google_analytics_tracking_id %}
  <script type="text/javascript">
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', '{{ site.google_analytics_tracking_id }}', 'auto');
ga('send', 'pageview');
  </script>
{% endif %}
{% endraw %} 
{% endcodeblock %}

Concerning Github pages, it's not necessary to include a call to set your domain to
**github.io** any longer. It just works out of the box - what a
progress! It is not only right, it is not even wrong now!
