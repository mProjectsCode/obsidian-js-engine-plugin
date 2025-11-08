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
import { validateAPIArgs } from 'jsEngine/utils/Validators';
import * as z from 'zod';

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
		return new MarkdownBuilder(this.apiInstance);
	}

	/**
	 * Creates a markdown string form a normal string.
	 * This does not modify the string.
	 * It only wraps it in an object, so that the plugin can recognize and render it as markdown.
	 *
	 * @param markdown the string to wrap
	 */
	public create(markdown: string): MarkdownString {
		validateAPIArgs(z.object({ markdown: z.string() }), { markdown });

		return new MarkdownString(this.apiInstance, markdown);
	}

	/**
	 * Creates a new markdown text element.
	 *
	 * @param text
	 */
	public createText(text: string): TextElement {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		return new TextElement(this.apiInstance, text, false, false, false, false);
	}

	/**
	 * Creates a new markdown text element with bold formatting.
	 *
	 * @param text
	 */
	public createBoldText(text: string): TextElement {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		return new TextElement(this.apiInstance, text, true, false, false, false);
	}

	/**
	 * Creates a new markdown text element with cursive formatting.
	 *
	 * @param text
	 */
	public createCursiveText(text: string): TextElement {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		return new TextElement(this.apiInstance, text, false, true, false, false);
	}

	/**
	 * Creates a new markdown text element with underline formatting.
	 *
	 * @param text
	 */
	public createUnderlinedText(text: string): TextElement {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		return new TextElement(this.apiInstance, text, false, false, true, false);
	}

	/**
	 * Creates a new markdown text element with highlighted formatting.
	 *
	 * @param text
	 */
	public createHighlightedText(text: string): TextElement {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		return new TextElement(this.apiInstance, text, false, false, false, true);
	}

	/**
	 * Creates a new markdown code element.
	 *
	 * @param text
	 */
	public createCode(text: string): CodeElement {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		return new CodeElement(this.apiInstance, text);
	}

	/**
	 * Creates a new markdown paragraph element.
	 *
	 * @param content
	 */
	public createParagraph(content: string): ParagraphElement {
		validateAPIArgs(z.object({ content: z.string() }), { content });

		return new ParagraphElement(this.apiInstance, content);
	}

	/**
	 * Creates a new markdown heading element.
	 *
	 * @param level the level of the heading from 1 to 6
	 * @param content the text of the heading
	 */
	public createHeading(level: number, content: string): HeadingElement {
		validateAPIArgs(z.object({ level: z.number(), content: z.string() }), { level, content });

		return new HeadingElement(this.apiInstance, level, content);
	}

	/**
	 * Creates a new markdown block quote element.
	 */
	public createBlockQuote(): BlockQuoteElement {
		return new BlockQuoteElement(this.apiInstance);
	}

	/**
	 * Creates a new markdown callout element.
	 *
	 * @param title the title of the callout
	 * @param type the type of the callout
	 * @param args the callout args, optional
	 */
	public createCallout(title: string, type: string, args: string = ''): CalloutElement {
		validateAPIArgs(z.object({ title: z.string(), type: z.string(), args: z.string() }), { title, type, args });

		return new CalloutElement(this.apiInstance, title, type, args);
	}

	/**
	 * Creates a new markdown collapsible callout element.
	 *
	 * @param title the title of the callout
	 * @param type the type of the callout
	 * @param args the callout args, optional
	 * @param collapsed whether the callout should be collapsed by default, optional
	 */
	public createCollapsibleCallout(title: string, type: string, args: string = '', collapsed: boolean = false): CalloutElement {
		validateAPIArgs(z.object({ title: z.string(), type: z.string(), args: z.string(), collapsed: z.boolean() }), { title, type, args, collapsed });

		return new CalloutElement(this.apiInstance, title, type, args, true, collapsed);
	}

	/**
	 * Creates a new markdown code block element.
	 *
	 * @param language the language of the code block
	 * @param content the content of the code block
	 */
	public createCodeBlock(language: string, content: string): CodeBlockElement {
		validateAPIArgs(z.object({ language: z.string(), content: z.string() }), { language, content });

		return new CodeBlockElement(this.apiInstance, language, content);
	}

	/**
	 * Creates a new markdown table element.
	 *
	 * @param header the header row
	 * @param body the table body
	 */
	public createTable(header: string[], body: string[][]): TableElement {
		validateAPIArgs(z.object({ header: z.array(z.string()), body: this.apiInstance.validators.tableElementBody }), { header, body });

		return new TableElement(this.apiInstance, header, body);
	}

	/**
	 * Creates a new markdown list element.
	 *
	 * @param ordered whether the list should be ordered or not (use 1. or -), defaults to unordered
	 */
	public createList(ordered: boolean = false): ListElement {
		validateAPIArgs(z.object({ ordered: z.boolean() }), { ordered });

		return new ListElement(this.apiInstance, ordered);
	}

	/**
	 * Creates a new ordered markdown list element.
	 */
	public createOrderedList(): ListElement {
		return new ListElement(this.apiInstance, true);
	}
}
