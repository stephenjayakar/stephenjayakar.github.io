+++
title = 'AI is now a magic decompiler'
date = 2026-02-10T15:25:33-08:00
draft = true

[cover]
src = "/images/magic-decomp.png"
alt = "computer"
+++

AI Agents are now magic decompilers. [Previously](https://stephenjayakar.com/posts/chatgpt-not-compiler/), I ran an agent-in-the-loop to try to decompile Super Smash Bros. Melee in Dec 2024 with `gpt-4o`, but found that the model didn't tend to learn from its mistakes. Since then:

- Models have gotten smarter
- Tools have gotten better
- Other people have started to create skills & tools to help AI

It's not just a couple of functions here or there. I've merged around 20 functions, and have 80 more in review. Previously, *it would take me 1 day a function*. My results aren't even the most impressive though. The writer of the [decomp skills](https://www.notion.so/github.com/doldecomp/melee/pull/2076) set a record for [the most matches in a PR](https://github.com/doldecomp/melee/pull/2102). Tons of people are using their own custom agents or just Claude Code in the [Discord](https://discord.gg/hKx3FJJgrV) (channel is #smash-bros-melee) every day with great results. If this is something you're interested in, come pop on by! We could always use more tokens 🤠.

# Why autonomous agents are good at decompilation

I reinvestigated this project because of Cursor's [post](https://cursor.com/blog/scaling-agents) on long-running autonomous coding. They attempted really hard tasks that a single LLM agent generally couldn't do, like writing a browser from scratch or a Windows 7 emulator. I realized that decompilation was actually a great fit for this paradigm since it's a **hard but verifiable task** – in some ways, it's an even better fit than writing a browser. Specifically, it's verifiable (you just run the compiler) and its parallelizable (you split up agents by function).

So I did what anyone would do when they want a tool for themselves: I told Opus to make it. Behold, [agent-runner](https://github.com/stephenjayakar/agent-runner):

![agent runner](/images/agent-runner.png)

Now, this isn't anything fancy; that's kind of the point. It's powered by an Anthropic API key, and Opus 4.6 is so smart that you don't really need to handhold it that much. The tool is just a simple frontend, backend, and agent scaffold that gives it access to basic tools like `bash`, `read_file`, and `write_file`. It also has compaction that kicks in as the task runs for a while.

![agent runner arch](/images/agent-runner-arch.png)

The tool works like this:

1. a **PLANNER** agent looks at the Melee codebase and identifies functions that haven't been decompiled yet.
2. It adds them to `PLAN.md`, which is the doc that tracks all the tasks that need to be done, as well as the completion of tasks
3. It then spins up one **WORKER** per task
4. After the workers finish, another agent acts as a **JUDGE**. The **JUDGE** assesses if the task is complete – if so, it updates `PLAN.md`. Otherwise, it spins up another worker to attempt the task

While I gave the agent access to all the tools I came up with to run an LLM in a loop while compiling the game, it actually wasn't necessary. The agent(s) ended up completely shortcutting them and writing their own tools, bringing in the base decompiler (`m2c`), compiler, and scorer (`objdiff`).

# Conclusion

Lots of people on Twitter have been talking about how incredible new AI models are, and that "you can just do things." Honestly, this is the first thing that's impressed me in a while. It's been great that AI can basically do fullstack work, but that's been true since last summer. These truly hard tasks that took tons of human hours are starting to crumble with LLM intelligence + better scaffolding. That's both amazing and scary. Decompilation, instead of being a passion project with tons of human hours over years can instead become a couple of highly specialized people glueing together tons of token output.

So now it becomes a question of: what do you want to build? What will you give your tokens to?
