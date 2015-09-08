---
layout: post
title: Historical Elo Tennis Rating
date: <span class="timestamp-wrapper"><span class="timestamp">&lt;2015-09-08 Die&gt;</span></span> 
comments: true
external-url:
categories: [programming,tennis]
tags: [r,statistics]
published: true
sidebar: 
---
Recently I've come across <a href="http://fivethirtyeight.com/features/serena-williams-and-the-difference-between-all-time-great-and-greatest-of-all-time/" target="_blank">that fivethirtyeight article</a> comparing the
female tennis all-time greats by means of an  <a href="https://en.wikipedia.org/wiki/Elo_rating_system" target="_blank">Elo rating variant</a> (originally known from chess). It concludes that Serena Williams does
**not** have the highest rating in history, although she is frequently
considered as the greatest player of all time nowadays. Obviously, I 
wondered what's the situation like in the men's tennis world. Have
Roger Federer's record 17 Grand Slam wins led to the highest Elo
rating as well? What about players like Borg and McEnroe? Anyway, I
have found surprising results.

<!-- more -->

## Technical approach
<a href="https://github.com/JeffSackmann/tennis_atp" target="_blank">This</a> is where I got the match data on ATP matches from 1968
onwards providing the source of the Elo evaluation in yearly CSV
files. I have adopted the mathematical details of the computation from
<a href="https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details" target="_blank">the Elo rating Wikipedia page</a>, while I took the recommendation for the
computation of the **K-factor** from <a href="http://fivethirtyeight.com/features/serena-williams-and-the-difference-between-all-time-great-and-greatest-of-all-time/#fn-3" target="_blank">fivethirtyeight</a>. In addition, I
valued Grand Slam tournament matches higher than other matches
(because of the longer and more challenging best-of-5-sets distance) by
increasing the rating changes resulting from those matches by 10%.
Anyway, I wrote an R script which can be found <a href="https://github.com/sleepomeno/tennis_atp/blob/master/examples/elo.R" target="_blank">here</a>.

## The top 10 highest tennis Elo ratings
Obviously, the main question is: Who has acquired the highest Elo
rating? The answer is: <span class="underline">Novak Djokovic</span> in May 2015! That's the top 10:

<table class="stat"><thead><tr><th>Rank</th><th>Rating</th><th>Player</th></tr></thead><tbody> <tr><td>1</td><td>2335</td><td>Novak Djokovic</td></tr> <tr><td>2</td><td>2310</td><td>Bjorn Borg</td></tr> <tr><td>3</td><td>2304</td><td>John McEnroe</td></tr> <tr><td>4</td><td>2274</td><td>Rafael Nadal</td></tr> <tr><td>5</td><td>2254</td><td>Roger Federer</td></tr> <tr><td>6</td><td>2253</td><td>Ivan Lendl</td></tr> <tr><td>7</td><td>2191</td><td>Jimmy Connors</td></tr> <tr><td>8</td><td>2168</td><td>Boris Becker</td></tr> <tr><td>9</td><td>2159</td><td>Andy Murray</td></tr> <tr><td>10</td><td>2132</td><td>Pete Sampras</td></tr></tbody></table>

Interesting to see that Borg, McEnroe and Lendl (dominating the 1980s) rank in between the likes of
Djokovic, Nadal and Federer who have dominated the last decade.

Anyway, you might be surprised to see 14-time Grand Slam winner Pete
Sampras only in 10th place. In my opinion, his case demonstrates a **practical**
requirement to get to the top of the above list - or rather
a lack thereof: High-ranked opponents. 

<div style="clear:both">&nbsp;</div>

## Everything is relative - being the best, too!?
No matter how good a professional tennis player you are, you will lose
sooner or later "because you are human" (this is obviously
controversial and Elo does not account for this). When the defeat happens it is
better to lose against higher Elo-rated opponents since you then lose
less points. To put it bluntly: When you have an hypothetical Elo advantage of 1000
points with regard to the next-best player at the start of the season and you win
99 of 100 matches, you will most likely have a worse rating in the end
of that wonderful season due to that one devastating loss!
Consequently, it could be said that Sampras might have lacked high-valued contemporaries to
make an even deeper run. In contrast, Djokovic has benefited from the
high ratings of Nadal and Federer to get to the very top. (Apart from
that, <a href="https://en.wikipedia.org/wiki/Elo_rating_system#Ratings_inflation_and_deflation" target="_blank">Elo inflation</a> might be a reason for higher ratings nowadays, too.) Similarly,
Borg, McEnroe and Lendl have benefited from the strong competition in
boosting their respective peaks. That's why I have looked for a way to
abstract the performance from absolute ratings: I have compared the
margins that the above best players could amass in comparison to the
next-best player at their ratings' peaks. Thus, it can be analyzed by
what margin a player has been able to set oneself apart from the
competition, which I consider as an indicator as significant as the
maximal Elo rating.

<table class="stat"><thead><tr><th>Gap</th><th>Player</th></tr></thead><tbody> <tr><td>225</td><td>Roger Federer</td></tr> <tr><td>194</td><td>Ivan Lendl</td></tr> <tr><td>181</td><td>Bjorn Borg</td></tr> <tr><td>172</td><td>Novak Djokovic</td></tr> <tr><td>154</td><td>Pete Sampras</td></tr> <tr><td>148</td><td>John McEnroe</td></tr> <tr><td>61</td><td>Rafael Nadal</td></tr> </tbody></table>

In February 2007 Federer reached his rating peak and the next-best
player at that time, Rafael Nadal, trailed 225 Elo points. That event
has marked the biggest gap of the Elo rating's leader and the rest
of the world; a difference of 225 Elo points means a winning chance of
78% for the higher-ranked player. Well, two months later Federer lost to Nadal in the 2007 French
Open final, nevertheless.

<div style="clear:both">&nbsp;</div>

## Conclusion
No matter whether you 'prefer' the first or the second table - both
tables shows the current top players count among the best of all
times, however, they don't really outperform the likes of Borg,
McEnroe and Lendl! The R source code for my analysis can be found <a href="https://github.com/sleepomeno/tennis_atp/blob/master/examples/elo.R" target="_blank">here</a>.
