+++
title = "A Quick Dive Into Python's Slots"
date = 2018-11-09T18:00:10-07:00
draft = true
tags = ['tech']
+++

_The original version of this article was posted [on Medium](https://medium.com/@stephenjayakar/a-quick-dive-into-pythons-slots-72cdc2d334e)_.

For my first Medium article, we’re going to go into a quick and easy way to speed up your Python code (and pass those pesky HackerRank tests where you’re just a bit short on time!), as well as some of the technical implementation details for the curious.

`__slots__` is an attribute you can add to a Python class when defining it. You define slots with the possible attributes that an instance of an object can possess. Here’s how you use `__slots__`:

```python
class WithSlots:
    __slots__ = ('x', 'y')

    def __init__(self, x, y):
        self.x, self.y = x, y
```

For instances of this class, you can use `self.x` and `self.y` in the same ways as a normal class instance. However, one key difference between this and instancing from a normal class is that you _cannot add or remove_ attributes from this class’ instances. Say the instance was called `w`: you couldn’t write `w.z = 2` without causing an error.

The biggest higher-level reasons to use `__slots__` are 1) **faster attribute getting and setting** due to data structure optimization and 2) **reduced memory usage** for class instances. Some reasons you wouldn’t want to use it is if your class has attributes that change during run-time (dynamic attributes) or if there’s a complicated object inheritance tree.

# Testing

![Now this is where the fun begins!](/images/slots-meme.webp)

Let’s first do some tests to see when `__slots__` is faster, starting with mass instantiation. Using Python’s “timeit” module and this code snippet, we get the following results:

```python
class WithoutSlots:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

class WithSlots:
    __slots__ = ('x', 'y', 'z')

    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

def instance_fn(cls):
    def instance():
        x = cls(1, 2, 3)
    return instance
```

```
Without Slots: 0.3909880230203271  
With Slots: 0.31494391383603215  
(averaged over 100000 iterations)
```

Instantiation is slightly faster with slots in this case. This makes sense, as we’re denying `__dict__` creation for new instances of the given object. Dictionaries generally have more overhead than tuples or lists. Let’s try this with a class that has much more attributes associated to an instance! (This example has 26 attributes):

```
Without Slots: 1.5249411426484585  
With Slots: 1.52750033326447  
(averaged over 100000 iterations)
```

In general, instantiation time is not really improved by using `__slots__`. Despite not having to create `__dict__`, there’s other overhead that needs to be done with slots that we’ll go into later, which results in a similar runtime to copying over the dictionary from the actual class.

The real speedup comes into play when we start getting and setting values in rapid succession:

```python
def get_set_fn(cls):
    x = cls(list(range(26)))
    def get_set():
        x.y = x.z + 1
        x.a = x.b - 1
        x.d = x.q + 3
        x.i = x.j - 1
        x.z = x.y / 2
    return get_set
```

That’s over a 20% speed increase! I’m sure if the test was more extensive (and didn’t always access the same attributes, as well as had attributes that were longer than a single character), there could be a more substantial speedup.

## Memory Usage

First, let’s test the differences between how tuples and dictionaries grow in memory. As using `__slots__` knows what attributes can exist for a given instance, it can allocate for the descriptors associated with an instance (instead of having to add a `__dict__` for each new object). In Python, it’s a bit difficult to profile the exact amount of memory used by an instance of an object: `sys.getsizeof` only works well for primitives and built-ins. Instead, we’ll be using a function called `asizeof` in a library called “Pympler.”

```
>>> asizeof(('a', 'b', 'c', 'd'))  
304  
>>> asizeof({'a': 'b', 'c': 'd'})  
512  
>>> asizeof(tuple(string.ascii_lowercase))  
1712  
>>> dictionary  
{'e': 'f', 'k': 'l', 'c': 'd', 'g': 'h', 'o': 'p', 'i': 'j', 's': 't', 'm': 'n', 'q': 'r', 'a': 'b', 'y': 'z', 'w': 'x', 'u': 'v'}  
>>> asizeof(dictionary)  
2320
```

We’ve elided an implementation detail for the `__slots__` example here: instead of having one tuple for descriptors and one for values, we’ve just put them all in one list. However, we’ll see the size difference isn’t that big compared to the difference between a tuple and a dict:

```
>>> asizeof(('a', 'b')) + asizeof(('c', 'd'))  
352
```

And just for good measure, here’s what happens when we actually run `asizeof` on our previous example of a slotted class:

```
>>> w1 = WithoutSlots(1, 2, 3)  
>>> asizeof(w1)  
416  
>>> w2 = WithSlots(4, 5, 6)  
>>> asizeof(w2)  
160
```

# CPython Implementation Details

So first, let’s clear some things up about _what_ CPython is. There’s a standard implementation of the language Python and its core is written in C. It’s probably what’s installed on your machine (and what runs) when you type in `python3`. You can download the source [here](https://www.python.org/downloads/release/python-371/).

I was curious to see what actually changed when defining a class with `__slots__`, and also just wanted an excuse to prod around CPython’s 3.7.1 release. I’ll also indicate what file to check out if you’re following along at the end of each point. Here’s some key things I picked up:

- When `__slots__` is found in the class being instantiated (it’s part of the classes default `__dict__`), `__dict__` isn’t created for the new instance. However, the dictionary will be instantiated if you add `__dict__` to `__slots__`, which means you can have the best of both worlds if you know what you’re doing. **Files:** _typeobject.c_ `type_new`.
- Instantiating for classes with `__slots__` seems like a bit more work than just creating `__dict__`. Essentially, you iterate through all the values defined in the class’s dictionary entry of `__slots__` and have to set aside descriptors for every single entry. Check out `type_new` in _typeobject.c_ for more info. **Files:** _typeobject.c_ `type_new`.
- The bytecode generated for classes with slots and without is the same. This means that the differences in lookup are under how the opcode `LOAD_ATTR` is executed. Check out “dis.dis,” a built-in Python bytecode disassembler.
- As expected, not having `__slots__` ends up doing dictionary lookup: if you’re interested in the details, check out `PyDict_GetItem`. It ends up getting the pointer to the `PyObject` which holds the value by looking up in a dictionary. However, if you have `__slots__`, the descriptor is cached (which contains an offset to directly access the `PyObject`without doing dictionary lookup). In `PyMember_GetOne`, it uses the descriptor offset to jump directly where the pointer to the object is stored in memory. This will improve cache coherency slightly, as the pointers to objects are stored in 8 byte chunks right next to each other (I’m using a 64-bit version of Python 3.7.1). However, it’s still a `PyObject` pointer, which means that it could be stored anywhere in memory. **Files:** _ceval.c, object.c, descrobject.c_

# Some GDB Pointers

If you want to dig around CPython like I did, there’s some setup required before you can start stepping through the code to find what functions run. After downloading the source and installing the required packages (I’d check the build instructions for your machine on the [official repo](https://github.com/python/cpython)), instead of doing just `./configure`, run `./configure --with-pydebug`. This creates a debug build of Python instead of a normal one, which allows you to attach GDB to the process. Then you run `make` to create the binary and debug it using GDB by running `gdb python`.

Also, if I wanted to debug my actual Python code, I had two strategies. Either a) create a conditional breakpoint where I wanted to stop in GDB using the current `type->tp_name` string (and naming my class something weird), or b) actually writing the `if` statement into the code and putting the breakpoint within the statement. I ended up using the latter strategy more often, because I found that pasting in a long breakpoint conditional statement into `gdb` every time I reopened the debugger was pretty annoying (and I ended up memorizing `b object.c:869` after enough run-throughs).

# Conclusion

Overall, this article was kind of an excuse for me to look into CPython on my own time 🤤. I ended up learning a ton by downloading and building Python on my own and inserting `printf` statements in random places as well as using `gdb`. Also, I had heard the higher-level reasons for why to use `__slots__` and actually wanted to test the claims for myself in a more empirical way. Hopefully you learned something new while reading! Leave any questions at the bottom and I’ll try to answer them.

# References

[StackOverflow: Usage of slots?](https://stackoverflow.com/questions/472000/usage-of-slots?source=post_page-----72cdc2d334e--------------------------------)

[Data model - Python 3.7.1 Documentation](https://stackoverflow.com/questions/472000/usage-of-slots?source=post_page-----72cdc2d334e--------------------------------)

[GitHub: python/cpython](https://github.com/python/cpython?source=post_page-----72cdc2d334e--------------------------------)
