import type { API } from 'jsEngine/api/API';
import type { CachedMetadata, TFile } from 'obsidian';
import { getAllTags } from 'obsidian';

export class QueryAPI {
	readonly apiInstance: API;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
	}

	/**
	 * This function will run the `query` callback on every markdown file in the vault and then return a list of the results, with `undefined` filtered out.
	 *
	 * @example
	 * ```typescript
	 * // Find all markdown `TFiles` that start with the word "Foo"
	 * const files = engine.query.files(file => file.name.startsWith("Foo") ? file : undefined);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Find all the names of all markdown files that are in the "Foo" folder
	 * const fileNames = engine.query.files(file => file.path.startsWith("Foo/") ? file.name : undefined);
	 * ```
	 */
	public files<T>(query: (file: TFile) => T | undefined): T[] {
		return this.apiInstance.app.vault
			.getMarkdownFiles()
			.map(file => query(file))
			.filter(x => x !== undefined);
	}

	/**
	 * This function functions similarly tp {@link QueryAPI.files}, but also provides the cache and tags of each file to the `query` callback.
	 *
	 * @example
	 * ```typescript
	 * // Find the paths of all markdown files that have the tag "Foo"
	 * const paths = engine.query.filesWithMetadata((file, cache, tags) => tags.includes("Foo") ? file.path : undefined);
	 * ```
	 */
	public filesWithMetadata<T>(query: (file: TFile, cache: CachedMetadata | null, tags: string[]) => T | undefined): T[] {
		return this.apiInstance.app.vault
			.getMarkdownFiles()
			.map(file => {
				const cache = this.apiInstance.app.metadataCache.getFileCache(file);
				const tags = cache ? (getAllTags(cache) ?? []) : [];
				return query(file, cache, tags);
			})
			.filter(x => x !== undefined);
	}
}
