+++
title = "Why pay for Notion’s AI? I built my own auto-tagging tool in a week!"
date = 2024-09-04T12:55:02-07:00
tags = ['tech']

[cover]
src = "/images/notion-ai.webp"
alt = "notion ai"
caption = "We have AI at home, courtesy of ChatGPT"
+++

_Originally posted [on Medium](https://medium.com/@stephenjayakar/why-pay-for-notions-ai-i-built-my-own-auto-tagging-tool-in-a-week-be2f57fb1b92)_.

I built the thing I talk about in this blog post — if you want to check it out, [it’s here](https://github.com/stephenjayakar/notion-journal-tagger/)!

[Notion](https://www.notion.so/), like every tech company, has been shoving AI features down our throats for the last couple of months at the cost of customer UX. **So I disabled them**. You can do this yourself by just messaging support — I got the idea from [this Reddit thread](https://www.reddit.com/r/Notion/comments/1d2mbyx/how_to_remove_notion_ai_from_workspace/), which is one of many. Ever since I disabled it, the UX has at least returned-to-normal, and performance of editing has increased (have you ever noticed how Notion lags a bit every time you press `SPC` so that it can show you the AI toolbar?).

As I’m about to enter a brief phase of unemployment and grinding on personal projects, I’m looking for quick AI projects to whet my appetite to build. It turns out that some of Notion’s AI features were so simple that they’re great intro projects. Specifically, I was intrigued with building auto-labeling for my journal entries. Notion has a feature that, for a given database, you can label it with tags; on top of that, it has an AI feature that will read through all your entries and auto tag them:

![notion ai 2](/images/notion-ai-2.webp)

So I’m already a paying customer for Notion. But they have the gall to charge me an additional $8/m to support this feature? Absolutely ridiculous! They already charge me $4/m simply to host my data and barely iterate on the product. To break this down on why this is ridiculous:

- They already have margins from me paying to use Notion. Them adding these AI features on for free would be compelling customer-lock-in
- This feature can be implemented within a week by a disgruntled software engineer (me! it’s me!). Sure, I know, it’s not exactly the full scope of the things that feature offers (I’m guessing they have an async job kicked off when you make edits?), but it’s good enough for my purposes.
- In reality, using the API for GPT 4o is likely much cheaper than $8/m. Also, back when I had this feature on, *they hadn’t even migrated to using the later GPT models*. 🤮

# The project

The idea behind this is a great use of AI! Especially for my journal, I want to have the barrier of entry to write a journal entry (hehe) as low as possible, and keeping up the effort to manually tag every entry is a pain.

With the release of [OpenAI’s structured outputs](https://platform.openai.com/docs/guides/structured-outputs) that guarantee that it returns something within your schema (aka the tags that you want), it’s very easy to guarantee that the AI output is just a list of tags.

As of right now, I have 451 journal entries that go back all the way to 2016 (yes, the start of reflective Stephen). Roughly 90 of them were tagged. And due to my journal being mostly organic growth, sometimes the tags that I used changed over time, and so they weren’t a consistent way to search through my journal.

## Design

I knew that I had to do the following:

1. Using the Notion API: Pull the content for all my journal entries
2. Using the OpenAI API: Feed the content into `4o` and ask it what it would label the entry
3. Using the Notion API: Overwrite the entry’s tags with the new generated tags

Since this involves a lot of phases and any one of them can fail, I separated the scripts’ running into four phases after learning the basics of the Notion API:
1. Get all the pageIDs in the database (my journal)
2. For each pageID, get the content
3. Ask ChatGPT given the content & title & some more stuff what tag(s) the entry should have
4. Actually write these tags to Notion

…and then built in support for snapshotting after each phase ran. The `python` script saves all of the results locally using `pickle`, which is something that works great in dev, but would not recommend using in production (my friends have horror stories!).

To actually get OpenAI to tag my posts well, I had to experiment with prompting, which leads to our next section.

## Prompting

This project is the wake-up call I needed to discover how important prompting is. At first, I thought I could just copy and paste my journal entry into ChatGPT and hope for some good tags. I hoped wrong, here are some of the issues I ran into:
- obviously, i needed to make sure that the AI *only* returned tags. You can’t do this via the web interface
- the AI was pretty tag-happy and added tags at a whim, when I really didn’t think it should tag it with that
- there wasn’t a way to pass in additional context, such as “X is my brother.”

First, we want to use the structured outputs feature from OpenAI to make sure it *only* returns tags, and we can use them in code. That was easy enough, but I had to learn how the schema format works.

After that, I discovered that there is a level of knowledge required about my life that are not easy for the AI to understand just from my entries. For example, how is the AI supposed to know the name of my brother? Girlfriend? Church? What school I went to? I realized that I would have to give it more information than just the entry, and also would have to make sure that the additional context doesn’t bleed into its tagging decision (just because I talked about my brother in the context doesn’t mean that he’s in the journal entry). There are three things we can modify: the **system prompt**, **the schema**, and **the user prompt**. Normally, on https://chatgpt.com/, you can only modify the user prompt. So I ended up coming up with this solution.

In the system prompt (context for how the AI should behave):

```
You are an AI assistant that labels content with appropriate tags. Please analyze the given title and content and assign relevant tags from the provided list. Be conservative in your tag selection:
- Only assign tags if there's a medium to strong correlation with the title and content.
- It's better to assign fewer tags or even no tags than to assign irrelevant ones.
- Consider the context and overall theme of the content, not just keyword matches.
- If you're unsure about a tag, it's better to omit it.

Additional context to help understand the entries: {additional_context}
```

The `additional_context` variable is simply an envvar that has things like "x is my church".

Then, in the user prompt, I passed it the title, content, and a reminder to tag the entry and be cautious about tagging.

From a high-level:

- **system prompt**:DirectivesAdditional Context
- **user prompt**:TitleContentSome directives
- **additional fields**:schema: `[ENUM TAGS]` — this makes sure that OpenAI uses your custom list of tags, and *only* returns those.

## Methodology

There’s been a lot of hype around [Cursor](https://www.cursor.com/), the AI-powered fork of VSCode. I’m a committed user of Emacs, but my integration with ChatGPT has been getting a little stale as [`gptel`](https://github.com/karthink/gptel) is pretty bare-bones (it is possible I have not been keeping up with its new features). I decided to try it out for this project and then later, attempt to fold in these UX features into Emacs.

Cursor is amazing. I barely wrote any code for this project myself. I often just selected the whole file, pressed CMD + K, and told it to add x feature.

This doesn’t mean non-technicals can build fully-fledged apps on their own with Cursor. I was very specific with my requirements, and I understood thoroughly how this project would work down to the checkpointing feature. **I just didn’t want to take the time to learn Notion’s API.** On top of that, OpenAI’s new structured output feature is brand-new, so there’s no way that Claude 3.5 Sonnet would have known about it.

I also wrote a couple of scripts that helped debug this project as I ran it over and over. The most helpful script allows you to run all 4 phases on just one page within the database, so if you end up trying this project yourself, check out `scripts.py`.

# Closing thoughts

There are probably features that Notion could build that reasonably use their customer-lock-in. If they made a RAG on all of my workspace, that would be sick. Or if I could figure out all the things I’ve said about `git`! They could build an amazing search that also processes your attached images, and runs OCR on them, and/or uses location information to be like "what in my workspace is about Paris?" But I don't have a lot of faith considering that their current search is *abysmal*, and I've just been disappointed time and time again with their roadmap.

I’m kind of soft-evaluating Notion alternatives, but it’s been hard to figure out exactly what my requirements are. Offline mode is important, but also I want to be able to share my documents, I want them to look pretty, I want nice looking code blocks, I want features beyond basic markdown ones…. it’s hard to find all of these. Also, lowkey, it would be cool to have a platform for my blogs that isn’t Medium or Substack. My search continues…

For now, though, I’ll be using this tagger to help auto-tag my entries and rediscover my old entries all over again. It’s always funny to find an entry that’s titled “I can’t do this anymore” and see the tag `Dating` 😅. If you want to use this and are struggling with my GitHub, feel free to open an issue or write a comment here! Onto my next project :)
