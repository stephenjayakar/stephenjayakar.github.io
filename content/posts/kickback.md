+++
title = 'Kickbacks.AI'
date = 2026-06-11T17:31:15-07:00
tags = ['tech', 'ai']
+++

![chat usage](/images/chat-usage.png)
![ant usage](/images/ant-usage.png)
![kickbacks](/images/kickbacks.png)

_The receipts to show I'm not capping_

First, before you jump in on this, know that they haven't setup their Stripe integration yet. So even if you make a ton of $, this might be a scam LOL. So it's not entirely worth it.

I ran a ton of experiments trying to go cash-positive on token usage vs. ad revenue. The idea is that they ads on Claude Code / Codex's thinking spinner, and you get 50% revenue share. A surprising amount of companies signed up for this which is funny. A lot of them are trying to hire me.

Generally subscription token usage is subsidized, whereas API usage is not. I have a Codex subscription for $100/m, but only had $5 of Claude API credits.
# Codex first
I first tried using Codex as I had a subscription. The way this tool works is that it's a VSCode extension, and then _it monkeypatches your Codex and/or Claude Code VSCode extensions_. Absolute insanity. I'm surprised if either company will allow this in a couple of days.

Anyways. I tried all types of things with Codex. I wasn't even getting ad impressions at all which was really frustrating. After looking around on X, it turns out a lot of other Codex people were struggling with this. Turns out that the "blessed" way to do this was run Claude Code in your terminal inside VSCode. Ugh. I tried all types of things in Codex:
* Different models
* Advice to think more or less
* Goals

Around this time, I learned that faking ad revenue is fraud and illegal. So didn't want to do that!
# Claude
Then since i realized that Claude is the blessed way to do it, I wanted to observe it working properly. So I tossed Anthropic $5 and went to work.

I have a lot of random tasks that I want to throw tokens at that honestly may or may not be solved by having an LLM without me in the loop. But since I wanted to do this, I just pulled up an old PLAN.md from earlier, and ran Haiku in a loop until I ran out of credits.

I pulled around $4 of ad revenue for $5 of tokens. :(

# Back to Codex
Turns out another user on X had issues with Codex and [used _Codex_ to develop a fix](https://x.com/stephenjayakar/status/2065210986920071438). Lowkey this could be borderline abuse as you can essentially just set whatever you want to get ad revenue. The whole concept is pretty jank and is in no way sustainable. You can't rely on client-side impressions like this when you don't control the machine or the code.

Anyways, I wasn't really trying to abuse the system; I just wanted it to work. I also sic'd Codex on it and it fixed the bug. We were cooking.

The ad revenue for Codex is < Claude, as they had implemented less surface area. Claude shows 3 ads at once, whereas Codex only 1. That was fine. I ended up picking a quota I didn't really care about (GPT 5.3 Spark!) and ran 2 agents at a time in a loop. Before the fix, I had to quit VSCode every 10 minutes to get the ad to refresh. After the fix, it worked completely!

I went from $4 -> $13 in revenue, and ran out of my daily Spark quota. Not like I was going to use it anyways. The code wasn't bad too!
# Conclusion
* This is going to be abused as there's no way to easily do this unless you own the agent
* OpenAI or Anthropic or both are going to DMCA it
* There's a market for ads in your terminal. Engineers beware
* I would like my money
