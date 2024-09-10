+++
title = "I made a web app to get better at adding half-steps to notes"
date = 2023-12-27T12:39:25-07:00
tags = ['tech', 'music']
+++

_Originally posted [on Substack](https://stephenjayakar.substack.com/p/i-made-a-web-app-to-get-better-at?r=1pf9f2&utm_medium=ios&utm_campaign=post&triedRedirect=true)_.

![half-steps-1](/images/half-steps-1.png)

Try it out [here](https://music-math.vercel.app/) if you like pressing buttons as much as I do! [GitHub](https://github.com/stephenjayakar/music-math) if you like reading code.

During the holidays, I wanted to get better at answering questions like “what is 7 half steps up from A?[^1]” I often found myself in the situation of having these problems as a lot of guitar chord sheets are written something like “A capo 7” which means you put the big barre thing on your guitar and play an A-shape chord. When using a capo, the actual underlying chord is 'A + 7 half steps'. This means if you're collaborating with another instrument or with someone not using a capo, you need to communicate the actual chord you're playing. This requires some mental math, which I found slightly embarrassing as I didn't always immediately know what chord I was playing.

I had an idea that if I had a program ask me a ton of these questions, my brain would develop some type of internal algorithm to answer the question. And… spoiler alert, it did! Though we’ll talk about that later.

# What / how to build?

Making a program that calculates intervals and randomly picks notes isn’t that difficult. However, I did make a couple of decisions on how to build the app based on some goals + non-goals:

### Goals

- To be able to use the app both on my computer and phone. Phone mostly because I’d use it at the gym.
- Fast iteration speed plus once I was done to put a bow on it. I have a lotof personal projects that are just in semi-limbo and I was tired of notfinishing things.
- Look ok to nice
- Non-goal: storing state. Didn’t have a lot of upside for the upfront + maintenance complexity

These goals pushed me heavily into making some type of web app despite my disdain for JavaScript. I also limited the feature set to a simple quiz, which asks you to identify the next note based on a random note and half-step interval.

Since I wanted to really go fast, I didn’t want to spend time struggling with TypeScript compilation errors. My stack ended up looking like this:
- Javascript x React with `create-react-app`
- Deploying via Vercel
- No backend

I focused first on building the underlying interval calculation, which I overly complicated for myself as I focused on enharmonics too early. For those who don’t know, enharmonics are different ways of writing the same note (e.g. A♯/B♭)[^2]. After maybe an hour, I had a program that looked like this and worked:

![half steps 2](/images/half-steps-2.jpg)

### Enter ChatGPT

I'm not a fan of CSS, and even though it has improved over time, I never took an interest in mastering it. So as GPT4 now accepts images, I was like “why not just ask it to make it look better?”

Prompting is usually a bit of a magic art, but in this case, I was pretty straightforward:

![half steps 3](/images/half-steps-3.jpg)

![half steps 4](/images/half-steps-4.webp)

and after a couple of corrections, and some screenshots of bugs it had introduced, I had this!

![half steps 5](/images/half-steps-5.png)

It was **so much better** than something I would have come up with by myself. And once I had this screen presented to me, I had a couple of straightforward suggestions which then made the final product. Also, making the app look nice and adding visual feedback to correct & incorrect answers made me a lot more motivated to play the game, which was great.

I basically made it so that CSS was 100% ChatGPT’s arena, and the React components were “allowed to be refactored”; the core logic I did not allow ChatGPT to modify. I’m glad I kept this abstraction barrier, as ChatGPT often removed features or introduced slight logic bugs when I allowed it to just rewrite the components. Some examples:
- It nuked the feature I wrote in to message what the correct note should have been if you get it wrong
- It didn’t notice **my** bug and sometimes made it worse that displayed different enharmonics on rerenders, since it depends on `Math.random()`
- It would highlight the right answer on errors, but then fail to do that on successes which was confusing

> 💡 There’s always a disparity between expressing the problem statement in language → actually solving the problem. The gap between precisely expressing the problem and solving the note interval solver was super small for me; however, for expressing how the app should look + how to implement it in CSS, I was mostly at an impasse and only had vague sketches in my head. ChatGPT’s raw velocity was absolutely insane for me.

# How my brain got better at this

I’ve only spent maybe like 30 minutes actually using the tool, but I’ve already gotten so much better at the problem! Let’s go back to the original problem of “7 half steps up from A.” How my brain solves it is:
1. Converts 7 half steps → perfect 5th up
2. Imagines a violin and goes up a string, and sees `E`

Unfortunately (2) is pretty specific for me, as I’ve played violin since I was 8 or 9. But you can re-arrange this to:

1. Convert half steps to a music interval, like “minor 6th”
2. Go from interval to note

Which is pretty reasonable. Also, (2) is pretty valuable in itself as a musical skill 😊.

# Conclusion

I’ve been programming for a while. One thing they don’t tell you in school is that when you get better at making personal projects + fast iteration, you get better at solving your own (technical) problems. Sure, your first personal project might not be worth it on the “effort invested vs. time saved” curve; however, if you get really good at making programs that solve your problems, you’ll start to find that it swings really far in the other direction.

…of course, writing this article definitely took more of my time but 🤷‍♂️. I also kind of enjoy doing this type of thing so it’s still worth it for me.

We are also in such a golden age of creating really fast apps and deploying them as tooling is so good. Like I legit just launched a website with my app on it **for free**. Go Vercel!

[^1]: it’s E
[^2]: yes I know that these are different notes depending on if a temperament is assumed. this is another reason why I cut scope and didn’t do music intervals and just stuck to half steps.
