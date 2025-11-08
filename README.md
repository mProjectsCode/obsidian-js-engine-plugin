# Obsidian JS Engine Plugin

This plugin for Obsidian allows you to run JavaScript from within your notes using special code blocks.

## Usage

Start by creating a code block with `js-engine` as the code block language.
Inside the code block you can write what ever JavaScript code that you want.
The plugin will run the JavaScript and render the returned value in place of the code block.

````md
## This is a Note in Obsidian

```js-engine
return engine.markdown.create('*test*');
```
````

### Debugging your Code

Debugging your code blocks can be difficult, but JS Engine aims to make it a bit simpler.
While writing your code blocks, you can use the `js-engine-debug` code block language.
The special language adds a small icon to the top right corner of the code block that lets you easily rerun and view stats about the code block.
Once you are happy with your code block you can switch back to the `js-engine` code block language to get rid of the small icon.
Other than the icon, the two codeblocks behave identically.

## API Docs

Docs are available [here](https://www.moritzjung.dev/obsidian-js-engine-plugin-docs/).

## Examples

### Markdown Builder

```js
let markdownBuilder = engine.markdown.createBuilder();

markdownBuilder.createHeading(2, 'Test Heading');
markdownBuilder.createParagraph('This is a test paragraph.');

markdownBuilder.createHeading(3, 'This is a sub heading');
markdownBuilder.createHeading(4, 'This is a sub sub heading');
markdownBuilder.createParagraph('This is another test paragraph.');

return markdownBuilder;
```

#### Output

> ## Test Heading
>
> This is a test paragraph.
>
> ### This is a sub heading
>
> #### This is a sub sub heading
>
> This is another test paragraph.

### Rendering Strings as Markdown

```js
let str = '*test*';
return str;
```

```js
let str = '*test*';
return engine.markdown.create(str);
```

The top example renders the string as plain text and the second one renders the text as markdown.

#### Output

> \*test\*

> _test_

### Importing JS

```js
let lib = await engine.importJs('lib.js');
return lib.getGreeting();
```

With a file named `lib.js` in the root of the vault.

```js
export function getGreeting() {
	return 'Hello!';
}
```

#### Output

> Hello!
