+++
title = "Frontend developers: stop moving things that I’m about to click on"
date = 2022-11-25T13:58:48-07:00
tags = ['tech']
+++

_Originally posted [on Medium](https://medium.com/@stephenjayakar/frontend-developers-stop-moving-things-that-im-about-to-click-on-5827bc0409b3)_.

![do better](/images/do-better.webp)

Please. It’s an insult to my brain. Like, you put the button in one place, and then you’re like “nah, let’s move it somewhere else.” Here are some examples that have annoyed me the most lately:

### Lyft Bike Scan Button

<div style="display: flex; justify-content: space-between;">
  <img src="/images/lyft-1.webp" alt="lyft 1" style="width: 49%;">
  <img src="/images/lyft-2.webp" alt="lyft 2" style="width: 49%;">
</div>

This one sucks as I’m often opening the Lyft app just to ride bikes. So I immediately hit the bike button and I’m trying to hit the “Scan” button as quickly as possible. But no! Depending on how fast my internet is at the current moment, that banner will appear and push the Scan button up, which means I end up hitting the banner instead 😟; this is often a really frustrating start to my daily commute.

### Notion search results

_ignore the page titles for your own sanity_

<div style="display: flex; justify-content: space-between;">
  <img src="/images/notion-1.webp" alt="notion 1" style="width: 49%;">
  <img src="/images/notion-2.webp" alt="notion 2" style="width: 49%;">
</div>


I use Notion as a power user at this point. When I’m trying to navigate to a page, I’ll press CMD+K to open the doc finder, and then type in some prefix of what I’m looking for. To pick a result, I’ll be using CTRL+P or N to go up and down, and often press enter in under a second. What’s crazy about this is it first returns one set of results, and then a pretty different set of results. IIRC rarely even the first result will change 😕.

### Why it happens

Some ideas:

* Loading something and inserting it in a way that moves around other elements
* More complicated queries that would reorder the results. e.g. it appears the Notion search first returns title searches, and then actually searches the contents of documents which ends up in result reordering.
* What I call “UX fragmentation”. When personas of users differ so much or there are so many experiments running, that engineers and designers aren’t fully aware of what end-users are seeing. You’ve probably seen this with features being A/B tested. Sometimes, things are loaded in one order or another order depending on a plethora of variables. And also the timing of network responses.

### Do better

When you make a change to the screen, why not just commit to where it should be? Do the users and the metrics get benefit from “pseudo-responsiveness”? If the answer is yes just to the latter, I think it’d be fair to deem this a **capitalistic-UX-anti-pattern**. Get it out.

If anyone’s put thought into this or is annoyed by this, please lmk or send me resources and further readings so I can get more annoyed. Thanks:)
