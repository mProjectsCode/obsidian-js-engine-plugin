import type { API } from 'jsEngine/api/API';
import { validateAPIArgs } from 'jsEngine/utils/Validators';
import type { CachedMetadata, TFile } from 'obsidian';
import { getAllTags } from 'obsidian';
import { z } from 'zod';

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
		validateAPIArgs(z.object({ query: z.function().args(this.apiInstance.validators.tFile).returns(z.unknown()) }), { query });

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
	public filesWithMetadata<T>(query: (file: TFile, cache: CachedMetadata | undefined, tags: string[], frontmatterTags: string[]) => T | undefined): T[] {
		validateAPIArgs(
			z.object({
				query: z
					.function()
					.args(this.apiInstance.validators.tFile, this.apiInstance.validators.cachedMetadata.optional(), z.string().array(), z.string().array())
					.returns(z.unknown()),
			}),
			{ query },
		);

		return this.apiInstance.app.vault
			.getMarkdownFiles()
			.map(file => {
				const cache = this.apiInstance.app.metadataCache.getFileCache(file);
				const tags = cache ? (getAllTags(cache) ?? []) : [];
				const frontmatterTags = (cache?.frontmatter?.tags as string[] | undefined) ?? [];
				return query(file, cache ?? undefined, tags, frontmatterTags);
			})
			.filter(x => x !== undefined);
	}

	public outgoingLinks(file: TFile): { file: TFile; cache: CachedMetadata | undefined; tags: string[]; frontmatterTags: string[] }[] {
		validateAPIArgs(z.object({ file: this.apiInstance.validators.tFile }), { file });

		const metadata = this.apiInstance.app.metadataCache.getFileCache(file);
		if (!metadata) {
			return [];
		}

		const links = metadata.links ?? [];
		const files = links.map(link => this.apiInstance.app.metadataCache.getFirstLinkpathDest(link.link, file.path)).filter(file => file != null);
		const uniqueFiles = Array.from(new Set(files));

		return uniqueFiles.map(file => {
			const metadata = this.apiInstance.app.metadataCache.getFileCache(file);
			return {
				file: file,
				cache: metadata ?? undefined,
				tags: metadata ? (getAllTags(metadata) ?? []) : [],
				frontmatterTags: (metadata?.frontmatter?.tags as string[] | undefined) ?? [],
			};
		});
	}

	public incomingLinks(file: TFile): { file: TFile; cache: CachedMetadata | undefined; tags: string[]; frontmatterTags: string[] }[] {
		validateAPIArgs(z.object({ file: this.apiInstance.validators.tFile }), { file });

		const files = this.apiInstance.app.vault.getMarkdownFiles();

		return files
			.map(file => {
				const metadata = this.apiInstance.app.metadataCache.getFileCache(file);
				if (!metadata) {
					return undefined;
				}

				const links = metadata.links ?? [];

				if (
					links.some(link => {
						const linkFile = this.apiInstance.app.metadataCache.getFirstLinkpathDest(link.link, file.path);
						return linkFile?.path === file.path;
					})
				) {
					return {
						file: file,
						cache: metadata,
						tags: getAllTags(metadata) ?? [],
						frontmatterTags: (metadata?.frontmatter?.tags as string[] | undefined) ?? [],
					};
				}

				return undefined;
			})
			.filter(x => x !== undefined);
	}
}
