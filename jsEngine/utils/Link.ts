import type { Parser } from '@lemons_dev/parsinom/lib/Parser';
import { P } from '@lemons_dev/parsinom/lib/ParsiNOM';
import type { App, TFile } from 'obsidian';

export const P_FilePath: Parser<string> = P.manyNotOf('{}[]#^|:?').box('file path');

const P_MDLinkInner: Parser<[string, string | undefined, string | undefined]> = P.sequence(
	P_FilePath, // the file path
	P.string('#').then(P.manyNotOf('[]#|^:')).optional(), // the optional heading
	P.string('|').then(P.manyNotOf('[]')).optional(), // the optional alias
);

const P_MDLink: Parser<MarkdownLink> = P.or(
	// wiki links
	P.sequenceMap(
		(a, b): MarkdownLink => {
			return new MarkdownLink(a !== undefined, b[0], b[1], b[2], true);
		},
		P.string('!').optional(),
		P_MDLinkInner.wrapString('[[', ']]'),
	),
	// standard markdown links
	P.sequenceMap(
		(a, b, c): MarkdownLink => {
			const internal = !isUrl(c);

			return new MarkdownLink(a !== undefined, c, undefined, b, internal);
		},
		P.string('!').optional(),
		P.manyNotOf('[]').wrapString('[', ']'),
		P.manyNotOf('()').wrapString('(', ')'),
	),
);

export function isUrl(str: string): boolean {
	try {
		new URL(str);
		return true;
	} catch (_) {
		return false;
	}
}

export class MarkdownLink {
	isEmbed: boolean;
	target: string;
	block?: string;
	alias?: string;
	internal: boolean;

	constructor(isEmbed: boolean, target: string, block?: string, alias?: string, internal?: boolean) {
		this.isEmbed = isEmbed;
		this.target = target;
		this.block = block;
		this.alias = alias;
		this.internal = internal ?? true;
	}

	static fromUrl(url: URL): MarkdownLink {
		return new MarkdownLink(false, url.href, undefined, url.hostname, false);
	}

	static fromString(str: string): MarkdownLink | undefined {
		return P_MDLink.thenEof().tryParse(str).value;
	}

	fullTarget(): string {
		return this.block ? `${this.target}#${this.block}` : this.target;
	}

	toTFile(app: App, sourcePath: string): TFile | undefined {
		return app.metadataCache.getFirstLinkpathDest(this.target, sourcePath) ?? undefined;
	}
}
