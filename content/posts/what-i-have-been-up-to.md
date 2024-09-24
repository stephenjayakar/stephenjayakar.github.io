+++
title = "What I'm up to"
date = 2024-09-23T17:05:52-07:00
+++

A lot of people have been asking what I've been up to since I left Plaid at the beginning of this month. I was at Plaid for 4 years, which were amazing and I am very thankful for the amazing people I've met and work I've been able to do.

I am not funemployed, and I don't want to evoke concepts related to that. I'm grinding harder than I did while employed. It's such a gift to be able to have software engineering skills that have been forged in a real tech company, and then let loose on personal projects. I'm working on learning as much as I can about the AI space and debating if I should make that my next 4-year move. AI has been moving faster and faster, and there are so many toy projects I want to build:
* Already built this, but my [Notion AI autotagger](/posts/notion-ai/)
* Deepfaking my own voice and using it to read ebooks out loud - hopefully deepfaking _my own voice_ would bypass ethical constraints?
* Running LLMs on my own hardware
* A Biblical RAG
* Learning about the tradeoffs of RAGs in general, plus the cheapest arch to roll one out

But I don't want to just build toy projects. Specifically, **I want to build an AI decompiler**. I have done a little bit of work in the game decompilation space for Super Smash Bros. Melee, a video game that's dear to my heart. If you want to know more about the general space, [this doc](https://github.com/doldecomp/melee/blob/master/docs/getting_started.md) that I've contributed to is a good place to get started. Last year when GPT-4 came out, I had a pretty strong feeling that LLMs would be great as a decompiler assistant, and I dreamt about having the time to investigate this more thoroughly.

After some preliminary testing, it's not amazing out-of-the-box. I got some decent results on the general model that get anywhere from 60% - 90% of the way there, but it seems that video game decompilation is both:
* very specific to the compiler used, its flags, and just generally niche and probably not in the training data
* different from even normal decompilation, as video game decompilation is what we call "match decompilation" - I might write more about this in the future and its tradeoffs

If the LLM approach doesn't work, I'll probably investigate some other spikes before washing my hands and writing a nice public postmortem, but yeah, this is what I've been spending my time on!
