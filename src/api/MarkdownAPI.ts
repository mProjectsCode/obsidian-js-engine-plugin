import {App} from 'obsidian';
import {MarkdownBuilder} from './markdown/MarkdownBuilder';
import JsEnginePlugin from '../main';
import {MarkdownString} from './markdown/MarkdownString';
import {
	BlockQuoteElement,
	CalloutElement,
	CodeBlockElement,
	CodeElement,
	HeadingElement,
	ParagraphElement,
	TableElement,
	TextElement,
} from './markdown/AbstractMarkdownElementContainer';



export class MarkdownAPI {
	readonly app: App;
	readonly plugin: JsEnginePlugin;


	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;
	}

	createBuilder(): MarkdownBuilder {
		return new MarkdownBuilder();
	}

	create(markdown: string): MarkdownString {
		return new MarkdownString(markdown);
	}

	createText(text: string): TextElement {
		return new TextElement(text, false, false, false);
	}

	createBoldText(text: string): TextElement {
		return new TextElement(text, true, false, false);
	}

	createCursiveText(text: string): TextElement {
		return new TextElement(text, false, true, false);
	}

	createUnderlinedText(text: string): TextElement {
		return new TextElement(text, false, false, true);
	}

	createCode(text: string): CodeElement {
		return new CodeElement(text);
	}

	createParagraph(content: string): ParagraphElement {
		return new ParagraphElement(content);
	}

	createHeading(level: number, content: string): HeadingElement {
		return new HeadingElement(level, content);
	}

	createBlockQuote(): BlockQuoteElement {
		return new BlockQuoteElement();
	}

	createCallout(title: string, type: string, args: string = ''): CalloutElement {
		return new CalloutElement(title, type, args);
	}

	createCodeBlock(language: string, content: string): CodeBlockElement {
		return new CodeBlockElement(language, content);
	}

	createTable(header: string[], body: string[][]): TableElement {
		return new TableElement(header, body);
	}
}
