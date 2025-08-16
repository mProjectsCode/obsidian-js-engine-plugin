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

## Create Obsidian commands for user scripts

Script commands allow you to run **designated scripts** from the command palette.
These commands can also have a hotkey assigned to them in Obsidians Hotkeys settings.

**How to use:** 
- Click the `Add script command` to add a new command settings row
- In the first edit field enter a unique Command ID string
  - Must not contain spaces, use hyphens instead (Eg: `execute-js-file-myscriptname`)
- In the second edit field enter the menu text to display in the command palette (Eg: `Execute new note script`)
  - This will be displayed in the command palette as `JS Engine: Execute new note script`
  - Note the `JS Engine: ` prefix is added by Obsidian itself and can not be removed
- In the third field, a dropdown list, select the script file to execute
  - The list contains all js files found in your entire vault
- The button at the end of the settings row with the trash can icon will delete and remove that rows script command
- The button following the `Add script command` will `reload Obsidian`
  - Obsidian must be reloaded in order to register any new commands and to remove deleted commands
  - It is reccomended to use this button after you are done adding/removing script commands


