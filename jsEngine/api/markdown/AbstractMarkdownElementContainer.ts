import { AbstractMarkdownElement } from './AbstractMarkdownElement';
import { MarkdownElementType } from './MarkdownElementType';
import { AbstractMarkdownLiteral } from './AbstractMarkdownLiteral';

export abstract class AbstractMarkdownElementContainer extends AbstractMarkdownElement {
	markdownElements: AbstractMarkdownElement[];

	constructor() {
		super();

		this.markdownElements = [];
	}

	abstract allowElement(element: AbstractMarkdownElement): boolean;

	public getType(): MarkdownElementType {
		return MarkdownElementType.NON_LITERAL;
	}

	addElement(element: AbstractMarkdownElement): void {
		if (this.allowElement(element)) {
			this.markdownElements.push(element);
		} else {
			throw new Error('Element not allowed in container.');
		}
	}

	addText(text: string): AbstractMarkdownElementContainer {
		const element = new TextElement(text, false, false, false);
		this.addElement(element);
		return this;
	}

	addBoldText(text: string): AbstractMarkdownElementContainer {
		const element = new TextElement(text, true, false, false);
		this.addElement(element);
		return this;
	}

	addCursiveText(text: string): AbstractMarkdownElementContainer {
		const element = new TextElement(text, false, true, false);
		this.addElement(element);
		return this;
	}

	addUnderlinedText(text: string): AbstractMarkdownElementContainer {
		const element = new TextElement(text, false, false, true);
		this.addElement(element);
		return this;
	}

	addCode(text: string): AbstractMarkdownElementContainer {
		const element = new CodeElement(text);
		this.addElement(element);
		return this;
	}

	createParagraph(content: string): ParagraphElement {
		const element = new ParagraphElement(content);
		this.addElement(element);
		return element;
	}

	createHeading(level: number, content: string): HeadingElement {
		const element = new HeadingElement(level, content);
		this.addElement(element);
		return element;
	}

	createBlockQuote(): BlockQuoteElement {
		const element = new BlockQuoteElement();
		this.addElement(element);
		return element;
	}

	createCallout(title: string, type: string, args: string = ''): CalloutElement {
		const element = new CalloutElement(title, type, args);
		this.addElement(element);
		return element;
	}

	createCodeBlock(language: string, content: string): CodeBlockElement {
		const element = new CodeBlockElement(language, content);
		this.addElement(element);
		return element;
	}

	createTable(header: string[], body: string[][]): TableElement {
		const element = new TableElement(header, body);
		this.addElement(element);
		return element;
	}
}

// --------------------------------------------
// LITERALS
// --------------------------------------------

export class TextElement extends AbstractMarkdownLiteral {
	content: string;
	bold: boolean;
	cursive: boolean;
	underline: boolean;

	constructor(content: string, bold: boolean, cursive: boolean, underline: boolean) {
		super();

		this.content = content;
		this.bold = bold;
		this.cursive = cursive;
		this.underline = underline;
	}

	public toString(): string {
		let prefix: string = '';
		let postfix: string = '';

		if (this.underline) {
			prefix += '<b>';
			postfix = '</b>' + postfix;
		}

		if (this.bold) {
			prefix += '**';
			postfix = '**' + postfix;
		}

		if (this.cursive) {
			prefix += '*';
			postfix = '*' + postfix;
		}

		return prefix + this.content + postfix;
	}
}

export class CodeElement extends AbstractMarkdownLiteral {
	content: string;

	constructor(content: string) {
		super();

		this.content = content;
	}

	public toString(): string {
		return `\`${this.content}\``;
	}
}

// --------------------------------------------
// NON LITERALS
// --------------------------------------------

export class HeadingElement extends AbstractMarkdownElementContainer {
	level: number;

	constructor(level: number, content: string) {
		super();

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

export class ParagraphElement extends AbstractMarkdownElementContainer {
	constructor(content: string) {
		super();

		this.addText(content);
	}

	public toString(): string {
		return this.markdownElements.map(x => x.toString()).join('');
	}

	public allowElement(element: AbstractMarkdownElement): boolean {
		return element.getType() === MarkdownElementType.LITERAL;
	}
}

export class CodeBlockElement extends AbstractMarkdownElementContainer {
	language: string;

	constructor(language: string, content: string) {
		super();

		this.language = language;
		this.addText(content);
	}

	public allowElement(element: AbstractMarkdownElement): boolean {
		return element.getType() === MarkdownElementType.LITERAL;
	}

	public toString(): string {
		return `\`\`\`${this.language}\n${this.markdownElements.map(x => x.toString()).join('')}\n\`\`\``;
	}
}

export class BlockQuoteElement extends AbstractMarkdownElementContainer {
	public allowElement(_: AbstractMarkdownElement): boolean {
		return true;
	}

	public toString(): string {
		return `> ` + this.markdownElements.map(x => x.toString().replaceAll('\n', '\n> ')).join('\n> \n> ');
	}
}

export class CalloutElement extends AbstractMarkdownElementContainer {
	title: string;
	type: string;
	args: string;

	constructor(title: string, type: string, args: string) {
		super();

		this.title = title;
		this.type = type;
		this.args = args;
	}

	public allowElement(_: AbstractMarkdownElement): boolean {
		return true;
	}

	public toString(): string {
		return `> [!${this.type}|${this.args}] ${this.title}` + `\n> ` + this.markdownElements.map(x => x.toString().replaceAll('\n', '\n> ')).join('\n> \n> ');
	}
}

export class TableElement extends AbstractMarkdownElementContainer {
	header: string[];
	body: string[][];

	constructor(header: string[], body: string[][]) {
		super();

		this.header = header;
		this.body = body;
	}

	public allowElement(_: AbstractMarkdownElement): boolean {
		return true;
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
