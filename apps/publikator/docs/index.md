# Publikator Frontend

This is the frontend for the Publikator CMS. It allows you to create, edit and persist articles to GitHub via the API exposed by the [publikator-backend](https://github.com/orbiting/publikator-backend) package.

At its core it consists of the following:

* A WYSIWYG editor based on [slate](http://slatejs.org).
* A serializer that reads from and writes to a standard compliant but implicitly opinionated Markdown format.
* A modular schema layer that
  * handles the conversion from Markdown to Slate values and vice versa using the [MDAST spec](https://github.com/syntax-tree/mdast).
  * enables us to DRYly compose custom non-standard Markdown elements while still maintaining a well-defined data structure.
  * handles validation and normalization of MDAST trees for both the Editor parts and any render client.
  * collects Slate related validation / normalization cycles and compiles them for direct use in a Slate Editor component.
* A template layer that defines which elements should get used for a certain kind of document and how they should get rendered.

In the following sections I will try to explain how to set up a new content element and, along the way, how all those concepts tie in together.

I'd' strongly recommend you to at least have a quick glance at the docs of both MDAST and Slate before getting started with...

## The Mission

We want to create a custom block quote element that contains
* a picture of the person whose quote it is (image, optional).
* the quote itself (exactly one paragraph, mandatory)
* the source (hyperlink, mandatory)

This element could get used to display a user comment within a document.

We want the HTML representation to look something like this:

```HTML
<blockquote class="custom-blockquote">
  <img src="[image url]" alt=[image description] title="[image title]" />
  <p>Quote body</p>
  <!-- Maybe some more paragraphs -->
  <cite>
    <a href="[quote source url]" title="[quote source title]">
      Quote source
    </a>
  </cite>
</blockquote>
```

### Thinking from Markdown

> "I got my mind on my MD and my MD on my mind."
> Snoop MDog

As our main source format is Markdown, we have to think about how our block quote will get transformed from and to it. The default notation for block quotes in Markdown looks like this:

```
> This is a block quote and it can contain any *inline* **markdown* [notation](link).
```

While this works for simple use cases, we'd have a hard time to enforce the aforementioned layout and child order of our custom block quote.

In order to be able to give context to certain elements or collection of elements beyond the standard Markdown spec, we came up with the idea of zones. In the Markdown realm, zones look like this.

```
<section><h6>Zone Identifier</h6>
\`\`\`
{
  "key": "value"
}
\`\`\`
...zone content
</section>
```

This is perfectly valid Markdown and will result in a human readable representation while at the same time enabling us to anticipate a nested and most importantly well-defined data structure.

If you parse this code block with our own [slate-mdast-serializer](https://github.com/orbiting/mdast) (more on that later), you'll get the following object representation of the syntax tree:

```javascript
{
  type: "root",
  children: [
    {
      type: "zone",
      identifier: "Zone Identifier",
      data: {
        key: "value"
      },
      children: [
        {
          type: "paragraph",
          children: [
            type: "text",
            value: "...zone content"
          ]
        }
      ]
    }
  ]
}  
```

So what basically happens is this:

* If the parser finds a `<section>` tag, it creates a node of type `zone` with a property `identifier` that equals the content of the `<h6>` tag that follows the opening `<section>` statement.
* If the first element after the opening `<section>` statement is a code block, its contents get parsed as JSON and set to the `data` property of the `zone` node.
* All other elements between the opening and closing `<section>` statements will get parsed as children of the `zone` node (as opposed to direct children of the document, which would be standard MDAST behavior)

Needless to say that zones can be infinitely nested.

So, if we take the Markdown angle on our block quote element, we aim at a data structure that serializes from and to this:

```
<section><h6>CUSTOM_BLOCKQUOTE</h6>

  ![Image of Winston Churchill][churchill.jpg "Winston Churchill"]

  There is no such thing as public opinion. There is only published opinion.

  [Winston Churchill](https://www.brainyquote.com/quotes/quotes/w/winstonchu156898.html "brainyquote.com")

</section>
```

The MDAST representation of the above reads as follows:

```javascript
{
  type: "root",
  children: [
    {
      type: "zone",
      identifier: "CUSTOM_BLOCKQUOTE",
      data: {},
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "image",
              title: "Winston Churchill",
              alt: "Image of Winston Churchill",
              url: "churchill.jpg"
            }
          ]
        },
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "There is no such thing as public opinion. There is only published opinion."
            }
          ]
        },
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              title: "brainyquote.com",
              url: "https://www.brainyquote.com/quotes/quotes/w/winstonchu156898.html",
              children: [
                {
                  type: "text",
                  value: "Winston Churchill"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}  
```

You might have noticed a few oddities while examining this syntax tree. Firstly, there is a paragraph around the image which doesn't translate too well to the HTML structure we've defined before. Same is true for the quote source; We only can assume that the latest paragraph is probably the element that should become our `<cite>` element later on.

But this is what we get, what we serialize to and what we ultimately have to work with. Remember the part where I called our Markdown output as standard compliant but implicitly opinionated? Considering the above, I think the implicity about it becomes next level obvious.

But at least, we have a clear outline of what we're dealing with.

## The Serializer

In our mission briefing we already formulated certain structural conditions. In order to fully achieve interoperability, we have to anticipate "invalid" MDAST trees, but instead of simply rejecting non-valid parsing results, we'd rather have a mechanism in place, that gracefully "solves" structural problems along the way by translating invalid nodes into valid ones during the parsing process.

So our serializers not only translate data from Markdown to MDAST to Slate (and vice versa), but also sanitize invalid parts during the process. Depending on the complexity of the conditions, these normalization routines can become quite implementation-heavy, but we assume that once our module base has grown a little more, we will be able to offer further abstractions to prevent too much repetition in code.

Ok, let's go then.

```javascript
import MarkdownSerializer from 'slate-mdast-serializer'
// or
const MarkdownSerializer = require('slate-mdast-serializer')


const serializer = new MarkdownSerializer()
```

In order for the serializer to know how to treat the different nodes on both sides (MDAST and Slate), we have to pass it a list of so-called rules. A rule *has* to expose the following properties:

* `match: slateNode => Boolean`
* `matchMdast: mdastNode => Boolean`
* `fromMdast: (mdastNode, index, parent, visitChildren) => slateNode`
* `toMdast: (slateNode, index, parent, visitChildren) => mdastNode`

The parameters are quite self-explanatory, with probably the exception of `visitChildren`. This is a function that accepts an array of child nodes and tries to return their counterparts by matching and converting them using the rules initially passed to the serializer again.

See the respective docs of [MDAST](https://github.com/syntax-tree/mdast) and [Slate](https://docs.slatejs.org/slate-core/node) to learn more about the nodes and what properties they expose.

**Please note that when we're talking about Slate nodes here, we're still referring to POO's and not instantiated immutable Slate values.**

To write our matcher functions, we need to choose a name for the Slate node. To keep things simple, we'll call it `CUSTOM_BLOCKQUOTE` as well. On top of that we'd probably want a explicitly named Slate block for both our `<cite>` and `<img>`, so let's call them `CUSTOM_BLOCKQUOTE_CITE` and `CUSTOM_BLOCKQUOTE_IMAGE` respectively.

**Please note that by convention Slate nodes should always have uppercase types.**

With that out of our way, we can write our matcher functions.

```javascript
const match = slateNode =>
  slateNode.kind === 'block' && slateNode.type === 'CUSTOM_BLOCKQUOTE'

const matchMdast = mdastNode =>
  mdastNode.type === 'zone' && mdastNode.identifier === 'CUSTOM_BLOCKQUOTE'
```

Now we get to the actual serializing part. Let's start by writing a trivial `fromMdast` function which assumes that "everything's ok", meaning that we get exactly the elements you'd expect when reading the mission briefing.

We also assume that our serializer already knows how to convert `link` and `text` nodes (hence the `visitChildren` calls).

```javascript
const fromMdast = (mdastNode, index, parent, visitChildren) => {
  // As you can see in the syntax tree from above, our image object
  // is buried inside a paragraph, which in an ideal setting is
  // the first child. So let's extract it.
  const imageNode = mdastNode.children[0].children[0]

  // The actual quote paragraph is the second child
  const quote = mdastNode.children[1]

  // And finally the cite, which is the third element in the child list
  const cite = mdastNode.children[2]

  // Now we can return a Slate node like this
  return {
    kind: 'block',
    type: 'CUSTOM_BLOCKQUOTE',
    nodes: [
      {
        kind: 'block',
        type: 'CUSTOM_BLOCKQUOTE_IMAGE',
        isVoid: true,
        data: {
          url: imageNode.url,
          title: imageNode.title,
          alt: imageNode.alt
        }
      },
      {
        kind: 'block',
        type: 'paragraph',
        nodes: visitChildren(paragraph.children)
      },
      {
        kind: 'block',
        type: 'CUSTOM_BLOCKQUOTE_CITE',
        nodes: visitChildren(cite.children)
      }
    ]
  }
}
```
This, of course, is not very practical. We have no guards whatsoever and the code will break as soon as the syntax tree we're parsing doesn't exactly fit the assumed data structure.

We're not going to implement all safety checks and sanitations here, as I think it is quite obvious now what this function should be able to handle.

However, you should be aware of the fact, that there's often multiple ways to normalize child order and types and how you do it can affect the user experience in the Editor later on, as we have to somewhat mirror the behavior in the Slate part. More on that a bit later though.

Let's do this for the Slate to MDAST part as well. For simplicity reasons, we again assume a perfectly shaped Slate data structure and rules for links, text and stuff.

```javascript
const toMdast = (mdastNode, index, parent, visitChildren) => {
  const imageNode = mdastNode.nodes[0]
  const paragraphNode = mdastNode.nodes[1]
  const citeNode = mdastNode.nodes[2]

  return {
    type: 'zone',
    identifier: 'CUSTOM_BLOCKQUOTE',
    children: [
      // Here, we have to put the image back into a paragraph
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            url: imageNode.data.url,
            title: imageNode.data.title,
            alt: imageNode.data.alt
          }
        ]
      },
      {
        type: 'paragraph',
        children: visitChildren(paragraphNode.nodes)
      },
      {
        type: 'paragraph',
        children: visitChildren(citeNode.nodes)
      }
    ]
  }
}
```

Now we're able to create a serializer with our new rule.

```javascript
const serializer = new MarkdownSerializer({
  rules: [
    {
      match,
      matchMdast,
      fromMdast,
      toMdast
    }
  ]
})
```
