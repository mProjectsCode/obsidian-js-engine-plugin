import type { JsEngineInternalApi } from '@lemons_dev/obsidian-js-engine-api';
import { Component, TFile } from 'obsidian';
import * as Obsidian from 'obsidian';
import type { API } from 'packages/jsEngine/src/api/API';
import type { EngineExecutionParams } from 'packages/jsEngine/src/engine/Engine';
import type {
	JsExecution,
	ExecutionContext,
	JsExecutionGlobals,
	JsExecutionGlobalsConstructionOptions,
	MarkdownCodeBlockExecutionContext,
	JSFileExecutionContext,
	UnknownExecutionContext,
	MarkdownCallingJSFileExecutionContext,
	MarkdownOtherExecutionContext,
} from 'packages/jsEngine/src/engine/JsExecution';
import { buildJsFunc, ExecutionSource } from 'packages/jsEngine/src/engine/JsExecution';
import { ResultRenderer } from 'packages/jsEngine/src/engine/ResultRenderer';
import { validateAPIArgs } from 'packages/jsEngine/src/utils/Validators';
import * as z from 'zod';

export type ExecuteFileEngineExecutionParams = Omit<EngineExecutionParams, 'code' | 'context'> & {
	context?: JSFileExecutionContext | MarkdownCallingJSFileExecutionContext;
};

export type ExecuteFileSimpleEngineExecutionParams = Omit<EngineExecutionParams, 'code' | 'component' | 'context'> & {
	context?: JSFileExecutionContext | MarkdownCallingJSFileExecutionContext;
};

/**
 * The internal API provides access to some of js engines internals.
 */
export class InternalAPI implements JsEngineInternalApi {
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
	 * Executes code with only the given globals provided as parameters.
	 *
	 * @param code
	 * @param globals
	 * @param expression If true, evaluate code as an expression instead of as a function body.
	 */
	public async executeCustom(code: string, globals: Record<string, unknown>, expression: boolean = false): Promise<unknown> {
		validateAPIArgs(z.object({ code: z.string(), globals: z.record(z.string(), z.unknown()), expression: z.boolean() }), {
			code,
			globals,
			expression,
		});

		const func = buildJsFunc(code, Object.keys(globals), expression, `${this.apiInstance.instanceId.toString()}:custom`);
		return await Promise.resolve(func(...Object.values(globals)));
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
	public async executeFile(path: string, params: ExecuteFileEngineExecutionParams): Promise<JsExecution> {
		validateAPIArgs(z.object({ path: z.string(), params: this.apiInstance.validators.engineExecutionParamsFile }), { path, params });

		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File ${path} not found.`);
		}
		return await this.execute({
			context: {
				executionSource: ExecutionSource.JSFile,
				file: undefined,
				jsFile: file,
			},
			...params,
			code: await this.apiInstance.app.vault.read(file),
		});
	}

	/**
	 * Load and execute the given file.
	 * This method also handles the lifetime of the execution.
	 * The component for the execution is created and destroyed automatically.
	 *
	 * @param path
	 * @param params
	 */
	public async executeFileSimple(path: string, params?: ExecuteFileSimpleEngineExecutionParams): Promise<JsExecution> {
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
	public async getContextForMarkdownCodeBlock(path: string): Promise<MarkdownCodeBlockExecutionContext> {
		validateAPIArgs(z.object({ path: z.string() }), { path });

		const file = this.tryGetFileWithExtension(path, 'md');
		const metadata = file ? this.apiInstance.app.metadataCache.getFileCache(file) : undefined;

		return {
			executionSource: ExecutionSource.MarkdownCodeBlock,
			file: file,
			metadata: metadata ?? undefined,
			block: undefined,
		};
	}

	/**
	 * Gets the execution context for when a markdown file calls a JS file.
	 * This adds some extra info about the markdown file into the context, compared to {@link getContextForJSFile}.
	 *
	 * @param markdownPath The file path of the markdown file.
	 * @param jsPath The file path of the JS file.
	 * @returns
	 */
	public async getContextForMarkdownCallingJSFile(markdownPath: string, jsPath: string): Promise<MarkdownCallingJSFileExecutionContext> {
		validateAPIArgs(z.object({ markdownPath: z.string(), jsPath: z.string() }), { markdownPath, jsPath });

		const markdownFile = this.tryGetFileWithExtension(markdownPath, 'md');
		const metadata = markdownFile ? this.apiInstance.app.metadataCache.getFileCache(markdownFile) : undefined;

		const jsFile = this.getFileWithExtension(jsPath, 'js');

		return {
			executionSource: ExecutionSource.MarkdownCallingJSFile,
			file: markdownFile,
			metadata: metadata ?? undefined,
			jsFile: jsFile,
		};
	}

	/**
	 * Gets the execution context for a markdown code block.
	 *
	 * @param path The file path of the markdown file the code block is in.
	 * @returns
	 */
	public async getContextForMarkdownOther(path: string): Promise<MarkdownOtherExecutionContext> {
		validateAPIArgs(z.object({ path: z.string() }), { path });

		const file = this.tryGetFileWithExtension(path, 'md');
		const metadata = file ? this.apiInstance.app.metadataCache.getFileCache(file) : undefined;

		return {
			executionSource: ExecutionSource.MarkdownOther,
			file: file,
			metadata: metadata ?? undefined,
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

		const file = this.getFileWithExtension(path, 'js');

		return {
			executionSource: ExecutionSource.JSFile,
			file: undefined,
			jsFile: file,
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

	private getFileWithExtension(path: string, extension: string): TFile {
		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			throw new Error(`File ${path} not found.`);
		}
		if (file.extension !== extension && file.extension !== `.${extension}`) {
			throw new Error(`File ${path} is not of the expected file type. Expected file extension to be ".${extension}".`);
		}
		return file;
	}

	private tryGetFileWithExtension(path: string, extension: string): TFile | undefined {
		const file = this.apiInstance.app.vault.getAbstractFileByPath(path);
		if (!file || !(file instanceof TFile)) {
			return undefined;
		}
		if (file.extension !== extension && file.extension !== `.${extension}`) {
			return undefined;
		}
		return file;
	}
}
