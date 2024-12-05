+++
title = "ChatGPT isn't a decompiler... yet"
date = 2024-11-28T18:26:06-08:00
tags = ['tech']
+++

Previous article: [What I'm up to](https://stephenjayakar.com/posts/what-i-have-been-up-to/)

  * [ ] Image of a computer spitting out gibberish and me yelling at it to tell me what it's doing!!! or something appropriately silly

# Abstract / Results

It feels a bit pretentious to open a blog post with an abstract. However, I wanted to communicate concisely _what_ I tried to do, and what the open areas of exploration are up front. Those who are interested can dig more.

**I wanted to make ChatGPT into a magic decompiler for PowerPC assembly to supercharge the Melee decompilation project.** I observed over a year ago that ChatGPT was surprisingly good at understanding PowerPC assembly language and generating C code that was logically equivalent. I also saw other papers that were attempting to use LLMs as decompilers.

Problem statement: given the PowerPC ASM `a1` of a function `f1`, come up with C code that compiles to `a1` (note: the C code doesn't have to be the same as the original. There are many C programs that map to the same assembly). This is called **match-based decompilation**, as merely being logically equivalent is not sufficient.

`gpt-4o` was able to often generate code that was logically similar or the same. It was also **able to iteratively correct compiler errors** (even for an older dialect of C). However, it was **unable to improve on its results** even when given the assembly diffs in a digestible format. It showed understanding of the assembly diffs, but wasn't able to actualize that into logical changes to the C code. I also briefly investigated fine tuning and didn't get great results.

There are a couple of explorations left to be tried, but before I get into that, some notes about the problem space:
* This isn't a classic RLHF problem. You don't _need_ human feedback at all. Especially with the automated tooling I set up, you can actually automatically "score" how close the ASM is to the target ASM. So maybe a more classic RL approach would be interesting
* Coming up with C code that compiles to the same ASM isn't actually all that's needed for the decompilation project. This tool wouldn't be powerful enough to wire in struct definitions from other parts of the codebase, or even handle imports. On the other hand, LLMs with retrieval could actually be pretty good at this.

Before I get into the work that I ended up doing to test my hypothesis, some background info first.

# Background info

File types
* OBJ: This is the output of a compiler. It contains binary machine code that a computer can execute. This is _not_ the readable ASM that we're dealing with, but the binary encoding of it. Looks like gibberish when opened, with occasional strings like `"Hello"`
![obj](/images/decomp-obj.png)
    * You can see that this file says that it's an ELF in the "header", which is the object file type for PowerPC.
* ASM: This is a human-readable representation of the machine code. It's a programming language to some extent, but much lower level than C. For PowerPC, you'll see instructions like `li r1 3`.
```asm
.fn f1, global
stwu r1, -0x18(r1)
add r0, r3, r4
stw r0, 0x10(r1)
addi r3, r1, 0x10
addi r1, r1, 0x18
blr
.endfn f1
```
* C: This is C code, which is the closest to human-readable
```c
int* f1(int x, int y) {
  int z = x + y;
  return &z;
}
```

Tools
* **Compiler**: this converts C code to an OBJ. This is often *a lossy process* and the original C code cannot be recovered once you just have the OBJ file, especially as you turn on optimization flags.
* **Decompiler**: this would convert either OBJ or ASM -> C. For this particular project, a perfect one of these doesn't exist and we're looking for something close.
* **Disassembler**: OBJ -> ASM. This takes a compiled object file and spits out a human-readable representation of the ASM. Sometimes, it'll even add nice quality-of-life fixes such as changing register arguments from numbers to names like `r1` or `sp`.
* **Assembler**: ASM -> OBJ. This converts from an ASM to an OBJ. I needed this specifically because the ASM differ I used, `asm-differ` actually best worked when comparing two object files (but the whole process takes in an ASM file as input).

Specific tools to this project:
* **`decomp.me`**: This is a batteries-included collaborative [website](https://decomp.me/) where you can interactively & collaboratively decompile video games. It's pretty crazy this exists. There are so many things you _don't have to know anything about_ to do work here; hell, I don't think you even really need to know how to code. A lot of my project was understanding how `decomp.me` works internally.
* **`m2c`** ([GitHub](https://github.com/matt-kempster/m2c)): This is the default decompiler used for `decomp.me`. It's a great starting point for when you just have ASM, don't get me wrong, but it:
    * doesn't produce code that compiles
    * doesn't really take matching into account
* **`mwcc`**: this is the MetroWerks C compiler. I'm specifically using a version that's identical (or close to) the one that the Melee team used, with the same flags as well. More on that later
* **`ppc-linux-objdump`**: the disassembler I used. I think this is from `homebrew`.
* **`powerpc-eabi-as`**: The assembler I used. I believe I got this from `binutils`
* **`asm-differ`** ([GitHub](https://github.com/simonlindholm/asm-differ)): The ASM differ & scorer that `decomp.me` uses. Was pretty nontrivial to get working the same way. Both `decomp.me` and my project had to do some workarounds to call it conveniently.

I'll be referring to these formats / tools, so feel free to return to this section.

# What we're trying to do

Why do game decompilation? And why Melee? Valid questions!

## Why Melee?

Simple. The game is dear to my heart even if I don't play it that much anymore, and it's still competitively alive today despite coming out in 2001. Also, people have already written extensive modifications for the game, and this would help both:
* power future modifications
* make it more accessible for new developers to join the fray

## Match-based decompilation

Assuming a game is written in the C programming language and we have the game binary (in whatever architecture the console is in. For the [Gamecube, it's PowerPC](https://en.wikipedia.org/wiki/GameCube)), we want to attempt to reconstruct C code that is _similar_ to what the game developers wrote themselves.

Note that I said _similar_ and not _identical_. Compilation is inherently a lossy process, especially as you turn on optimization flags. Comments are almost always stripped out (so your `// help me` isn't going to make it to prod 😋). However, there are some ways to slice _similar_.

Here are two C programs that are **logically similar**:

```c
// Program 1
int main() {
    int i = 1;
    int sum = 0;
    while (i <= 5) {
        sum = sum + i;
        i = i + 1;
    }
    return sum;
}
```

```c
// Program 2
int sum(int n) {
    if (n > 0)
        return n + sum(n - 1);
    return 0;
}

int main() {
    return sum(5);
}
```

These produce drastically different assemblies when we use the compiler & flags for Melee.

```asm
# Program 1
00000000 <main>:
li      r3,15
blr
```

```asm
# Program 2
00000000 <sum>:
# impl of int sum(), 33 lines

00000088 <main>:
mflr    r0
li      r3,2
stw     r0,4(r1)
stwu    r1,-8(r1)
bl      98 <main+0x10>
addi    r3,r3,12
lwz     r0,12(r1)
addi    r1,r1,8
mtlr    r0
blr
```

The compiler completely inlines program 1, in that it doesn't even compute the sum - it just directly loads the result into `r3`, the return register. You can probably see now how compiling can be lossy - we've completely lost the logic inside of `main()`. However, for program 2, it actually generates code for the generic method `int sum` and also does all of the heavy-lifting to call the function.

While both C codes would be a valid decompilation in some spaces, C program 1 would fail to be a **match decompilation** if the assembly we were trying to match was the assembly of program 2. Specifically, C code that would yield a match is a subset of all C code that is logically equivalent to the target ASM. We have to go as far as _register allocations being identical_.

Here's a more insipid example of programs that are really really similar. Here is a C program that calculates the fibonacci sequence iteratively:

```c
int fibonacci(int n) {
    int temp;
    int i;
    int a = 0;
    int b = 1;

    if (n <= 0) {
        return 0;
    } else if (n == 1) {
        return 1;
    }

    for (i = 2; i <= n; ++i) {
        temp = a + b;
        a = b;
        b = temp;
    }

    return b;
}
```

I've compiled this program to assembly, and then loaded it into `decomp.me`. Now, if we swap the declarations for `a` and `b`:

```c
// Old
    int a = 0;
    int b = 1;
// New (logically equivalent)
    int b = 1;
    int a = 0;
```

we get the following ASM diff (while the registers are the same, the instructions are in a different order):

![decomp asm diff](/images/decomp-asm-diff.png)

This is pretty rough; that means that variable declaration order matters even if it _in no way_ affects execution. Oof.

Now you might reasonably ask, why do we want the exact same assembly? Some reasons that are non-exhaustive:
* We want to be able to build the exact ROM of the game. This is the easiest way to verify that the project is 100% there, whereas verifying logical equivalentness is non-trivial
* Some existing understanding / mods of the game being decompiled rely on the program being laid out the exact same way. Modifying this extensively will make those (albeit brittle) changes not work anymore

# What did I do?

When I was in the prototyping phase, I was just giving ChatGPT a copy-and-pasted prompt and an assembly file and plugging in the C it gave me to decomp.me. While the code was impressive and often a close logical match, the code often didn't compile (remember, the version of C we're using is not what most people are writing today!).

![decomp manual](/images/decomp-manual.png)

I then had the idea of piping the errors back to ChatGPT and realized that it was really good at fixing the problems and getting the code to compile. It would usually take one or two tries, but then we'd be cooking! But then, when actually checking the match score, it wasn't close to a match.

I realized that the iterative process that I did to get the code to compile could be something to automate. And not just that, I could apply this loop-improvement cycle for ASM matching. But I was pretty far from this: I was currently just holding a bundle of ASM & C files, and copying and pasting them into `decomp.me`. Getting the resulting ASM was hard for me at that time: I even wrote a script to parse the compilation results from `decomp.me`'s backend 😭. If I wanted to actually pursue these improvements, I'd have to figure out how to run all of these things locally. Specifically:
* Compiling C code with `mwcc`
* Comparing ASM files & scoring them
* Writing a state machine that loops and either fixes compiler errors or attempts to improve the ASM match

At this point of time, I hadn't verified if ChatGPT was capable of improving the ASM score. It was too difficult to hold onto all these C files and get them to compile while juggling around a bunch of prompts.

# Compiling locally TODO left off here

Rough outline
* Getting the `binutils`
* 
* Getting C / ASM pairs

---
Cut line ^. I am mostly rewriting above this
# Roadblocks

* Talk about how `decomp.me` is its own tool and generally requires you to interact with a UI, but I wanted to run all of this locally
* Essentially have different automated parts that all can run individually

# Just write a "what did I do" section and yap. Then edit it later.

## Learned the existing tools (decomp.me)

  * [ ] I talk about OBJ, I should probably explain _what_ it is. I don't think it's entirely an executable but it pretty much is

[decomp.me](https://decomp.me/) is an online tool that allows people to collaborate on decompiling a given assembly. It's really cool as it handles a ton of complexity so that people don't need to download random archaic binaries to get started. However, that comes with the tradeoff of the fact that it then becomes really hard to:
* figure out what the website is actually doing
* download & setup all the tools yourself.

There's a concept of a `scratch`, which is:
* an ASM file
* what compiler & flags we think the developers used
* the target architecture (reminder, PowerPC)
* the context (out-of-scope for this blogpost)

Once you give the website these things, it'll create an editor with C on the left and ASM on the right. There's a _lot_ going on when you create the scratch & interact with it, so let's try to break it down a bit. I had to introspect their [public GitHub](https://github.com/decompme/decomp.me) a decent amount to figure these things out.

When you create a scratch w/ the given configurations, it fetches the correct:
* compiler: C -> obj
* decompiler: ASM -> C (which is often not that good, but better than nothing. For Gamecube, we're using [`m2c`](https://github.com/matt-kempster/m2c))
* assembler: ASM -> obj
* `asm-differ`: this is a library that allows us to compare two ASMs. Technically, it's being used to compare two object files.

For architectures that are older, these tools are often really old binaries (think 1999) or tools that were written by the open-source community. To ground the further discussion, let me show you a brief screenshot of decomp.me's UI:

![decomp me 1](/images/decomp-me-1.png)

This is what the editor looks like right after you import some assembly. Notice that the assembly is on the right of the screen under `Target`. `Current` would have assembly from compiling the code on the left, but the code on the left right now isn't compiling.

I didn't actually type in the code on the left. The code on the left is the default output of `m2c`, a decompiler that takes PowerPC ASM instructions and spits out C. The project isn't "complete" in that the code it spit out here doesn't compile, and even if it did compile, it most likely doesn't match the assembly in `Target`.

Now, you can edit the C code to either get it to compile, or to get it to get closer and closer to the target assembly.

Since I want to replicate most of this functionality locally, I needed to figure out:
* Exactly what tools decomp.me was using and for what steps
* How to run these tools locally, and with what arguments

### Downloading the binaries

Well, before we even learn how to call these tools, we have to get them. It's pretty simple: if you have the [Melee decomp project](https://github.com/doldecomp/melee) downloaded locally, you just run:

```sh
ninja build/binutils
```

This will download all of the binutils you need to `build/binutils`.

### Figuring out how to call them

  * [ ] I actually added the stuff here -> the compiling from C -> OBJ. Not sure if this section is necessary anymore

## Get it compiling locally (C -> OBJ)

The most important tool to figure out how to call is the compiler itself. If we (as a collective) don't figure that out, then there is almost no way that someone could match-decompile the game. Luckily, the Melee community has done the hard work of figuring out what flags and arguments were used, as well as some patches to the compiler itself. We're using the MetroWerks C compiler v1.2.5n, and invoking it as such:

```sh
wine bin/mwcceppc.exe -Cpp_exceptions off -proc gekko -fp hard -fp_contract on -O4,p -enum int -nodefaults -inline auto -c -o temp.o FILENAME
```

As this is an old program meant to be run on Windows and I am using a Macbook, I had to use `wine` to invoke the compiler. This is a little annoying as it makes it take much much longer to startup.

## Get the assembly from a given object (OBJ -> ASM)

## Get the ASM into the same format as the Melee codebase (+ what decomp.me accepts)

## Compare two ASMs, get a diff & score

## Wire these all together to go from C -> ASM -> diff

## Get ChatGPT to go from ASM -> C

## Wire in ChatGPT to go from ASM -> C -> ASM2 -> score, and then loop

### Fix compiler errors w/ ChatGPT

## Fine tuning ChatGPT

# Further explorations

Thanks for making it here! It's a shame I don't have infinite time & motivation (and money to train models), or I would probably keep poking at this. Here are the most promising trees to bark up:

### Training `decomp-permuter`

[`decomp-permuter`](https://github.com/simonlindholm/decomp-permuter) is a tool that I've used for a couple of "matches" - it randomly permutes the C code you give it to try to match the ASM perfectly. It runs in parallel and is often really good at getting the match when you've already gotten really close yourself.

I didn't actually spend as much time investigating this tool as I should have, considering that it's very similar to the infrastructure I set up in my project. Namely:
* It generates C code
* It compiles it
* It compares the ASM to the target ASM

Which is pretty much all of the pieces I struggled with. One reason I stayed away from it was because when I used to use the tool locally, I was actually getting different `diff`  results from the tool vs. `decomp.me`. Now that I actually understand how the underlying tools work, it would be great to revisit this project.

Specifically, the thing someone would want to investigate is coming up with a trained version of this permuter to pick specific permutations based on:
* the input C code
* the ASM diff
* the compiler.

There are [some weights](https://github.com/simonlindholm/decomp-permuter/blob/main/default_weights.toml#L44-L50) that appear to be custom for the `mwcc`, which is the MetroWerks C compiler for PowerPC (which is what's used for Melee). This isn't complicated enough though to actually work really fast, both based on experience and my above definition of the inputs I think that are important.

My 2 cents - this feels like this could work really well. It possibly doesn't even have to be a generalized search model; you could overfit to a solution for 1 problem, and then move onto the next. Then, you can prune the starting parameters that work well after observing a couple of C ASM pairs, and then have it start off on a better foot the next time. But I'm not an ML researcher + I still have a lot to learn, so I leave this open.

### Generating a larger training set

I came up with a small training set for `mwcc` [here](https://github.com/stephenjayakar/decomp-0-context-training/tree/main/general). The repo is separated into 10 `/general` examples and 3 `/melee` examples. You might ask: why make so many general examples if you're trying to decompile Melee?

The reason why is that even though we have C / ASM pairs in the Melee decompilation codebase, the code is really idiomatic aka it requires a really large set of headers / context to compile a given function. This poses the following issues:
* If we were to paste in all the context required to compile the function, it will easily exceed `4o`'s token length (I did verify this myself)
* (Untested) Any fine tuning might not generalize to different functions that have unknown structs, so making it more generic would give the model a higher liklihood of generalizing

Coming up with general examples was so easy:
1. Ask ChatGPT to generate a toy C program _with no includes_, probably on a problem I'm familiar with (e.g. reversing a linked list)
2. Get the code to compile. You can even ask ChatGPT to fix the errors
3. Disassemble it to get the resulting ASM
4. Save it as a C ASM pair

Coming up with Melee examples was harder. I essentially had to find really small functions, or attempt to rip out all the context from an already-solved portion of the Melee codebase. That means not using any structs, attempting to be closer to the ASM than even the solution, etc. It wasn't a pleasant process and I couldn't figure out how to automate it.

Now that I'm looking back on it, I could have actually just scoured decomp.me for less idiomatic matches as training data, but regardless, I don't think a lack of Melee examples was actually what was holding back this project.

### Try out other models

I did try out `o1-preview`. It was better than `4o`, and it did show a slight ability to iterate. However, it still wasn't able to get to a solution. I decided the runtime was way too high to justify using it.

I didn't try Claude or anything - could be interesting!

# Appendix
