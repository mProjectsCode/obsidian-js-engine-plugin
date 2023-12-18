import { type API } from './API';
import { type EngineExecutionParams } from '../engine/Engine';
import { type JsExecution } from '../engine/JsExecution';
import { type Component, TFile } from 'obsidian';
import { ResultRenderer } from '../engine/ResultRenderer';

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
		return new ResultRenderer(this.apiInstance.plugin, container, sourcePath, component);
	}

	/**
	 * Load and execute the given file.
	 *
	 * @param path
	 * @param params
	 */
	public async executeFile(path: string, params: Omit<EngineExecutionParams, 'code'>): Promise<JsExecution> {
		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File ${path} not found.`);
		}
		const fullParams = params as EngineExecutionParams;
		fullParams.code = await this.apiInstance.app.vault.read(file);
		return await this.execute(fullParams);
	}
}
