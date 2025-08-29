+++
title = '`opencode` or Claude Code?'
date = 2025-08-29T15:32:29-07:00
tags = ['tech']
+++

_Just so that people don't get confused, [this opencode](https://opencode.ai/). I'm not a shill I promise._

**TL;DR**: if you have time to experiment, use `opencode` with `sonnet-4`. Otherwise, use Claude Code.

I've spent a lot of time with `opencode` as well as Claude Code. I'm going to use this as a live document talking about the tradeoffs of using either tool.

First, Claude Code is roughly SotA for a terminal AI editor for fullstack work (my domain). I've also tried:
* Cursor with various models
* Claude Code, but overriding what model it uses to try GPT 4.1
* Qwen code
* Aider
* Gemini CLI

`opencode` was exciting to me as [their CEO](https://x.com/thdxr) cares a lot about TUI excellence, and it was promising to have Claude Code level performance but with models that were not Anthropic's. (this was before GPT-5) I was hoping that:
* `o3` would outperform `sonnet-4`, as I generally thought that `o3` was a smarter model
* I could use Cerebras models at lightning speed. `qwen-coder` advertises > 5000 tokens / second [on OpenRouter](https://openrouter.ai/qwen/qwen3-coder)! This is a rant for another time, but I think SWEs are leaving a lot of cognitive performance on the table by going overly async on their work when using agents.

Both of these hopes were dashed. `o3` just didn't perform as well as `sonnet-4` is mysteriously nuts at using `grep`. Cerebras models on Openrouter have strict rate limits even if you pay, which sucks. The times it does work, however, I'd say that `qwen-coder` isn't fully at `sonnet-4` level.

The only benefit I can see to using Claude code over `opencode` is that for _only_ using Anthropic models, it can be cheaper as it round-robins between different models depending on the task. Even if you set the model selector to `opus`, it uses `haiku` for some of the searches which really cuts cost. I don't really have much more to add atm besides some upsides of using `opencode`:
* Claude code prints out to your terminal. `opencode` has its own buffer system. That means that you can **resize your window** and it'll render properly, and scroll up and down more than your terminal's limits. If you've ever used `nano` or `emacs` or `vim`, you might understand this better.
* `opencode`'s themes are really pretty
* Ability to add new models instantly and even use local models - I had limited success with local models unfortunately as you need a pretty fat context size to get results.
