# Obsidian JS Engine Plugin

This plugin for Obsidian allows you to run JavaScript from within your notes using special code blocks.

## Usage

Start by creating a code block with the `js-engine` plugin. Inside the code block you can write any JS code and at the end return a value.
The plugin will then render the returned value instead of the code block. When you return nothing, the plugin will not render anything and the code block will be invisible.

## API Docs

The following variables are available in the code blocks.

| Name      | Type                                            |
| --------- | ----------------------------------------------- |
| app       | `App` (Obsidian)                                |
| engine    | `API` (this plugin)                             |
| context   | `ExecutionContext` (this plugin) or `undefined` |
| component | `Component` (Obsidian)                          |
| container | `HTMLElement`                                   |

Documentation for the API and types that are available inside the code block can be found [here](https://mprojectscode.github.io/obsidian-js-engine-plugin/classes/API.API.html).

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
