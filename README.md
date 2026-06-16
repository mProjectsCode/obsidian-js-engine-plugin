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

## Plugin Integration

Other plugins can access JS Engine through the loaded `js-engine` plugin instance. For TypeScript integrations, install the API helper package:

```sh
bun add -d https://github.com/mProjectsCode/obsidian-js-engine-plugin/releases/latest/download/obsidian-js-engine-api.tgz
```

```ts
import { getJsEngineInternalApi } from '@lemons_dev/obsidian-js-engine-api';

const jsEngine = getJsEngineInternalApi(this.app);

await jsEngine?.executeFileSimple('Scripts/example.js');
```

The API package describes the cross-plugin integration surface: plugin lookup helpers, `api.internal`, execution context types, execution result types, and the result renderer contract. Each plugin release attaches the current API package tarball as `obsidian-js-engine-api.tgz` alongside the Obsidian plugin files.

## Examples

### Markdown Builder

```js
let markdownBuilder = engine.markdown.createBuilder();

markdownBuilder.createHeading(1, 'Test Heading lvl 1');
markdownBuilder.createHeading(2, 'Test Heading lvl 2');
markdownBuilder.createHeading(3, 'Test Heading lvl 3');
markdownBuilder.createHeading(4, 'Test Heading lvl 4');
markdownBuilder.createHeading(5, 'Test Heading lvl 5');
markdownBuilder.createHeading(6, 'Test Heading lvl 6');
markdownBuilder.createParagraph('This is a test paragraph.');
markdownBuilder.createParagraph('This is another test paragraph.');

return markdownBuilder;
```

#### Output

> # Test Heading lvl 1
> ## Test Heading lvl 2
> ### Test Heading lvl 3
> #### Test Heading lvl 4
> ##### Test Heading lvl 5
> ###### Test Heading lvl 6
> This is a test paragraph.
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

## Development

This repo includes `packages/js-engine-api` as the installable API helper package source. After cloning, initialize dependencies with:

```sh
bun run deps:init
```

When the public integration API changes, edit the package source, run `bun run api:build`, and release the plugin. The release workflow attaches the API package tarball alongside the Obsidian plugin files.
