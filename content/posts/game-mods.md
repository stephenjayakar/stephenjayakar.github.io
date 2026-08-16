+++
title = 'AI is incredible for game modding'
date = 2026-08-14T21:18:22-07:00
tags = ["tech"]

[cover]
src = "/images/botw-vr.webp"
alt = "botw-vr"
+++

In the last month there has been an absolute explosion of game mods and decompilation progress. Off the top of my head:
* Twilight Princess PC Ports
* Breath of the Wild VR mod
* [Gen1 Recomp](https://www.youtube.com/watch?v=zlKwuL-8FbI): a 2.5D mod of Pokemon Red Blue & Yellow
* [Halo VR](github.com/pancreations/Halo-MCC-VR), made by someone who claims they **don't know how to code!**
* Mario Kart 64 VR

I'll be referring to modding as a category that includes things like decomp projects, VR mods, game extensions, new game modes, emulation, etc.

This jump can be attributed to LLM-assisted (or even led) development. LLMs are making the human cost of developing game mods crash to zero -- if you don't have to maintain it, at least. With the cost going lower and lower, this will also have implications for enforcement, but we'll get to that later.

### Why are LLMs a good choice for modding?

Modding is an unusually good fit for AI-generated software because it has high user value, poor monetization potential (it is often illegal to make money from mods), ugly engineering constraints, and no requirement to maintain the resulting code. As coding agents improve, that changes the practical enforceability of IP restrictions. So because of the lack of financial incentive, it's the perfect type of project to throw an AI agent at and hope that its results are good enough. Not just that, even if the code is absolute slop, a) you don't really have to _maintain_ the code if it's good enough, and b) projects like this are generally slop anyways, as it's hard to come up with good abstractions around reverse engineering.

### Why are game modifications generally slop?

From a high-level, game modifications often have to work _against_ the abstractions of the original project. Cutting roughshod into essentially legacy code that you might not even be able to fully inspect makes it difficult to form new abstractions.

Here's an example - Project Slippi is a mod for Super Smash Bros. Melee that adds modern netcode to the game. This is obviously super impressive and required tons of in-depth specialized knowledge to figure out where the correct game data is. Also, it's a multi-layered stack. If you want to write some business logic, you have tons of options:
1. Modifying the game itself: this modifies the actual game assembly (or writes C that compiles down into the assembly). This is the closest to the game logic and can access its structures easily, but it will be running as if it were on a Gamecube, which is obviously limited. For example, how would you make network calls?
2. Modifying the emulator, Dolphin. This is a C++ program that generally focuses on interpreting the game to run on modern hardware
3. Outside the emulator: since the game is running, you could have helper software that is written in any other language also on the machine, and communicates with Dolphin.

I noticed that for Project Slippi, a lot of modifications ended up being in layer (2). If I had to guess, the reasons for this is that (2) is a completely owned surface area that _technically_ has access to all of the games underlying structures, and also it could use all of the components of the native system like network access. However, you can imagine that having a project like this split amongst three layers makes it pretty unclear how to divide up the abstractions, and what could _should_ be where. It also doesn't help that (1) isn't fully decompiled, so making modifications there can be difficult to link & can also cause adverse side effects by accident.

Another angle to think about this is that games are generally not continuously iterated on. I know with recent games like League of Legends companies will add large features to the codebase every season, but for the majority of games, you write once and ship once with minor updates afterwards. So you don't really have to invest a TON of effort into writing maintainable code, since... you don't have to maintain it.

### LLMs are reviving Virtual Reality

I used to be a huge VR enthusiast. A lot of the games I've played in VR have made unforgettable memories and experiences that I think are hard to replicate when playing a new flatscreen game. With that said, I haven't been picking up my headset often. It's kind of a big commitment, requires a decent amount of setup, and when I do play it usually doesn't end up being for long. However, with all of these new VR mods for games that are really dear to my heart, I've been playing Halo 3 in VR and I'm having a blast.

VR was in a bit of a slump before this new explosion in modding. AAA developers generally haven't been investing in the category, there haven't been any new affordable advances in hardware, and indie developers keep releasing small frustratingly priced "experiences" that, while novel and intriguing, don't really have the investment or replay value of a whole game. So ports of existing games have the capacity to be _at least_ as good as their original release which is really exciting. Not just that, but older games are well-tailored and optimized to running in VR, which requires high resolutions & frame rates.

I already could run up to 4 copies of Halo 3 on my PC at the same time. VR runs like a dream. Smooth 120hz action, and everything is super sharp. And because of the art direction of the time, the game looks amazing in VR (with the exception of the humans!).

The release of this mod made me realize that things are really changing. Someone who claims to be completely non-technical, with the help of Claude & Codex, was able to make this. I tried making this myself with GPT 5.4 and failed. Someone else named Nibre made a [Halo Reach VR mod](https://x.com/RtoVR/status/1221897834011807746) by hand in 2020 and immediately got hired by 343 Studios. So the fact that we're now in a world where someone who doesn't know how to code can replicate this type of work is absolutely insane and I'm here for it.

But then, that brings me to my next point:

### People who complain about AI mods are annoying

People are annoying. And _people_ (Redditors, some X users) are absolutely losing their mind when it comes to LLM-assisted development. I've seen comments like "if an LLM touched the code I'm not touching the mod."

What entitlement! What right do you have to _deserve_ that a mod is written a certain way? Mods are already free labor, borne of passion. No one has a particular _right_ to entertainment, especially if it's free to them! This extends to open source too. People get really worked up for new libraries or projects that are mostly LLM-generated and solve real problems because it wasn't done exactly the way they wanted. Again, what entitlement! They're (and I'm) so lucky that we live in a world where people share the outputs of their labor and work _for free_ instead of just hoarding wealth and knowledge to themselves.

I'm an experienced software engineer. Nothing I write is devoid of AI contribution now. Even worse, I've shipped whole projects / products that are 99% LLM output. Now people like me who honestly develop tons of cool things are going to be suppressed in sharing our love and joy for new things as well as knowledge, because there's a horde of anti-AI people who will stomp on every project. As someone who really wants to see these types of projects flourish, it's starting to feel like I'm at odds with these people who just want other people's work for free and free of LLMs. To these "protesters" I say - if you have issues with _how_ a project was developed, just develop it yourself instead of objecting.

### Are AI-made mods legal?

Now with that said, I'm pretty worried about the legal angle of these projects. Historically modding has been treated as fair-use, and decompilation is legal if it's done in a clean-room fashion, but emulation is kind of a grey area. I've always thought that the reason why companies haven't tried to crack down on this more is that it's really hard to create new projects and requires a lot of passion, dedication, and time. **That is no longer true.**

Emulation is probably the biggest way that people steal games. The positive framing for emulation is that it's for "game archival purposes." If emulators didn't exist, there would be no way to experience old games the way they were on native hardware. That is often true. If you use a legal backup of a game and enjoy it on your computer instead of your failing NES hardware from 1986, yes, that is the type of person that are marketed when trying to show that emulation is a good thing. Another angle is to show that for many games, they aren't even being sold anymore from the companies that own them. But if I were to guess, about 50% of emulator users for a given game haven't even _seen_ a copy of the game they're playing, much less going through the arduous process of making a legal backup of their own copy.

Nintendo shut down the biggest Switch emulation project, Yuzu. Now this isn't entirely precedent as the Yuzu developers generally were profiting off the project & didn't follow all the rules for making a legal emulator. Nintendo specifically pointed to damages that were caused by the Yuzu project, since Tears of the Kingdom was leaked early and people ended up playing it on Yuzu _instead_ of actually buying the game on the Switch, which totally makes sense - there's no way TotK players before it releases are playing it legitimately. The developers themselves wouldn't have been able to obtain a copy legally in order to actually patch Yuzu to work with it.

There are other legal challenges. I'm not working on AI research so I wouldn't know this, but hypothetically, what if an LLM was trained on leaked information from a company and ended up outputting from its source when reverse-engineering a game? There are huge game source leaks from Nintendo, and we already know that LLMs can plagiarize based on their inputs. Is it clean room decompilation if one of the members of the "room" is an LLM whose training data cannot be inspected?

### Can we stop modders?

First, let me preface this with my point-of-view: I don't want modders to stop. Instead of this being framed as competition, I like that there is love for the creations of game companies - love that can't be serviced merely with products. I wish that the free "marketplace of ideas" would challenge existing companies to better serve the diversity of their customers, even niche ones, and for them to ship more products & experiences.

So in the Yuzu case, Nintendo rightfully viewed game reverse-engineering as competition. Nintendo has also viewed other projects as competition (AM2R and their Metroid 2 remake, Project M and the later Smash versions). I'm worried that game developers at large will view mods of existing games as competition as well. Why play a new spin on turn-based RPGs if you can just endlessly replay variants of what you played in childhood? Why get the remake of an N64 game if you can make a better remake yourself?

Can we stop developers? At the moment, my answer is "it depends." We could make clean-room decompilation illegal, as well as reverse-engineering. That would definitely make it really difficult to make unauthorized mods and ports, as a) a lot of mods & ports rely on the base of a decomp and b) decomps are still a hard enough task that require teamwork.

But in the case where decomps are still fine, it would be _really_ difficult to stop modders even if LLMs stay at their current level of progress. You can already make pretty sophisticated game mods by simply pointing an LLM at a decomp of the game and prompting GPT Sol with your modifications for < $10. If LLMs continue to improve in coding performance, this will become more the case and even cheaper & faster.

Even worse to the attempted enforcer, decomps themselves could become fully automated. People are sharing tooling improvements that can make LLMs faster & more token efficient when reverse-engineering a game. Creating a new emulator can also become faster and faster or finding exploits. Right now, there's no Switch 2 exploit nor emulator; it could become as simple as plugging in your Switch 2 into your PC, and asking GPT 6 to exploit it and create an emulator.

So if one single person could create an emulator or port or mod or decomp by just asking for it, then taking down a project does nothing. You can just prompt it yourself and pay some amount (which is decreasing on a monthly basis).

### LLM Companies can stop modders

There's one way to stop the progress here. What if the LLM companies _themselves_ make sure not to output content that Nintendo would want to take down? This is totally possible. It's already happening for image generation where e.g. Marvel does not want their characters appearing in image models' outputs. Anthropic has already shown that they're willing to substantially limit a model's capabilities in areas they don't think is _safe_ for the public; it could also extend to being beholden to corporate interests.

But we also have open source LLMs that are approaching the frontier. So even if US-based companies agree not to allow modders to generate content, we'd also have to get China to align with that.

### Conclusion: make stuff, if you dare

Game modding and prototyping right now is the wild west. If you really want a niche idea of yours to see the light, you're probably a couple of GPT Sol prompts (and $50) away from completion. But I'm not sure that this world will last forever. It's hard to know if you should rush out all the ideas you want to implement before AI companies crack down on their outputs, or if you should instead wait for model progress so things become even easier & cheaper.
