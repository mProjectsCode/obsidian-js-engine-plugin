import type { API } from 'jsEngine/api/API';
import {
	BlockQuoteElement,
	CalloutElement,
	CodeBlockElement,
	CodeElement,
	HeadingElement,
	ListElement,
	ParagraphElement,
	TableElement,
	TextElement,
} from 'jsEngine/api/markdown/AbstractMarkdownElementContainer';
import { MarkdownBuilder } from 'jsEngine/api/markdown/MarkdownBuilder';
import { MarkdownString } from 'jsEngine/api/markdown/MarkdownString';

/**
 * The markdown API provides utilities for creating markdown using js.
 */
export class MarkdownAPI {
	private readonly apiInstance: API;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
	}

	/**
	 * Creates a markdown builder.
	 */
	public createBuilder(): MarkdownBuilder {
		return new MarkdownBuilder();
	}

	/**
	 * Creates a markdown string form a normal string.
	 * This does not modify the string.
	 * It only wraps it in an object, so that the plugin can recognize and render it as markdown.
	 *
	 * @param markdown the string to wrap
	 */
	public create(markdown: string): MarkdownString {
		return new MarkdownString(markdown);
	}

	/**
	 * Creates a new markdown text element.
	 *
	 * @param text
	 */
	public createText(text: string): TextElement {
		return new TextElement(text, false, false, false);
	}

	/**
	 * Creates a new markdown text element with bold formatting.
	 *
	 * @param text
	 */
	public createBoldText(text: string): TextElement {
		return new TextElement(text, true, false, false);
	}

	/**
	 * Creates a new markdown text element with cursive formatting.
	 *
	 * @param text
	 */
	public createCursiveText(text: string): TextElement {
		return new TextElement(text, false, true, false);
	}

	/**
	 * Creates a new markdown text element with underline formatting.
	 *
	 * @param text
	 */
	public createUnderlinedText(text: string): TextElement {
		return new TextElement(text, false, false, true);
	}

	/**
	 * Creates a new markdown code element.
	 *
	 * @param text
	 */
	public createCode(text: string): CodeElement {
		return new CodeElement(text);
	}

	/**
	 * Creates a new markdown paragraph element.
	 *
	 * @param content
	 */
	public createParagraph(content: string): ParagraphElement {
		return new ParagraphElement(content);
	}

	/**
	 * Creates a new markdown heading element.
	 *
	 * @param level the level of the heading from 1 to 6
	 * @param content the text of the heading
	 */
	public createHeading(level: number, content: string): HeadingElement {
		return new HeadingElement(level, content);
	}

	/**
	 * Creates a new markdown block quote element.
	 */
	public createBlockQuote(): BlockQuoteElement {
		return new BlockQuoteElement();
	}

	/**
	 * Creates a new markdown callout element.
	 *
	 * @param title the title of the callout
	 * @param type the type of the callout
	 * @param args the callout args, optional
	 */
	public createCallout(title: string, type: string, args: string = ''): CalloutElement {
		return new CalloutElement(title, type, args);
	}

	/**
	 * Creates a new markdown code block element.
	 *
	 * @param language the language of the code block
	 * @param content the content of the code block
	 */
	public createCodeBlock(language: string, content: string): CodeBlockElement {
		return new CodeBlockElement(language, content);
	}

	/**
	 * Creates a new markdown table element.
	 *
	 * @param header the header row
	 * @param body the table body
	 */
	public createTable(header: string[], body: string[][]): TableElement {
		return new TableElement(header, body);
	}

	/**
	 * Creates a new markdown list element.
	 *
	 * @param ordered whether the list should be ordered or not (use 1. or -)
	 */
	createList(ordered: boolean): ListElement {
		return new ListElement(ordered);
	}
}
