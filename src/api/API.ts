import {MarkdownBuilder} from '../markdownBuilder/MarkdownBuilder';

export class API {
	createMarkdownBuilder(): MarkdownBuilder {
		return new MarkdownBuilder();
	}
}
