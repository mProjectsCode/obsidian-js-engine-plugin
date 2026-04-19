import type { API } from 'packages/jsEngine/src/api/API';
import type { MarkdownElementType } from 'packages/jsEngine/src/api/markdown/MarkdownElementType';
import { MarkdownString } from 'packages/jsEngine/src/api/markdown/MarkdownString';

export abstract class AbstractMarkdownElement {
	readonly apiInstance: API;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
	}

	/**
	 * Converts the element to a string.
	 */
	abstract toString(): string;

	/**
	 * @internal
	 */
	abstract getType(): MarkdownElementType;

	/**
	 * Converts the element to a {@link MarkdownString}.
	 */
	toMarkdown(): MarkdownString {
		return new MarkdownString(this.apiInstance, this.toString());
	}
}
