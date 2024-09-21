import type { API } from 'jsEngine/api/API';
import { AbstractMarkdownElement } from 'jsEngine/api/markdown/AbstractMarkdownElement';
import { AbstractMarkdownLiteral } from 'jsEngine/api/markdown/AbstractMarkdownLiteral';
import { MarkdownElementType } from 'jsEngine/api/markdown/MarkdownElementType';
import { validateAPIArgs } from 'jsEngine/utils/Validators';
import { z } from 'zod';

/**
 * @internal
 */
export abstract class AbstractMarkdownElementContainer extends AbstractMarkdownElement {
	markdownElements: AbstractMarkdownElement[];

	constructor(apiInstance: API) {
		super(apiInstance);

		this.markdownElements = [];
	}

	/**
	 * @internal
	 */
	abstract allowElement(element: AbstractMarkdownElement): boolean;

	public getType(): MarkdownElementType {
		return MarkdownElementType.NON_LITERAL;
	}

	/**
	 * Adds a child element to the container.
	 *
	 * @param element
	 * @throws Error if the element is not allowed in the container.
	 */
	addElement(element: AbstractMarkdownElement): void {
		validateAPIArgs(z.object({ element: this.apiInstance.validators.abstractMarkdownElement }), { element });

		if (this.allowElement(element)) {
			this.markdownElements.push(element);
		} else {
			throw new Error('Element not allowed in container.');
		}
	}

	addText(text: string): AbstractMarkdownElementContainer {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		const element = new TextElement(this.apiInstance, text, false, false, false, false);
		this.addElement(element);
		return this;
	}

	addBoldText(text: string): AbstractMarkdownElementContainer {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		const element = new TextElement(this.apiInstance, text, true, false, false, false);
		this.addElement(element);
		return this;
	}

	addCursiveText(text: string): AbstractMarkdownElementContainer {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		const element = new TextElement(this.apiInstance, text, false, true, false, false);
		this.addElement(element);
		return this;
	}

	addUnderlinedText(text: string): AbstractMarkdownElementContainer {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		const element = new TextElement(this.apiInstance, text, false, false, true, false);
		this.addElement(element);
		return this;
	}

	addHighlightedText(text: string): AbstractMarkdownElementContainer {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		const element = new TextElement(this.apiInstance, text, false, false, false, true);
		this.addElement(element);
		return this;
	}

	addCode(text: string): AbstractMarkdownElementContainer {
		validateAPIArgs(z.object({ text: z.string() }), { text });

		const element = new CodeElement(this.apiInstance, text);
		this.addElement(element);
		return this;
	}

	createParagraph(content: string): ParagraphElement {
		validateAPIArgs(z.object({ content: z.string() }), { content });

		const element = new ParagraphElement(this.apiInstance, content);
		this.addElement(element);
		return element;
	}

	createHeading(level: number, content: string): HeadingElement {
		validateAPIArgs(z.object({ level: z.number(), content: z.string() }), { level, content });

		const element = new HeadingElement(this.apiInstance, level, content);
		this.addElement(element);
		return element;
	}

	createBlockQuote(): BlockQuoteElement {
		const element = new BlockQuoteElement(this.apiInstance);
		this.addElement(element);
		return element;
	}

	createCallout(title: string, type: string, args: string = ''): CalloutElement {
		validateAPIArgs(z.object({ title: z.string(), type: z.string(), args: z.string() }), { title, type, args });

		const element = new CalloutElement(this.apiInstance, title, type, args, false, false);
		this.addElement(element);
		return element;
	}

	createCollapsibleCallout(title: string, type: string, args: string = '', collapsed: boolean = false): CalloutElement {
		validateAPIArgs(z.object({ title: z.string(), type: z.string(), args: z.string(), collapsed: z.boolean() }), { title, type, args, collapsed });

		const element = new CalloutElement(this.apiInstance, title, type, args, true, collapsed);
		this.addElement(element);
		return element;
	}

	createCodeBlock(language: string, content: string): CodeBlockElement {
		validateAPIArgs(z.object({ language: z.string(), content: z.string() }), { language, content });

		const element = new CodeBlockElement(this.apiInstance, language, content);
		this.addElement(element);
		return element;
	}

	createTable(header: string[], body: string[][]): TableElement {
		validateAPIArgs(z.object({ header: z.array(z.string()), body: z.array(z.array(z.string())) }), { header, body });

		const element = new TableElement(this.apiInstance, header, body);
		this.addElement(element);
		return element;
	}

	createList(ordered: boolean = false): ListElement {
		validateAPIArgs(z.object({ ordered: z.boolean() }), { ordered });

		const element = new ListElement(this.apiInstance, ordered);
		this.addElement(element);
		return element;
	}

	createOrderedList(): ListElement {
		const element = new ListElement(this.apiInstance, true);
		this.addElement(element);
		return element;
	}
}

// --------------------------------------------
// LITERALS
// --------------------------------------------

/**
 * Represents a piece of pure markdown text.
 */
export class TextElement extends AbstractMarkdownLiteral {
	content: string;
	bold: boolean;
	cursive: boolean;
	underline: boolean;
	highlight: boolean;

	constructor(apiInstance: API, content: string, bold: boolean, cursive: boolean, underline: boolean, highlight: boolean) {
		super(apiInstance);

		this.content = content;
		this.bold = bold;
		this.cursive = cursive;
		this.underline = underline;
		this.highlight = highlight;
	}

	public toString(): string {
		let prefix: string = '';
		let postfix: string = '';

		if (this.underline) {
			prefix += '<u>';
			postfix = '</u>' + postfix;
		}

		if (this.bold) {
			prefix += '**';
			postfix = '**' + postfix;
		}

		if (this.cursive) {
			prefix += '*';
			postfix = '*' + postfix;
		}

		if (this.highlight) {
			prefix += '==';
			postfix = '==' + postfix;
		}

		return prefix + this.content + postfix;
	}
}

/**
 * Represents an inline markdown code block.
 */
export class CodeElement extends AbstractMarkdownLiteral {
	content: string;

	constructor(apiInstance: API, content: string) {
		super(apiInstance);

		this.content = content;
	}

	public toString(): string {
		return `\`${this.content}\``;
	}
}

/**
 * Represents a markdown table.
 */
export class TableElement extends AbstractMarkdownLiteral {
	header: string[];
	body: string[][];

	constructor(apiInstance: API, header: string[], body: string[][]) {
		super(apiInstance);

		this.header = header;
		this.body = body;
	}

	public toString(): string {
		const rows = this.body.length;
		if (rows === 0) {
			return '';
		}

		const columns = this.header.length;
		if (columns === 0) {
			return '';
		}
		for (const row of this.body) {
			if (row.length !== columns) {
				throw new Error('Table rows are do not contain the same number of columns.');
			}
		}

		const longestStringInColumns: number[] = [];

		for (let i = 0; i < columns; i++) {
			let longestStringInColumn = 0;

			if (this.header[i].length > longestStringInColumn) {
				longestStringInColumn = this.header[i].length;
			}
			for (const row of this.body) {
				if (row[i].length > longestStringInColumn) {
					longestStringInColumn = row[i].length;
				}
			}

			longestStringInColumns.push(longestStringInColumn);
		}

		let table = '';

		// build header
		table += '|';
		for (let j = 0; j < columns; j++) {
			let element = this.header[j];
			element += ' '.repeat(longestStringInColumns[j] - element.length);
			table += ' ' + element + ' |';
		}
		table += '\n';
		// build divider
		table += '|';
		for (let j = 0; j < columns; j++) {
			table += ' ' + '-'.repeat(longestStringInColumns[j]) + ' |';
		}
		table += '\n';

		// build body
		for (let i = 0; i < rows; i++) {
			table += '|';
			for (let j = 0; j < columns; j++) {
				let element = this.body[i][j];
				element += ' '.repeat(longestStringInColumns[j] - element.length);
				table += ' ' + element + ' |';
			}
			table += '\n';
		}

		return table;
	}
}

// --------------------------------------------
// NON LITERALS
// --------------------------------------------

/**
 * Represents a markdown heading.
 */
export class HeadingElement extends AbstractMarkdownElementContainer {
	level: number;

	constructor(apiInstance: API, level: number, content: string) {
		super(apiInstance);

		this.level = level;
		this.addText(content);
	}

	public toString(): string {
		return `${'#'.repeat(this.level)} ${this.markdownElements.map(x => x.toString()).join('')}`;
	}

	public allowElement(element: AbstractMarkdownElement): boolean {
		return element.getType() === MarkdownElementType.LITERAL;
	}
}

/**
 * Represents a markdown paragraph.
 */
export class ParagraphElement extends AbstractMarkdownElementContainer {
	constructor(apiInstance: API, content: string) {
		super(apiInstance);

		this.addText(content);
	}

	public toString(): string {
		return this.markdownElements.map(x => x.toString()).join('');
	}

	public allowElement(element: AbstractMarkdownElement): boolean {
		return element.getType() === MarkdownElementType.LITERAL;
	}
}

/**
 * Represents a markdown code block.
 */
export class CodeBlockElement extends AbstractMarkdownElementContainer {
	language: string;

	constructor(apiInstance: API, language: string, content: string) {
		super(apiInstance);

		this.language = language;
		this.addText(content);
	}

	public toString(): string {
		return `\`\`\`${this.language}\n${this.markdownElements.map(x => x.toString()).join('')}\n\`\`\``;
	}

	public allowElement(element: AbstractMarkdownElement): boolean {
		return element.getType() === MarkdownElementType.LITERAL;
	}
}

/**
 * Represents a markdown block quote.
 */
export class BlockQuoteElement extends AbstractMarkdownElementContainer {
	public toString(): string {
		return `> ` + this.markdownElements.map(x => x.toString().replaceAll('\n', '\n> ')).join('\n> \n> ');
	}

	public allowElement(_: AbstractMarkdownElement): boolean {
		return true;
	}
}

/**
 * Represents a markdown callout.
 */
export class CalloutElement extends AbstractMarkdownElementContainer {
	title: string;
	type: string;
	args: string;
	collapsible: boolean;
	collapsed: boolean;

	constructor(apiInstance: API, title: string, type: string, args: string, collapsible: boolean = false, collapsed: boolean = false) {
		super(apiInstance);

		this.title = title;
		this.type = type;
		this.args = args;
		this.collapsible = collapsible;
		this.collapsed = collapsed;
	}

	public toString(): string {
		return (
			`> [!${this.type}|${this.args}]${this.collapseChar()} ${this.title}` +
			`\n> ` +
			this.markdownElements.map(x => x.toString().replaceAll('\n', '\n> ')).join('\n> \n> ')
		);
	}

	private collapseChar(): string {
		if (this.collapsible) {
			return this.collapsed ? '-' : '+';
		} else {
			return '';
		}
	}

	public allowElement(_: AbstractMarkdownElement): boolean {
		return true;
	}
}

export class ListElement extends AbstractMarkdownElementContainer {
	ordered: boolean;

	constructor(apiInstance: API, ordered: boolean) {
		super(apiInstance);

		this.ordered = ordered;
	}

	private getPrefix(i: number): string {
		if (this.ordered) {
			return `${i + 1}. `;
		} else {
			return `- `;
		}
	}

	public toString(): string {
		return this.markdownElements
			.map((x, i) => {
				if (x instanceof ListElement) {
					return `\t${x.toString().replaceAll('\n', '\n\t')}`;
				}

				return `${this.getPrefix(i)}${x.toString().replaceAll('\n', '\n\t')}`;
			})
			.join('\n');
	}

	public allowElement(_: AbstractMarkdownElement): boolean {
		return true;
	}
}
