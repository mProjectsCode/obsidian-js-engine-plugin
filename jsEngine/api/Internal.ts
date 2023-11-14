import { type API } from './API';
import { type EngineExecutionParams } from '../engine/Engine';
import { type JsExecution } from '../engine/JsExecution';
import { type Component } from 'obsidian';
import { ResultRenderer } from '../ResultRenderer';

/**
 * The internal API provides access to some of js engines internals.
 */
export class InternalAPI {
	private readonly apiInstance: API;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
	}

	public async excute(params: EngineExecutionParams): Promise<JsExecution> {
		return await this.apiInstance.plugin.jsEngine.execute(params);
	}

	public createRenderer(container: HTMLElement, sourcePath: string, component: Component): ResultRenderer {
		return new ResultRenderer(this.apiInstance.plugin, container, sourcePath, component);
	}
}
