import type { API } from 'jsEngine/api/API';
import type { EngineExecutionParams } from 'jsEngine/engine/Engine';
import type {
	JsExecution,
	ExecutionContext,
	JsExecutionGlobals,
	JsExecutionGlobalsConstructionOptions,
	CodeBlockExecutionContext,
	JSFileExecutionContext,
	UnknownExecutionContext,
} from 'jsEngine/engine/JsExecution';
import { ExecutionSource } from 'jsEngine/engine/JsExecution';
import { ResultRenderer } from 'jsEngine/engine/ResultRenderer';
import { validateAPIArgs } from 'jsEngine/utils/Validators';
import { Component, TFile } from 'obsidian';
import * as Obsidian from 'obsidian';
import { z } from 'zod';

/**
 * The internal API provides access to some of js engines internals.
 */
export class InternalAPI {
	private readonly apiInstance: API;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
	}

	/**
	 * Executes the given code.
	 *
	 * @param params
	 */
	public async execute(params: EngineExecutionParams): Promise<JsExecution> {
		validateAPIArgs(z.object({ params: this.apiInstance.validators.engineExecutionParams }), { params });

		return await this.apiInstance.plugin.jsEngine.execute(params);
	}

	/**
	 * Creates a result renderer.
	 *
	 * @param container
	 * @param sourcePath
	 * @param component
	 */
	public createRenderer(container: HTMLElement, sourcePath: string, component: Component): ResultRenderer {
		validateAPIArgs(
			z.object({ container: this.apiInstance.validators.htmlElement, sourcePath: z.string(), component: this.apiInstance.validators.component }),
			{ container, sourcePath, component },
		);

		return new ResultRenderer(this.apiInstance.plugin, container, sourcePath, component);
	}

	/**
	 * Load and execute the given file.
	 *
	 * @param path
	 * @param params
	 */
	public async executeFile(path: string, params: Omit<EngineExecutionParams, 'code' | 'context'>): Promise<JsExecution> {
		validateAPIArgs(z.object({ path: z.string(), params: this.apiInstance.validators.engineExecutionParamsFile }), { path, params });

		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File ${path} not found.`);
		}
		return await this.execute({
			...params,
			code: await this.apiInstance.app.vault.read(file),
			context: {
				executionSource: ExecutionSource.JSFile,
				file: file,
			},
		});
	}

	/**
	 * Lead and execute the given file.
	 * This method also handles the lifetime of the execution.
	 * The component for the execution is created and destroyed automatically.
	 *
	 * @param path
	 * @param params
	 */
	public async executeFileSimple(path: string, params?: Omit<EngineExecutionParams, 'code' | 'component' | 'context'>): Promise<JsExecution> {
		validateAPIArgs(z.object({ path: z.string(), params: this.apiInstance.validators.engineExecutionParamsFileSimple.optional() }), {
			path,
			params,
		});

		const component = new Component();
		component.load();
		try {
			return await this.executeFile(path, {
				component: component,
				...params,
			});
		} finally {
			component.unload();
		}
	}

	/**
	 * Gets the execution context for a specific file, throws when the file does not exist.
	 *
	 * @param path
	 * @deprecated use {@link getContextForMarkdownCodeBlock}, {@link getContextForJSFile}, or {@link getContextForUnknown} instead
	 */
	public async getContextForFile(path: string): Promise<ExecutionContext> {
		validateAPIArgs(z.object({ path: z.string() }), { path });

		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File ${path} not found.`);
		}

		const metadata = this.apiInstance.app.metadataCache.getFileCache(file);

		return {
			executionSource: ExecutionSource.MarkdownCodeBlock,
			file: file,
			metadata: metadata ?? undefined,
			block: undefined,
		};
	}

	/**
	 * Gets the execution context for a markdown code block.
	 *
	 * @param path The file path of the markdown file the code block is in.
	 * @returns
	 */
	public async getContextForMarkdownCodeBlock(path: string): Promise<CodeBlockExecutionContext> {
		validateAPIArgs(z.object({ path: z.string() }), { path });

		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File ${path} not found.`);
		}
		if (file.extension !== 'md' && file.extension !== '.md') {
			throw new Error(`File ${path} is not a markdown file. Expected file extension to be ".md".`);
		}

		const metadata = this.apiInstance.app.metadataCache.getFileCache(file);

		return {
			executionSource: ExecutionSource.MarkdownCodeBlock,
			file: file,
			metadata: metadata ?? undefined,
			block: undefined,
		};
	}

	/**
	 * Gets the execution context for a JS file.
	 *
	 * @param path The file path of the JS file.
	 * @returns
	 */
	public async getContextForJSFile(path: string): Promise<JSFileExecutionContext> {
		validateAPIArgs(z.object({ path: z.string() }), { path });

		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File ${path} not found.`);
		}
		if (file.extension !== 'js' && file.extension !== '.js') {
			throw new Error(`File ${path} is not a JS file. Expected file extension to be ".js".`);
		}

		return {
			executionSource: ExecutionSource.JSFile,
			file: file,
		};
	}

	/**
	 * Gets an unknown execution context for anything that is not a markdown code block or a JS file.
	 *
	 * @param path An optional file path that will get resolved to a {@link TFile}.
	 * @returns
	 */
	public async getContextForUnknown(path?: string): Promise<UnknownExecutionContext> {
		validateAPIArgs(z.object({ path: z.string().optional() }), { path });

		if (path) {
			const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
			if (!file || !(file instanceof TFile)) {
				throw new Error(`File ${path} not found.`);
			}

			return {
				executionSource: ExecutionSource.Unknown,
				file: file,
			};
		} else {
			return {
				executionSource: ExecutionSource.Unknown,
			};
		}
	}

	/**
	 * Creates execution globals.
	 *
	 * @param options
	 */
	public createExecutionGlobals(options: JsExecutionGlobalsConstructionOptions): JsExecutionGlobals {
		validateAPIArgs(z.object({ options: this.apiInstance.validators.jsExecutionGlobalsConstructionOptions }), { options });

		return {
			app: this.apiInstance.app,
			engine: options.engine ?? this.apiInstance,
			component: options.component,
			context: options.context,
			container: options.container,
			obsidian: Obsidian,
		};
	}

	/**
	 * Runs all startup scripts defined in the plugins settings.
	 */
	public async executeStartupScripts(): Promise<void> {
		for (const script of this.apiInstance.plugin.settings.startupScripts ?? []) {
			await this.executeFileSimple(script);
		}
	}
}
