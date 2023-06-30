---
text: taasdasd
number: 12234234
---

Some text
```js-engine
let a = "test";
return a;
```
Some more text

```js-engine
let markdownBuilder = engine.markdown.createBuilder()

markdownBuilder.createHeading(2, "Test Heading")
markdownBuilder.createParagraph("This is a test paragraph.")

markdownBuilder.createHeading(3, "This is a sub heading")
markdownBuilder.createHeading(4, "This is a sub sub heading")
markdownBuilder.createParagraph("This is another test paragraph.")

let callout = markdownBuilder.createCallout("This is a callout", "info", "")

let callout2 = callout.createCallout("This is a nested callout", "danger", "")
callout2.createParagraph("This is a test paragraph.")

callout.createParagraph("This is a test paragraph.")
callout.createCodeBlock("js", "let a = 5;\nreturn a;")

let blockquote = callout.createBlockQuote()
blockquote.createHeading(5, "This is a block quote")
blockquote.createParagraph("This is another test paragraph.")

callout.createTable(["Column 1", "Column 2"], [
	["data 1", "**data 2**"],
	["data 3", "data 4"],
]);

return markdownBuilder
```

# Import Test

```js-engine
let lib = await engine.importJs("lib.js");
return lib.getGreeting();
```

# Async Test

```js-engine
return await engine.test()
```

# Meta Bind Test

```js-engine
const meta_bind_api = engine.getPlugin("obsidian-meta-bind-plugin").api

const div1 = container.createDiv()
const div2 = container.createDiv()

const inputField = meta_bind_api.createInputFieldFromString("INPUT[text:text]", "INLINE", context.file.path, div1);
const inputField2 = meta_bind_api.createInputFieldFromString("INPUT[number:number]", "INLINE", context.file.path, div2);

component.addChild(inputField)
component.addChild(inputField2)
```