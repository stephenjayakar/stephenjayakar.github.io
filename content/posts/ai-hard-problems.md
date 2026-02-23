+++
title = 'How to solve hard problems with AI'
date = 2026-02-22T19:40:11-08:00
tags = ['tech']
+++

This is probably something I'll be updating over time but has helped me a ton when kicking off long-running agents.

1. Find a hard problem. Something like creating a browser, adding raytracing to an old game, adding VR to an old game, decompiling an old game (are you starting to see a trend?)
2. Get an agent structure that allows you to run an agent on an always-on machine. It should be the same platform as the machine that will run the "problem" - if it's a game, probably Windows. I'm using Opencode + Kimaki to check in on Discord
3. Ralph loops. I created a skill [here](https://github.com/stephenjayakar/opencode-ralph-loop/tree/main). For the initial codebase, have it create a comprehensive PLAN.md, and then setup a Ralph Loop until the PLAN.md is complete. You can have it keep kicking off agents until there are no `- [ ]` left in the document.
4. (But not necessarily last): make it so that the agent can somehow verify its output. A screenshot harness, the ability to directly set state to a certain position, are super super important as as your topic gets more niche, AI is less likely to output code that works on the first try.
