+++
title = 'How is GPT 5.6?'
date = 2026-07-12T12:00:00-05:00
tags = ['tech', 'ai']
+++

It's great. However, like all evals, the verdict depends on the tasks - so I'll describe the tasks too.

# Before GPT 5.6: Fable orchestrating GPT 5.5
Right before GPT 5.6 came out, Fable was available on Claude subscription plans. I already had a $100/month Codex subscription. For Claude, as I only had a $20/month subscription, I could only use Fable in the following way:
* Fable set to low
* Fable using [this skill](https://github.com/stephenjayakar/claude-codex-delegate) to actually use GPT 5.5 as a researcher & coder

I found this paradigm on Twitter. To figure out if this was better than just using GPT 5.5, I ran two evals:
1. Develop a Halo clone with a pretty unspecified prompt in three.js
2. Find new [Melee decomp](https://stephenjayakar.com/posts/magic-decomp/) tasks and decompile them; verify they are matches, and make sure CI passes

### Halo clone
I pitted Fable vs. GPT 5.5 xHigh. While 5.5's procedural asset generation was better, Fable's implementation blew GPT out of the water. Note that Fable was also orchestrating 5.5 agents and was running on low - I'm sure with higher thinking levels and working by itself, it would have had better results. Some examples of Fable performing better:
* The AR & Magnum had great sound effects and mechanics and behaved like the game
* Radar worked
* Health & shields were actually centered instead of the top left
* AI worked instead of being stuck
* Grenades!

![Halo clone built by Fable](/images/halo-fable.png)
![Halo clone built by GPT 5.5 xHigh](/images/halo-gpt-5-5.png)

### Decomp
Whenever I have tokens to spare, I try to help out the [Melee decomp project](https://github.com/doldecomp/melee/). It's also great for trying out new LLMs: new matches are a legit hard task for LLMs and I personally have used tons of tokens on it. I've also watched LLMs improve over time on this eval.

Anyways, I was worried Fable would refuse to do decomp-related tasks. I prefaced all sessions with an explanation of why decomp was a legal task; it seemed that was sufficient to not trigger the guardrails.

I knew that 5.5 xHigh was able to do this - I just tested the Fable + orchestrator pattern. It ended up finding a new match in 10 minutes. Good stuff!

# GPT 5.6?
In my experience with Fable Low (I can't speak for higher thinking levels) GPT 5.6 Sol is now my preferred model. Not just that, it has surprised me on what it's able to accomplish. This is primarily due to competence & cost: Sol High is still cheaper than Fable.

My tasks, in order of impressiveness:
1. Azul: Replicate the board game and make an AI for it
2. Decomp again
3. Redo the halo eval

## Azul: Summer Pavilion
![Azul: Summer Pavilion game interface](/images/azul-summer-pavilion.png)

This probably warrants its own blogpost. I've attempted this in the past, but I've always thought that an LLM should be good enough to replicate a board game by just looking at the PDF of the rulebook.

Well, I can now confirm that GPT 5.6 Sol is good enough to do that. With just the rulebook PDF, the model was able to develop a game simulator with no bugs. Not just that, in the initial prompt, I told it to also use my RTX 3080 to train an AI that would be better than me. Within the first pass of the goal, it created a CLI for Azul: Summer Pavilion, as well as an RL env, and created an AI that averages 100 points a game against a random opponent.

I was obviously impressed. However, 100 points against a random opponent was still not better than the average Azul player - I then set one more goal to get it to do self-play and continue optimizing. After doing that goal, it increased its max score to 130, and 100 points against itself.

I then set one goal to make a frontend for the CLI so that I could play as if I was playing on a board. Almost flawless. I had to give it some advice while it was going.

I played it. It beat me 2/3 times. So, it can still do better, but this was still pretty impressive to me!

## Decomp, again
Sol is nuts at decomp. I don't even have to be the one to tell you - since Sol came out, someone just opened a PR to match 4% of Melee. 

**4% is absolutely bonkers in a couple of days**. The whole project has already been going for years at this point.

I can confirm with my usage that Sol quickly solves decomp tasks; around 10 minutes per new function.

Since decomp _seems_ to be a solved but slow problem, I've turned Sol to harder tasks. Specifically:
* Decompiling _the compiler_ so that we can just read its logic and write skills to further accelerate decompilation
* Writing an eval for Melee decomp to try out different LLMs & harnesses

If I can crack either of these two, that might further increase velocity for decomp :).

## Halo
I'd say that Sol failed this task. I tried it, and it wasn't even obviously better than 5.5 xHigh. It _did_ have grenades though, which are near and dear to my heart

## Luna, Terra?
Luna high has been pretty good when I know exactly what task to do. However, the things it has been bad at are:
* Trying different approaches
* Knowing when the task is over when using `/goal`

Most of these tasks are oneshots or pretty ambitious, so Sol has been a lot better for me. Luna is the model I'm using for my personal management though, and that's been great.

I've heard Terra is flat out not cost effective for its intelligence, so I'm not using it.

# Conclusion
Sol is my new favorite model. It blends cost effectiveness with tenaciousness and intelligence. I felt like before, if I could just use Fable + 5.5, I would be happy for the rest of my SWE tasks. Sol changes the game - no more complicated orchestration. I don't even want to use subagents as Codex is also really great with its compaction.

There are still more things to test:
* Luna with computer use
* Computer use in general. All I've done is check into one of my flights
* Different scaffolds for Sol. I've heard Codex isn't the best for all tasks?
* Writing skills for Luna so that it can perform more cost-effectively
* Fable..... if I can
