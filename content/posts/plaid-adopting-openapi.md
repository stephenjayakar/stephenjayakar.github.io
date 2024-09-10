+++
title = "Adopting the OpenAPI schema to generate Plaid's SDKs"
date = 2021-09-15T13:03:41-07:00
draft = true
tags = ['tech']
+++

_Originally posted on the [Plaid Engineering Blog](https://plaid.com/blog/adopting-the-openapi-schema-to-generate-plaids-sdks/) while I was part of Plaid's Developer Experience Team_.

The developer experience team focuses on building tools and features that make it as easy as possible for developers to explore our APIs and integrate with Plaid. This year, our team adopted an OpenAPI schema (OAS) as a specification for our API. We launched this schema in beta earlier this year.

Our team is responsible for maintaining three sources of truth for our API that allow developers to build and test their integrations:

* the docs
* our language SDKs, which we call the CLibs (Client Libraries)
* the actual API :)

Over time, we realized keeping all three of these developer-facing surface areas updated and synchronized can be a challenge as our API evolved. Ideally, we wanted one source of truth for our API in order to enforce a consistent experience for external developers, which is why we decided to use an OpenAPI schema as a point of reference to generate the docs, the client libraries, and part of our API.

We learned some valuable lessons along the way that we wanted to document and share so that other teams taking on similar projects could benefit. In this article, I'm going to walk through how we decided to use the OpenAPI schema at a company with an existing API that we are continuously iterating on, challenges we encountered, and how we overcame them.

# Philosophy

When we first started generating our SDKs, the bulk of the issues we ran into initially were around making sure our OpenAPI schema was an accurate representation of our API. However, after we resolved most of these issues, we started running into another class of problems -- issues with the generated output of the libraries. For dealing with these issues, there were a couple of things we could modify to improve the generated output:

- **The actual Plaid API implementation**
- **OpenAPI schema**: sometimes we could use different methods of representing the API within OpenAPI. Also, some features of the OpenAPI version we used weren't fully implemented by all the code generators -- we would abstain from using these features.
- **The actual generator implementation**: The project that we ended up using for code generation is [OpenAPI Tool's generator](https://github.com/OpenAPITools/openapi-generator). Each code generator is implemented in Java. We could fork the generator and modify this implementation to fit our needs.
- **Templates**: The code generators use [mustache](https://mustache.github.io/) templates for each language. While we couldn't completely change the output code by modifying templates, we could easily add helper methods or slightly change patterns.
- **Generator parameters**: the generator we used had a long list of parameters you can configure, such as `packageName`, `version`, and others. Some of these parameters can drastically affect code output.
- **Pre-processing or post-processing the schema or code**. For example, we could use scripts to insert in new files like a README.md or modify import paths with a find-and-replace.

We wanted to see how feasible modifying the OpenAPI Tools generator was to fit our purposes. We embarked on a short project to try to match our existing plaid-python library through generation by making sweeping adjustments to the Java implementation. We found that our changes were all pretty brittle as matching the questionable patterns in the old plaid-python library was difficult and arbitrary. For example, some endpoints were ordered by product, so `/transactions/get` would be `client.Transactions.get(...)`. This requirement was enforced inconsistently at times; for example, `/accounts/balance/get`'s method signature was `client.Balance.get`. This made it difficult to generate code that fit the existing library perfectly. Matching parameter ordering was also near to impossible without a ton of one-off generator edits.

Finally, we had a latent desire to not commit Java code at Plaid as we mostly don't use Java internally. **This resulted in us ruling out any generator implementation changes**. Another added bonus of not modifying the generator is that other developers outside of Plaid can generate a working library without using our forked generator!

Template changes were frustrating in general, as we had to have some idea about the generator implementation to modify them. Luckily, our small project with the generator implementation helped us out when making template changes.

This exploration helped us stack rank which changes to try first. We came up with something like this:

```
generator parameters > OAS > templates > any type of processing on the OAS or output code > the Plaid API
```

# Header secrets / POST secrets

Usually APIs have some form of authentication. Plaid's endpoints are a little unique in the following way:

- Every endpoint is an `HTTP POST` with a JSON attached.
- For authenticated endpoints, the JSON requestBody has `client_id` and `secret` attached as parameters.

While this is a reasonable way to authenticate endpoints, it isn't a pattern that OpenAPI supports out-of-the-box. OpenAPI supports BasicAuth and header keys, as well as some other forms of authentication. In old versions of the OpenAPI schema, we ended up having `client_id` and `secret` as required parameters in every requestBody. While this was correct and worked, when we generated the library, it made it so calling any endpoint required you to pass in the authentication again.

**old not generated library**

```python
client.TransactionsGet(params...)
```

**default output of generator**

```python
client.TransactionsGet(client_id, secret, params...)
```

This would have made using our library pretty frustrating as developers would have to wire their Plaid `client_id` and `secret` throughout their application and pass it into every endpoint call.

As engineers, we disliked the unnecessary complexity, so we considered two options:

1. Try to modify the generator to attach authentication on the right endpoints
2. Modify our API and OAS to match an OpenAPI authentication schema

Since we were opposed to modifying the generator, we decided to adopt an OpenAPI authentication schema. We discovered that some routes in the past supported header-based authentication where the `client_id` and `secret` were sent in the headers under the keys `PLAID-CLIENT-ID` and `PLAID-SECRET`. We decided to adopt this standard. However, **we didn't want to cause a breaking change to our API** by fully migrating to this new pattern. It was important to us that our old libraries were still compatible with the API! So we devised the following solution for every client-facing route: accept authentication either in the headers OR in the request body.

We modified every route to have this new authentication and also marked `client_id` and `secret` as optional in the requestBody. This allowed us to have a similar pattern to the old client libraries where authentication is passed in automatically, as OpenAPI supports this type of authentication. The library ended up attaching the authentication in the headers for the correct endpoints. Yay!

**Additive changes don't break JSON (`additionalProperties`)**

At Plaid, we've always treated **additive changes to endpoints as non-breaking**. This allows us to rapidly ship new functionality and features without forcing developers through API migrations.

Imagine an endpoint that officially returned named parameters `(x, y)`, but one day, the endpoint starts returning `(x, y, z)`: this is consistent with JSON Schema and is ok. It is also valid according to the [OpenAPI specification](https://swagger.io/specification/), which states "`additionalProperties` defaults to true" for objects, describing this behavior.

In our old client libraries, we generally handled additional parameters returning from the API gracefully and just dropped them. However, most of the generators either assumed `additionalProperties` was false by default and/or did not work correctly with it set to true:

- The Python generator assumed `additionalProperties` was false. Upon receiving a response that had extra parameters, the library crashed on deserialization. This is when we decided to add `additionalProperties: true` to every response model, as we're ok with over-specifying values in our OpenAPI schema even if they're default.
- The other libraries either dropped values if `additionalProperties` wasn't set to true, or they'd stick it in a map.
- The default output of the Java generator was a mess. Adding `additionalProperties` *at all* to any response model caused an inheritance bug where the model extended `HashMap` but didn't properly implement the interface. The output code didn't compile, and we couldn't really figure out how to fix it through templating. The behavior when not having `additionalProperties` was just to drop additional values; we were ok with this. We added a pre-processing step to the OpenAPI file to remove all instances of `additionalProperties` before handing it to the Java generator.

This particular issue was a headache. If you run into this issue, make sure to check all your languages' outputs carefully. We debugged this by picking an endpoint that was easy to call with minimal setup (one example for the Plaid API is `/categories/get`). We would set `additionalProperties` to true, and then remove a known parameter from the response model of the endpoint. We then fired up the generated code and saw what happened when the library received an unexpected response parameter -- if it didn't crash, we were in the clear.

# Request and response models inconsistently implemented

In OpenAPI, you can either define your request and response's schema inline or use a `$ref` to point to a named model. In the initial revision of the OpenAPI schema, all of our endpoint schemas were defined inline something like this:

```yaml
endpoint:
  responses:
    object: ...
  requestBody:
    object: ...
```

We hoped that when generating Python, it would just pick an order for the parameters and output something like:

```python
client.Endpoint(requiredParams..., optionals...)
```

Nope. Instead, the generator ended up creating anonymous models called something like inline_model_xx. The endpoint would look like this:

```python
client.Endpoint(inline_model_xx(requiredParams..., optionals...))
```

Not ideal. Some generators flat out didn't work correctly with anonymous objects as well (looking at you, Go). We ended up creating named request and response models for every endpoint. The endpoint TransactionsGet has an associated TransactionsGetRequest and TransactionsGetResponse. The generated code ended up using these names we provided.

```yaml
endpoint:
  responses:
    $ref: "endpointResponse"
  requestBody:
    $ref: "endpointRequest"
```

```python
client.Endpoint(endpointRequest(requiredParams..., optionals...))
```

# Misc. things we had to template

There were a couple of small quality-of-life changes that we templated in. Aside from helper functions for dealing with the libraries, we also did slightly bigger changes.

## Client library initialization -- environments

OpenAPI allows you to define a list of servers that your API supports. Plaid supports three environments – sandbox, development, and production – which all have different URLs. We wanted to support these as constants and allow these constants to be easily inputted as one of the initialization arguments. We had template modifications of this form:

```
{{#servers}}
const {{{description}}} = "{{{url}}}"
{{/servers}}
```

```js
// which yields code like

const sandbox = "https://sandbox.plaid.com"

...
```

While this is abusing the description field, we controlled that it was set to something reasonable :).

## Version pinning

Some of our older client libraries (Node, Python) used to support multiple API versions, because they were thin wrappers over HTTP POST where the responses were basically dictionaries. Now that we are generating the libraries and strongly typing the responses, we only support the latest Plaid API version.

The way you specify what API version you're using for Plaid is by setting the `Plaid-Version` header in your requests. So we added in templating to force this value to the latest API version for all libraries.

# Conclusion

These were only a couple of the challenges that we ended up dealing with, and we still have many more improvements we could ship. The project shipped successfully to GA for all of our languages the week of 8/16/21. These new libraries are filled with improvements for developers, including but not limited to:

* better adherence to the API and docs.
* some language-specific features, like async support for Node and contexts for Go.
* consistency between languages for method names.

It was really cool to slowly make these libraries something we'd be happy to use ourselves from the default generated outputs. Many of the solutions we came up with during the project focused around cutting the verbosity in using our libraries. If you want to vet the quality of your generated libraries, just try using them! Every time you run into an issue once, your developers who use your SDK will probably run into them 100s of times over.

We’re happy to document how we dealt with the many challenges along the way, and hope we can help fellow engineers on a similar journey.
