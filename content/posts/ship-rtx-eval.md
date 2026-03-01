+++
title = 'AI Image Eval: RTX Ship of Harkinian Grading'
date = 2026-03-01T13:51:44-08:00
tags = ['tech', 'gaming']

[cover]
src = "/images/rtx-eval-1.png"
+++

I started working on adding raytracing (RTX) to _The Legend of Zelda: Ocarina of Time_. As in my other posts, I'm generally trying to drive the project via LLM decompilation.

I was hoping the project could be as simple as running Claude Opus 4.6 in a loop, saying "implement RTX into this engine, make no mistakes." I got surprisingly far with this technique. However, I started noticing that it started to cease to make progress, and that it seemed to be bottlenecked on its ability to understand the engine's screenshot output, identify issues, and figure out what to work on next.

Hence, especially with the new drop of Qwen3.5-35B-A3B, I ran an eval. Given an RTX output that I can easily identify problems with, see what problems the current multi-modal LLMs identify with the picture and grade them against my rubric.

Here's the image again, zoom in and look at the shadows, or the buildings in the back:

![rtx-eval](/images/rtx-eval-1.png)

# The Rubric

This is output from Kokiri Forest, which is the starting area in Ocarina of Time. I was in

# Evals
## The Prompt
## Results





