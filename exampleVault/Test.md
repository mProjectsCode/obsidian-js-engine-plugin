---
text: this is some text
number: 12234234
---

Some text
```js-engine
let a = "*test*";
return a;
```

```js-engine
let a = "*test*";
return engine.markdown.create(a);
```
Some more text

# Big Markdown Chunk

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
])

callout.addText('And now a list.')

let list = callout.createList(false)
list.addText('test')
list.createTable(["Column 1", "Column 2"], [
	["data 1", "**data 2**"],
	["data 3", "data 4"],
])

let sublist = list.createList(true)
sublist.addText('sub list')
sublist.addCode('this is some code')

list.addText('another Element')

let sublist2 = list.createList(false)
sublist2.addText('another sub list')


return markdownBuilder
```

# Import Test

You can import JS files that lie inside of your vault.

JS Engine version:

```js-engine
let lib = await engine.importJs("lib.js");
return lib.getGreeting();
```

Modules Plugin version:

```js-engine
let lib = await self.require.import("lib.js");
return lib.getGreeting();
```

Run File:

```js-engine
const execution = await engine.internal.executeFile('testFile.js', {
	container: container,
	component: component,
});
const renderer = engine.internal.createRenderer(container, context.file.path, component);
renderer.render(execution.result);
container.createEl('p', {text: 'hello, this is rendered from this file'});
```

Without creating a renderer:

```js-engine
const execution = await engine.internal.executeFile('testFile.js', {
	container: container,
	component: component,
});
return execution.result
```

# Lib Test

Importing packaged libraries works. In this example [parsiNOM](https://github.com/mProjectsCode/parsiNOM) is used.

```js-engine
let { P, P_UTILS } = engine.lib.parsinom();

const parser = P.sequence(
	P_UTILS.letters(), 
	P_UTILS.digits()
).map(
	([a, b]) => b + a
);

return parser.parse("test123");
```

This example uses [IterTools](https://github.com/Smoren/itertools-ts).

```js-engine
let { Stream } = engine.lib.itertools();

const result = Stream.of([1, 1, 2, 2, 3, 4, 5])
	.distinct()             // [1, 2, 3, 4, 5]
	.map((x) => x ** 2)     // [1, 4, 9, 16, 25]
	.filter((x) => x < 10)  // [1, 4, 9]
	.toSum();               // 14

return result;
```

# Meta Bind Test

You can interact with other plugins APIs, in this example [Meta Bind](https://github.com/mProjectsCode/obsidian-meta-bind-plugin) is used.

```js-engine
const mb = engine.getPlugin("obsidian-meta-bind-plugin").api

const div1 = container.createDiv()
const div2 = container.createDiv()

const inputField = mb.createInputFieldFromString("INPUT[text:text]", "INLINE", context.file.path, div1, component, undefined);
const inputField2 = mb.createInputFieldFromString("INPUT[number:number]", "INLINE", context.file.path, div2, component, undefined);
```

# Reactive Components

You can also create reactive components that re-render based on a specific event. In this case we subscribe to obsidians metadata cache.

```js-engine

// define a function that takes in some args and returns what should be rendered
function render(args) {
	return args?.text ?? "undefined";
}

// create a reactive component, passing in the function and arguments for the initial render
const reactive = engine.reactive(render, context.metadata.frontmatter);

// subscribe to events and call refresh with new arguments, which causes the render function to be rerun with these arguments, replacing the existing content
const unloadCb = engine.app.metadataCache.on('changed', async (file, data, cache) => { 
	if (file.path === context.file.path) { 
		reactive.refresh(cache.frontmatter);
	}
}); 

// register the subscription to be unloaded when the code block is unloaded
component.registerEvent(unloadCb);

// return the reactive component
return reactive;
```

# Obsidian Module

```js-engine
const el = container.createEl("button", {text: "Click me"})
el.addEventListener("click", () => {
	new obsidian.Notice("Hello")
});
```