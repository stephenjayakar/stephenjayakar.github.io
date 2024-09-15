+++
title = "Choosing a Blogging Platform: Aesthetic and Technical Considerations"
date = 2024-09-14T11:57:45-07:00
tags = ['tech', 'meta']
+++

In my journey as a blogger, I’ve published posts across platforms like Medium, Substack, and other proprietary blogging stacks. When writing more and more technical stuff, I realized that some stacks were definitely better than others.

When consuming other people's blog posts, the first thing that stood out to me was aesthetics. You get an impression about the platform and the person simply by the details of how their text looks. Does their code have great, language-specific highlights? Do they use `monospace` + does their platform support it? How is the image formatting? What about the base color scheme?

As I worked with more platforms, I became frustrated with how my posts looked different on varying sites. The aesthetics were just too divergent, and I couldn't exactly express what I was writing in my Notion. My brain also noticed that there was an inverse correlation with "how cracked someone was" and their propensity to using Substack or Medium. I realized that it was time for change.

So, when designing something / researching what's out there, the first exercise is to list out your requirements:

# Feature-set that I want

I mostly listed out these nice-to-haves in a blogging platform:
* **Markdown-driven**. The format that I actually draft posts in + how I research things are in markdown-driven platforms (like [Obsidian](https://obsidian.md/)!), so it would be nice for the posts to be very similar
* **Arbitrary code highlighting**. Ideally I would like to just support every language I write, but sometimes the project I'm going to do will be niche enough that that would be a high expectation. I'm going to write a post soon on decompiling PowerPC assembly, and I doubt there's an out-of-the-box solution
* **View count per article**. I like to see how popular different posts are. I also often post my blogposts on other platforms such as Reddit + X, and it's nice to know how much traffic comes from there vs. direct links.
* **Categorization**. I had separate blogs for writing about Christianity & tech. The problem with this approach was that I actually wanted to write about more than just those two, but I didn't really have a place to do that. But Medium and Substack seemed like you were supposed to focus on one specific topic rather than just a personal blog. So I wanted to have a place where I could write anything, and then just let people filter by the topic they're interested in. Some other topics I wanted to write about were cocktails, food, video games, and more!
* Minimal upkeep. If I have to host the thing, I'd like to not have to spend any time configuring the website & it should just work.
* **Inline \(\LaTeX\) support**. Substack added block LaTeX support, which is nice, but wasn't exactly what I was looking for. Notion has inline LaTeX support which flows really nicely and allows you to just use it as an extended vocabulary while writing a paragraph.
* **Nested bullets**. You'd be surprised that Medium _doesn't support nested bullets._ I had to do [this silly workaround](https://chris-hart.medium.com/how-to-make-nested-lists-or-indented-bullet-points-on-medium-f7065e83d4d3), and it only works up to two levels. WTF???

# My stack + how it addresses my requirements

After some investigation, I realized that there's a whole plethora of solutions around markdown driven-blogs. I found `hugo` as well as a beautiful theme for it called `gruvbox` (which also happens to be the theme that I use for `emacs`!).

* [hugo](https://gohugo.io/)
* [gruvbox](https://themes.gohugo.io/themes/hugo-theme-gruvbox/)

Sometimes, when you first express your requirements and see what's out there, you realize that people are beautiful and have often thought much more deeply about the problem you're trying to solve than you could have ever imagined. Hugo often felt this way. They've done a great job expressing the problem of `markdown files -> static site` and have added all types of enhancements on top of markdown! It's also very easy to add things like inline \(LaTeX\). The categorization problem I was talking about they've solved with [taxonomies](https://gohugo.io/content-management/taxonomies/), which are honestly way more in-depth than what I needed; I can just solve my issue with using one of their default taxonomy, tags.

I was able to address all of my feature requests easily with `hugo` with one exception: view count per-blog-post. I could integrate Google Analytics, but the numbers may be skewed by adblockers. I also wouldn’t know where readers came from. But does that really matter? What I truly value is the discussion sparked by my posts, not just the view count.

This stack however is not a one-size-fits-all recommendation for bloggers. I definitely pulled out my hair a bit figuring out how to configure hugo with the theme, and I don't think using GitHub pages is viable for anyone who is non-technical. But, then again, most of the features I care about only matter to technical people -- Medium & Substack should be good for most other use cases.
