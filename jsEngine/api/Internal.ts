import type { API } from 'jsEngine/api/API';
import type { EngineExecutionParams } from 'jsEngine/engine/Engine';
import type { JsExecution, JsExecutionContext, JsExecutionGlobals, JsExecutionGlobalsConstructionOptions } from 'jsEngine/engine/JsExecution';
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
	public async executeFile(path: string, params: Omit<EngineExecutionParams, 'code'>): Promise<JsExecution> {
		validateAPIArgs(z.object({ path: z.string(), params: this.apiInstance.validators.engineExecutionParamsNoCode }), { path, params });

		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File ${path} not found.`);
		}
		const fullParams = params as EngineExecutionParams;
		fullParams.code = await this.apiInstance.app.vault.read(file);
		return await this.execute(fullParams);
	}

	/**
	 * Lead and execute the given file.
	 * This method also handles the lifetime of the execution.
	 * The component for the execution is created and destroyed automatically.
	 *
	 * @param path
	 * @param params
	 */
	public async executeFileSimple(path: string, params?: Omit<EngineExecutionParams, 'code' | 'component'>): Promise<JsExecution> {
		validateAPIArgs(z.object({ path: z.string(), params: this.apiInstance.validators.engineExecutionParamsNoCodeAndComponent.optional() }), {
			path,
			params,
		});

		const component = new Component();
		component.load();
		try {
			return await this.executeFile(path, { component: component, ...params });
		} finally {
			component.unload();
		}
	}

	/**
	 * Gets the execution context for a specific file, throws when the file does not exist.
	 *
	 * @param path
	 */
	public async getContextForFile(path: string): Promise<JsExecutionContext> {
		validateAPIArgs(z.object({ path: z.string() }), { path });

		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File ${path} not found.`);
		}

		const metadata = this.apiInstance.app.metadataCache.getFileCache(file);

		return {
			file: file,
			metadata: metadata ?? undefined,
			block: undefined,
		};
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
}
