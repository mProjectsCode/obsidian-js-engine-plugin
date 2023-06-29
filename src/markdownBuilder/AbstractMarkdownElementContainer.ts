import {AbstractMarkdownElement} from './AbstractMarkdownElement';
import {MarkdownElementType} from './MarkdownElementType';
import {AbstractMarkdownLiteral} from './AbstractMarkdownLiteral';

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
			this.markdownElements.push(element)
		} else {
			throw new Error("Element not allowed in container.");
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
		this.addElement(element)
		return element;
	}

	createHeading(level: number, content: string): HeadingElement {
		const element = new HeadingElement(level, content);
		this.addElement(element)
		return element;
	}

	createBlockQuote(): BlockQuoteElement {
		const element = new BlockQuoteElement();
		this.addElement(element)
		return element;
	}

	createCallout(title: string, type: string, args: string = ''): CalloutElement {
		const element = new CalloutElement(title, type, args);
		this.addElement(element)
		return element;
	}

	createCodeBlock(language: string, content: string): CodeBlockElement {
		const element = new CodeBlockElement(language, content);
		this.addElement(element)
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

	public toMarkdown(): string {
		let prefix: string = '';
		let postfix: string = '';

		if (this.underline) {
			prefix += '<b>'
			postfix = '</b>' + postfix;
		}

		if (this.bold) {
			prefix += '**'
			postfix = '**' + postfix;
		}

		if (this.cursive) {
			prefix += '*'
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

	public toMarkdown(): string {
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

	public toMarkdown(): string {
		return `${'#'.repeat(this.level)} ${this.markdownElements.map(x => x.toMarkdown()).join('')}`;
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

	public toMarkdown(): string {
		return this.markdownElements.map(x => x.toMarkdown()).join('');
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

	public toMarkdown(): string {
		return `\`\`\`${this.language}\n${this.markdownElements.map(x => x.toMarkdown()).join('')}\n\`\`\``;
	}
}

export class BlockQuoteElement extends AbstractMarkdownElementContainer {
	public allowElement(element: AbstractMarkdownElement): boolean {
		return true;
	}

	public toMarkdown(): string {
		return `> ` + this.markdownElements.map(x => x.toMarkdown().replaceAll('\n', '\n> ')).join('\n> \n> ');
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

	public allowElement(element: AbstractMarkdownElement): boolean {
		return true;
	}

	public toMarkdown(): string {
		return `> [!${this.type}|${this.args}] ${this.title}` + `\n> ` + this.markdownElements.map(x => x.toMarkdown().replaceAll('\n', '\n> ')).join('\n> \n> ');
	}
}
