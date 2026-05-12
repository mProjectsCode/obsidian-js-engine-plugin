import type { CachedMetadata } from 'obsidian';
import { Component, TFile } from 'obsidian';
import { API } from 'packages/jsEngine/src/api/API';
import type { ExecuteFileEngineExecutionParams, ExecuteFileSimpleEngineExecutionParams } from 'packages/jsEngine/src/api/Internal';
import { AbstractMarkdownElement } from 'packages/jsEngine/src/api/markdown/AbstractMarkdownElement';
import type { TableElementType } from 'packages/jsEngine/src/api/markdown/AbstractMarkdownElementContainer';
import type {
	ButtonPromptButtonOptions,
	ButtonPromptOptions,
	ConfirmPromptOptions,
	InputPromptOptions,
	NumberInputPromptOptions,
	SuggesterOption,
	SuggesterPromptOptions,
	YesNoPromptOptions,
} from 'packages/jsEngine/src/api/PromptAPI';
import type { EngineExecutionParams } from 'packages/jsEngine/src/engine/Engine';
import type {
	Block,
	ExecutionContext,
	JsExecutionGlobalsConstructionOptions,
	JSFileExecutionContext,
	MarkdownCallingJSFileExecutionContext,
	MarkdownCodeBlockExecutionContext,
	MarkdownOtherExecutionContext,
	UnknownExecutionContext,
} from 'packages/jsEngine/src/engine/JsExecution';
import { ExecutionSource } from 'packages/jsEngine/src/engine/JsExecution';
import { MessageType } from 'packages/jsEngine/src/messages/MessageManager';
import { ErrorLevel, JSEngineValidationError } from 'packages/jsEngine/src/utils/Errors';
import { ButtonStyleType } from 'packages/jsEngine/src/utils/Util';
import * as z from 'zod';

export function schemaForType<T>(): <S extends z.ZodType<T>>(arg: S) => S {
	return function <S extends z.ZodType<T>>(arg: S): S {
		return arg;
	};
}

export function validateAPIArgs<T>(validator: z.ZodType<T>, args: T): void {
	const result = validator.safeParse(args);

	if (!result.success) {
		throw new JSEngineValidationError({
			errorLevel: ErrorLevel.CRITICAL,
			effect: 'Failed to run function due to invalid arguments. Check that the arguments that you are passing to the function match the type definition of the function.',
			cause: result.error,
		});
	}
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type,@typescript-eslint/explicit-function-return-type
export function zodFunction<T extends Function>() {
	return z.custom<T>(val => {
		return typeof val === 'function';
	});
}

export class Validators {
	htmlElement: z.ZodType<HTMLElement>;
	voidFunction: z.ZodType<() => void>;
	component: z.ZodType<Component>;
	tFile: z.ZodType<TFile>;
	cachedMetadata: z.ZodType<CachedMetadata>;
	block: z.ZodType<Block>;
	tableElementType: z.ZodType<TableElementType>;
	tableElementBody: z.ZodType<TableElementType[][]>;
	markdownCodeBlockExecutionContext: z.ZodType<MarkdownCodeBlockExecutionContext>;
	markdownCallingJSFileExecutionContext: z.ZodType<MarkdownCallingJSFileExecutionContext>;
	markdownOtherExecutionContext: z.ZodType<MarkdownOtherExecutionContext>;
	jsFileExecutionContext: z.ZodType<JSFileExecutionContext>;
	unknownExecutionContext: z.ZodType<UnknownExecutionContext>;
	executionContext: z.ZodType<ExecutionContext>;
	engineExecutionParams: z.ZodType<EngineExecutionParams>;
	engineExecutionParamsFile: z.ZodType<Omit<EngineExecutionParams, 'code' | 'context'>>;
	engineExecutionParamsFileSimple: z.ZodType<Omit<EngineExecutionParams, 'code' | 'component' | 'context'>>;
	jsExecutionGlobalsConstructionOptions: z.ZodType<JsExecutionGlobalsConstructionOptions>;
	abstractMarkdownElement: z.ZodType<AbstractMarkdownElement>;
	messageType: z.ZodType<MessageType>;
	buttonStyleType: z.ZodType<ButtonStyleType>;
	buttonPromptButtonOptions: z.ZodType<ButtonPromptButtonOptions<unknown>>;
	buttonModalPromptOptions: z.ZodType<ButtonPromptOptions<unknown>>;
	confirmPromptOptions: z.ZodType<ConfirmPromptOptions>;
	yesNoPromptOptions: z.ZodType<YesNoPromptOptions>;
	suggesterOption: z.ZodType<SuggesterOption<unknown>>;
	suggesterPromptOptions: z.ZodType<SuggesterPromptOptions<unknown>>;
	inputPromptOptions: z.ZodType<InputPromptOptions>;
	numberInputPromptOptions: z.ZodType<NumberInputPromptOptions>;

	constructor() {
		this.htmlElement = schemaForType<HTMLElement>()(z.any());
		this.voidFunction = schemaForType<() => void>()(zodFunction<() => void>());
		this.component = schemaForType<Component>()(z.instanceof(Component));
		this.tFile = schemaForType<TFile>()(z.instanceof(TFile));
		this.cachedMetadata = schemaForType<CachedMetadata>()(z.record(z.string(), z.unknown()));
		this.block = schemaForType<Block>()(
			z.object({
				from: z.number(),
				to: z.number(),
			}),
		);
		this.tableElementType = schemaForType<TableElementType>()(z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]));
		this.tableElementBody = schemaForType<TableElementType[][]>()(z.array(z.array(this.tableElementType)));

		const markdownExecutionContextShape = {
			file: this.tFile.optional(),
			metadata: this.cachedMetadata.optional(),
		};
		const markdownCodeBlockExecutionContext = schemaForType<MarkdownCodeBlockExecutionContext>()(
			z.object({
				executionSource: z.literal(ExecutionSource.MarkdownCodeBlock),
				...markdownExecutionContextShape,
				block: this.block.optional(),
			}),
		);
		const markdownCallingJSFileExecutionContext = schemaForType<MarkdownCallingJSFileExecutionContext>()(
			z.object({
				executionSource: z.literal(ExecutionSource.MarkdownCallingJSFile),
				...markdownExecutionContextShape,
				jsFile: this.tFile,
			}),
		);
		const markdownOtherExecutionContext = schemaForType<MarkdownOtherExecutionContext>()(
			z.object({
				executionSource: z.literal(ExecutionSource.MarkdownOther),
				...markdownExecutionContextShape,
			}),
		);
		const jsFileExecutionContext = schemaForType<JSFileExecutionContext>()(
			z.object({
				executionSource: z.literal(ExecutionSource.JSFile),
				file: z.undefined(),
				jsFile: this.tFile,
			}),
		);
		const unknownExecutionContext = schemaForType<UnknownExecutionContext>()(
			z.object({
				executionSource: z.literal(ExecutionSource.Unknown),
				file: this.tFile.optional(),
			}),
		);
		this.markdownCodeBlockExecutionContext = markdownCodeBlockExecutionContext;
		this.markdownCallingJSFileExecutionContext = markdownCallingJSFileExecutionContext;
		this.markdownOtherExecutionContext = markdownOtherExecutionContext;
		this.jsFileExecutionContext = jsFileExecutionContext;
		this.unknownExecutionContext = unknownExecutionContext;
		this.executionContext = schemaForType<ExecutionContext>()(
			z.discriminatedUnion('executionSource', [
				markdownCodeBlockExecutionContext,
				markdownCallingJSFileExecutionContext,
				markdownOtherExecutionContext,
				jsFileExecutionContext,
				unknownExecutionContext,
			]) as z.ZodType<ExecutionContext>,
		);
		this.engineExecutionParams = schemaForType<EngineExecutionParams>()(
			z.object({
				code: z.string(),
				component: this.component,
				container: this.htmlElement.optional(),
				context: this.executionContext,
				contextOverrides: z.record(z.string(), z.unknown()).optional(),
				expression: z.boolean().optional(),
			}),
		);
		this.engineExecutionParamsFile = schemaForType<ExecuteFileEngineExecutionParams>()(
			z.object({
				component: this.component,
				container: this.htmlElement.optional(),
				context: z.union([this.markdownCallingJSFileExecutionContext, this.jsFileExecutionContext]).optional(),
				contextOverrides: z.record(z.string(), z.unknown()).optional(),
				expression: z.boolean().optional(),
			}),
		);
		this.engineExecutionParamsFileSimple = schemaForType<ExecuteFileSimpleEngineExecutionParams>()(
			z.object({
				container: this.htmlElement.optional(),
				context: z.union([this.markdownCallingJSFileExecutionContext, this.jsFileExecutionContext]).optional(),
				contextOverrides: z.record(z.string(), z.unknown()).optional(),
				expression: z.boolean().optional(),
			}),
		);
		this.jsExecutionGlobalsConstructionOptions = schemaForType<JsExecutionGlobalsConstructionOptions>()(
			z.object({
				engine: z.instanceof(API).optional(),
				component: this.component,
				context: z.intersection(this.executionContext, z.record(z.string(), z.unknown())),
				container: this.htmlElement.optional(),
			}),
		);
		this.abstractMarkdownElement = schemaForType<AbstractMarkdownElement>()(z.instanceof(AbstractMarkdownElement));
		this.messageType = schemaForType<MessageType>()(z.enum(MessageType));
		this.buttonStyleType = schemaForType<ButtonStyleType>()(z.enum(ButtonStyleType));
		this.buttonPromptButtonOptions = schemaForType<ButtonPromptButtonOptions<unknown>>()(
			z.object({
				label: z.string(),
				value: z.unknown(),
				variant: this.buttonStyleType.optional(),
			}),
		);
		this.buttonModalPromptOptions = schemaForType<ButtonPromptOptions<unknown>>()(
			z.object({
				title: z.string(),
				classes: z.string().array().optional(),
				content: z.string().optional(),
				buttons: this.buttonPromptButtonOptions.array(),
			}),
		);
		this.confirmPromptOptions = schemaForType<ConfirmPromptOptions>()(
			z.object({
				title: z.string(),
				classes: z.string().array().optional(),
				content: z.string().optional(),
			}),
		);
		this.yesNoPromptOptions = schemaForType<YesNoPromptOptions>()(
			z.object({
				title: z.string(),
				classes: z.string().array().optional(),
				content: z.string().optional(),
			}),
		);
		this.suggesterOption = schemaForType<SuggesterOption<unknown>>()(
			z.object({
				value: z.unknown(),
				label: z.string(),
			}),
		);
		this.suggesterPromptOptions = schemaForType<SuggesterPromptOptions<unknown>>()(
			z.object({
				placeholder: z.string().optional(),
				options: this.suggesterOption.array(),
			}),
		);
		this.inputPromptOptions = schemaForType<InputPromptOptions>()(
			z.object({
				title: z.string(),
				classes: z.string().array().optional(),
				content: z.string().optional(),
				placeholder: z.string().optional(),
				initialValue: z.string().optional(),
			}),
		);
		this.numberInputPromptOptions = schemaForType<NumberInputPromptOptions>()(
			z.object({
				title: z.string(),
				classes: z.string().array().optional(),
				content: z.string().optional(),
				placeholder: z.string().optional(),
				initialValue: z.number().optional(),
			}),
		);
	}
}
