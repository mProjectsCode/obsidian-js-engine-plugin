import type { InstanceId } from 'jsEngine/api/InstanceId';
import { InternalAPI } from 'jsEngine/api/Internal';
import { LibAPI } from 'jsEngine/api/LibAPI';
import { MarkdownAPI } from 'jsEngine/api/MarkdownAPI';
import { MessageAPI } from 'jsEngine/api/MessageAPI';
import { PromptAPI } from 'jsEngine/api/PromptAPI';
import { QueryAPI } from 'jsEngine/api/QueryAPI';
import { ReactiveComponent } from 'jsEngine/api/reactive/ReactiveComponent';
import type { JsFunc } from 'jsEngine/engine/JsExecution';
import type JsEnginePlugin from 'jsEngine/main';
import { MarkdownLink } from 'jsEngine/utils/Link';
import type { Validators } from 'jsEngine/utils/Validators';
import { validateAPIArgs } from 'jsEngine/utils/Validators';
import type { App, Plugin, TFile } from 'obsidian';
import * as Obsidian from 'obsidian';
import { z } from 'zod';

export class API {
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
	 * @param hotReload whether to reload the imported module (may cause memory shortage if abused)
	 */
	public async importJs(path: string, hotReload = false): Promise<unknown> {
		validateAPIArgs(z.object({ path: z.string() }), { path });

		let fullPath = this.app.vault.adapter.getResourcePath(path);

		// we need to remove the query parameters from the path
		// because other `import {} from '...'` statements don't add them
		// and we would end up with multiple imports of the same file
		// which would cause things like `instanceof` to produce false negatives
		fullPath = fullPath.split('?')[0];

		if (hotReload) {
			// Trick from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
			fullPath += `?t=${Date.now()}`;
		}

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
