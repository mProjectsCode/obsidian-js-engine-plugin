import type { JsEngineApi } from '@lemons_dev/obsidian-js-engine-api';
import type { App, Plugin, TFile } from 'obsidian';
import * as Obsidian from 'obsidian';
import type { InstanceId } from 'packages/jsEngine/src/api/InstanceId';
import { InternalAPI } from 'packages/jsEngine/src/api/Internal';
import { LibAPI } from 'packages/jsEngine/src/api/LibAPI';
import { MarkdownAPI } from 'packages/jsEngine/src/api/MarkdownAPI';
import { MessageAPI } from 'packages/jsEngine/src/api/MessageAPI';
import { PromptAPI } from 'packages/jsEngine/src/api/PromptAPI';
import { QueryAPI } from 'packages/jsEngine/src/api/QueryAPI';
import { ReactiveComponent } from 'packages/jsEngine/src/api/reactive/ReactiveComponent';
import type { JsFunc } from 'packages/jsEngine/src/engine/JsExecution';
import type JsEnginePlugin from 'packages/jsEngine/src/main';
import { MarkdownLink } from 'packages/jsEngine/src/utils/Link';
import type { Validators } from 'packages/jsEngine/src/utils/Validators';
import { validateAPIArgs } from 'packages/jsEngine/src/utils/Validators';
import * as z from 'zod';

export class API implements JsEngineApi {
	/**
	 * Reference to the obsidian app.
	 */
	readonly app: App;
	/**
	 * Reference the JS Engine plugin.
	 */
	readonly plugin: JsEnginePlugin;
	readonly instanceId: InstanceId;
	readonly validators: Validators;
	/**
	 * API to interact with markdown.
	 */
	readonly markdown: MarkdownAPI;
	/**
	 * API to interact with the plugins message system.
	 */
	readonly message: MessageAPI;
	/**
	 * API to interact with packaged libraries.
	 */
	readonly lib: LibAPI;
	/**
	 * API to query your vault with simple javascript functions.
	 */
	readonly query: QueryAPI;
	readonly prompt: PromptAPI;
	/**
	 * API to interact with js engines internals.
	 */
	readonly internal: InternalAPI;

	constructor(app: App, plugin: JsEnginePlugin, instanceId: InstanceId) {
		this.app = app;
		this.plugin = plugin;
		this.instanceId = instanceId;
		this.validators = plugin.validators;

		this.markdown = new MarkdownAPI(this);
		this.message = new MessageAPI(this);
		this.lib = new LibAPI(this);
		this.query = new QueryAPI(this);
		this.prompt = new PromptAPI(this);
		this.internal = new InternalAPI(this);
	}

	/**
	 * Loads an ECMAScript module from a vault relative path.
	 * Everything you import via this function will be loaded as an ECMAScript module.
	 *
	 * Since imports are cached by the browser (aka Obsidian),
	 * you might need to reload Obsidian to see changes made to the imported file.
	 *
	 * @param path the vault relative path of the file to import
	 */
	public async importJs(path: string): Promise<unknown> {
		validateAPIArgs(z.object({ path: z.string() }), { path });

		let fullPath = this.app.vault.adapter.getResourcePath(path);

		// we need to remove the query parameters from the path
		// because other `import {} from '...'` statements don't add them
		// and we would end up with multiple imports of the same file
		// which would cause things like `instanceof` to produce false negatives
		fullPath = fullPath.split('?')[0];

		return import(fullPath);
	}

	/**
	 * Gets a plugin by its id. A plugin id can be found by looking at its manifest.
	 * If the plugin is not enabled, this will return undefined.
	 *
	 * @param pluginId the id of the plugin.
	 */
	public getPlugin(pluginId: string): Plugin | undefined {
		validateAPIArgs(z.object({ pluginId: z.string() }), { pluginId });

		return this.app.plugins.getPlugin(pluginId) ?? undefined;
	}

	/**
	 * Gets the obsidian module.
	 * This allows you to access all things exported by the obsidian module.
	 *
	 * @example
	 * ```js
	 * const obsidian = engine.getObsidianModule();
	 * new obsidian.Notice('Hello World!');
	 * ```
	 */
	public getObsidianModule(): typeof Obsidian {
		return Obsidian;
	}

	/**
	 * Creates a reactive component.
	 * Reactive components are useful for creating dynamic content.
	 *
	 * @param fn the function to rerun. It's return value will be rendered.
	 * @param initialArgs the initial arguments (for the first render) to pass to the function.
	 */
	public reactive(fn: JsFunc, ...initialArgs: unknown[]): ReactiveComponent {
		validateAPIArgs(z.object({ fn: z.function(), initialArgs: z.array(z.unknown()) }), { fn, initialArgs });

		return new ReactiveComponent(this, fn, initialArgs);
	}

	/**
	 * Gets the target file of a link.
	 * This link can be a markdown link or a wiki link.
	 * If the link target is not found, this will return undefined.
	 *
	 * @param link the link to get the target file of.
	 * @param sourcePath the path of the file that contains the link. This is needed to resolve relative links.
	 */
	public resolveLinkToTFile(link: string, sourcePath: string): TFile | undefined {
		validateAPIArgs(z.object({ link: z.string() }), { link });

		const parsedLink = MarkdownLink.fromString(link);

		return parsedLink?.toTFile(this.app, sourcePath);
	}

	/**
	 * Parses a markdown link.
	 * This link can be a markdown link or a wiki link.
	 *
	 * @param link the link to parse.
	 */
	public parseLink(link: string): MarkdownLink | undefined {
		validateAPIArgs(z.object({ link: z.string() }), { link });

		return MarkdownLink.fromString(link);
	}
}
