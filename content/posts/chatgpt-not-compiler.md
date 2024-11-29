+++
title = "ChatGPT isn't a compiler... yet"
date = 2024-11-28T18:26:06-08:00
tags = ['tech']
+++

_Spoiler: the results weren't great. AI is pretty great at writing code that compiles, but doesn't generally seem to understand how to match C precisely to a given assembly out-of-the-box._

Previous article: [What I'm up to](https://stephenjayakar.com/posts/what-i-have-been-up-to/)

A bit over a year ago, I had a theory that ChatGPT would be pretty good at decompiling from assembly -> C. Specifically, I wanted to apply GPT-4 to accelerate the [decompilation of Melee, GitHub here](https://github.com/doldecomp/melee). I did some small amount of work in the decompilation scene, and ended up learning roughly how PowerPC's ISA worked as well as the tools used for decompilation. The reason I thought that AI would be great at decompilation is it was pretty great at getting code that compiles just given some PowerPC instructions, which was very surprising.

However, game decompilation requires a very precise match between C code and the given assembly.

# What we're trying to do

Why do game decompilation? And why Melee? Valid questions! Let's talk about match-based decompilation (what's often done in game decomp scenes) first:

## Match-based decompilation

- [ ] Talk about mods

Assuming a game is written in the C programming language and we have the game binary (in whatever architecture the console is in. For the [Gamecube, it's PowerPC](https://en.wikipedia.org/wiki/GameCube)), we want to attempt to reconstruct C code that is _similar_ to what the game developers wrote themselves.

Well, ideally we would be able to get the exact C code that the game developers wrote. But that isn't possible, as compilation is generally a lossy process. Even without many optimizations, comments like `// Help me` aren't going to survive in the resulting output binary. So when I say _similar_, I actually mean C code that would compile to the exact same binary, given the same compiler & flags.

This specific type of decompilation is called **match-based decompilation**. It's a more restrictive type of decompilation; you could relax the constraints and just require that the solution is just _logically similar_. In match-based decompilation, even the register allocations have to be exactly the same. Let me show an example:

```c
int f1(int x, int y) {
  return x + y;
}
int main() {
  int x = 2;
  int y = 3;
  return f1(x, y)
}
```

- [ ] Give some examples of things that are logically similar, but not match-based 
    * This could be like a table of "logically based decompilation" vs. "match-based"

In the above examples, code that is logically similar will not necessarily produce the same assembly. However, there are examples that are different C sources, but produce the same assembly

  * [ ] Insert example of changing variable names and getting the same assembly

Why would we want the _exact same assembly_? Some reasons that are non-exhaustive:
* [ ] Reasons

## Why Melee?

  * [ ] Check that it is the most competitively played entry

Super Smash Bros. Melee for the Nintendo Gamecube is an unusual game. I didn't just write out the full title for memes: note that this game came out in 2001 for a not-that-popular Nintendo console, and it has been superseded by many other titles in the series. The biggest reason it's special is that it's the most-played competitive fighting game in history; not just that, but it is still being played, and newer entries have not attracted the attention of legacy players.

We could talk about how incredible the mechanics of the game are, and how timeless its artstyle are, and the satisfaction of practicing Melee techniques comparing to practicing a musical instrument, but those are all subjective. At the end of the day, there is some strong staying power to this game that has far exceeded other games, even to the point of surprising Nintendo itself.

With the strong staying power & competitive scene came a bunch of changes to how the game was played. The original hardware, CRT TVs, Gamecubes, and the discs became harder and harder to come by. People started to turn to emulated copies of the game to play it, using the [open-source project Dolphin](https://en.wikipedia.org/wiki/Dolphin_(emulator)) which has improved _drastically_ over the decades I have been following it. These improvements have long surpassed the table-stakes of just getting the game running - they now can include QoL modifications such as lag-reduction, which are important for competitive play.

People have also written modifications to Melee itself to make it more accessible to play in the modern era, the most impressive of which is [Slippi](https://slippi.gg/about), a mod that adds relatively lagless netplay to Melee on PC. The mod is written in ASM, C, and C++. This is because the location of the code is in multiple places - the ASM & C modifications are often building up on other mods + new work that directly modify Melee, and then there are C++ extensions that are written directly into the Dolphin emulator.

# Roadblocks

* Talk about how `decomp.me` is its own tool and generally requires you to interact with a UI, but I wanted to run all of this locally
* Essentially have different automated parts that all can run individually

# Just write a "what did I do" section and yap. Then edit it later.

```asm
.include "macros.inc"
.file "temp.c"

# 0x00000000..0x00000018 | size: 0x18
.text
.balign 4

# .text:0x0 | size: 0x18
.fn f1, global
/* 00000000 00000034  94 21 FF E8 */	stwu r1, -0x18(r1)
/* 00000004 00000038  7C 03 22 14 */	add r0, r3, r4
/* 00000008 0000003C  90 01 00 10 */	stw r0, 0x10(r1)
/* 0000000C 00000040  38 61 00 10 */	addi r3, r1, 0x10
/* 00000010 00000044  38 21 00 18 */	addi r1, r1, 0x18
/* 00000014 00000048  4E 80 00 20 */	blr
.endfn f1
```

```asm
stwu r1, -0x18(r1)
add r0, r3, r4
stw r0, 0x10(r1)
addi r3, r1, 0x10
addi r1, r1, 0x18
blr
```
