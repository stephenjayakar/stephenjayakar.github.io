+++
title = "My Notes on Google's TrueTime"
date = 2023-06-04T14:41:15-07:00
draft = true
tags = ['tech']
katex = true
+++

_Originally posted [on Substack](https://stephenjayakar.substack.com/p/my-notes-on-googles-truetime?utm_campaign=post&utm_medium=web&triedRedirect=true)_

*edit: this blogpost was initially wrong when I published it. Thanks to some comments I got, I learned I didn’t fully understand TrueTime or Spanner — I’ve spent some time learning and understanding the core concept again, and have updated this artifact. This is an externalized resource for me that I hope can be helpful for others.*

When I was reading the [famous paper on Spanner](https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf), Google’s globally distributed linearizable database, I really struggled with the concept of TrueTime, which is a core component of *why* they were able to get their guarantees. After trying to wrap my head around it, I created the following artifact (IMO, TrueTime deserves a mini-ish paper or post on its own):

---

So first, let's assume that we have a way to globally agree in a distributed fashion on a single value (this is Paxos, which I won't be going into here). In this case, we want that value that all nodes to agree on to be the correct ordering of transactions. However, even with such a powerful primitive, if we were to just use normal timestamps, **we’ll still have issues actually assigning an order to transactions**.

Clocks are always inaccurate. Not just a set amount from the current time — they unfortunately also drift. And in different amounts from each other. So **in distributed systems, clock synchronization is a hard problem**, and generating timestamps that are ordered globally is nontrivial.

Imagine you wanted to globally order transactions by what time they committed. If a clock was off even between two nodes, we already are SOL if we use the local time as the ordering constraint:


![truetime 1](/images/truetime-1.jpg)

So given nodes A and B with TXNs, and given:

$$T_A, T_B| T_A < T_B$$

Then Meow
