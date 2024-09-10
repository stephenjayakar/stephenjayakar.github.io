+++
title = "Some quick git (and zsh) workflow optimizations"
date = 2022-12-25T14:32:18-07:00
draft = true
tags = ['tech']
+++

_Originally posted [on Medium](https://medium.com/@stephenjayakar/some-quick-git-and-zsh-workflow-optimizations-a979c74b814f)_.

I use `git` a ton in work and my personal life, and have come up with a couple of aliases that have made using it so much more pleasant and fast. **First, I’ve renamed `git` to `g`**. _You have no idea how much typing that’s saved me (I also don’t know)._

```sh
alias g="git"
```

# Aliases

`git` allows you to alias commands. In the spirit of renaming commands to one character, here are my favorite aliases:

```sh
[alias]
 d = diff --color
 s = status
 p = push
 c = checkout
 a = add
 cm = commit -m
 pl = pull
 cl = clone
 r = rebase
 b = branch
```

These are all in my `~/.gitconfig` file. So when you navigate into a folder for the first time and want to type `git status`, that translates to `g s`. Look how short that is! Or writing a commit would be `g cm 'commit'`. Wow!!

You can also set aliases from the `git` CLI which will modify the `.gitconfig`:

```sh
git config --global alias.c 'checkout'
```

# Some other functions

**add-commit-push**: I often push a ton of commits to my branches, as my organization (and projects) usually squash PRs. So I made a function to do this in one command:

```sh
function acp {
    g a -u && g cm $1 && g p
}
```

This function:

1. adds all tracked files (so doesn’t add new files)
2. commits with the message that you pass in
3. pushes

So the usage goes something like `acp 'commit'`.

**git-merge-master**: I also often need to merge in the commits from `master`, usually to unbreak CI 😞. I don’t use rebases often as when you create PRs, rebases can mess up the comments once you force push. So here’s my command for `gmm`:

```sh
alias gmm="g c master && g pl && g c - && g merge master --commit --no-edit"
```

# ZSH branch name

Now that MacOS X’s default terminal is `zsh` by default, more people are using `zsh` over `bash`. If you’re like me, you probably picked one of the many pretty themes (I picked [`agnoster`](https://github.com/agnoster/agnoster-zsh-theme)) that also had the nice functionality of telling you a) if you’re in a git repository and b) what branch you’re on. This is super great as *you don’t need to do a `git status` every time you enter a git repository.*

**However.** The way most of these themes implement this feature is by doing a `git status` every single time the prompt comes up. Which means most likely every time you press enter. I specifically had a repo that took a really long time to run `git status`; on the order of > 2 seconds. That means that every time I pressed enter, *I had to wait for 2 seconds for the prompt to reappear*.

As someone who takes latency really seriously and believes that slow systems infect your mind with slothfulness, this was unacceptable. Also, intuitively it didn’t make sense that to fetch *just the branch name and the fact that it’s a `git` repository was so slow*. It was most likely because `git status` also checks all of the statuses of changed files, which isn’t as important information for the shell prompt.

So I ended up finding [this StackOverflow thread](https://stackoverflow.com/questions/1128496/to-get-a-prompt-which-indicates-git-branch-in-zsh) on getting just the branch name into the `RPROMPT`. However, I don’t really like using `RPROMPT` as it messes up your copy-pastes in the case where you want to copy both your command and your output. [So I adapted it a bit](https://github.com/stephenjayakar/zshrc/blob/62c80d3c743ce4dd53892eb844bc567ef98ae743/.zshrc#L13-L32) to modify my `PROMPT` instead and disabled ZSH themes. It looks something like this:

![neurosis](/images/neurosis.webp)

# General tips

- In `bash`, `—` is an alias for “the last directory you were in.” So if you want to checkout to the last branch you were on, `g c -`. Or in normal git commands, `git checkout -`.
- I don’t like the normal `diff` tool used by `git`. Often for PR reviews, I’ll use [difftastic](https://github.com/Wilfred/difftastic) to compare their branch to `master` (you do `git diff master...` to diff with the last common commit, which is what GitHub spits out in its interface). To overwrite what diff tool `git` uses, you’ll want to add this to your `.gitconfig`:

```sh
[diff]
 tool = difft
```

- If you end up having a bunch of untracked files in your `git` repository by accident, you can nuke all of them by running `git clean -fd`. **This is a dangerous command.** Only do it if you’re ok with losing all of these files. Unsure if you can recover them via `g reflog`.

----

Good job making it this far. Hopefully this helps out someone out there! I’m proud of most of my workflow optimizations, but I’m also totally looking for MORE. hmu if you have any cool tips or tricks for `git`, or anything really. Also I’ll probably write more of these, but since a lot of them come from just using Emacs, I might have to make it Emacs-specific going forward.
