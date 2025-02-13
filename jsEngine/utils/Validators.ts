/* eslint-disable @typescript-eslint/no-explicit-any */

import { API } from 'jsEngine/api/API';
import { AbstractMarkdownElement } from 'jsEngine/api/markdown/AbstractMarkdownElement';
import type { TableElementType } from 'jsEngine/api/markdown/AbstractMarkdownElementContainer';
import type {
	ButtonPromptButtonOptions,
	ButtonPromptOptions,
	ConfirmPromptOptions,
	InputPromptOptions,
	NumberInputPromptOptions,
	SuggesterOption,
	SuggesterPromptOptions,
	YesNoPromptOptions,
} from 'jsEngine/api/PromptAPI';
import type { EngineExecutionParams } from 'jsEngine/engine/Engine';
import type { Block, ExecutionContext, JsExecutionGlobalsConstructionOptions } from 'jsEngine/engine/JsExecution';
import { ExecutionSource } from 'jsEngine/engine/JsExecution';
import { MessageType } from 'jsEngine/messages/MessageManager';
import { ErrorLevel, JSEngineValidationError } from 'jsEngine/utils/Errors';
import { ButtonStyleType } from 'jsEngine/utils/Util';
import type { CachedMetadata } from 'obsidian';
import { Component, TFile } from 'obsidian';
import { z } from 'zod';

export function schemaForType<T>(): <S extends z.ZodType<T, any, any>>(arg: S) => S {
	return function <S extends z.ZodType<T, any, any>>(arg: S): S {
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

export class Validators {
	htmlElement: z.ZodType<HTMLElement, any, any>;
	voidFunction: z.ZodType<() => void, any, any>;
	component: z.ZodType<Component, any, any>;
	tFile: z.ZodType<TFile, any, any>;
	cachedMetadata: z.ZodType<CachedMetadata, any, any>;
	block: z.ZodType<Block, any, any>;
	tableElementType: z.ZodType<TableElementType, any, any>;
	tableElementBody: z.ZodType<TableElementType[][], any, any>;
	executionContext: z.ZodType<ExecutionContext, any, any>;
	engineExecutionParams: z.ZodType<EngineExecutionParams, any, any>;
	engineExecutionParamsFile: z.ZodType<Omit<EngineExecutionParams, 'code' | 'context'>, any, any>;
	engineExecutionParamsFileSimple: z.ZodType<Omit<EngineExecutionParams, 'code' | 'component' | 'context'>, any, any>;
	jsExecutionGlobalsConstructionOptions: z.ZodType<JsExecutionGlobalsConstructionOptions, any, any>;
	abstractMarkdownElement: z.ZodType<AbstractMarkdownElement, any, any>;
	messageType: z.ZodType<MessageType, any, any>;
	buttonStyleType: z.ZodType<ButtonStyleType, any, any>;
	buttonPromptButtonOptions: z.ZodType<ButtonPromptButtonOptions<unknown>, any, any>;
	buttonModalPromptOptions: z.ZodType<ButtonPromptOptions<unknown>, any, any>;
	confirmPromptOptions: z.ZodType<ConfirmPromptOptions, any, any>;
	yesNoPromptOptions: z.ZodType<YesNoPromptOptions, any, any>;
	suggesterOption: z.ZodType<SuggesterOption<unknown>, any, any>;
	suggesterPromptOptions: z.ZodType<SuggesterPromptOptions<unknown>, any, any>;
	inputPromptOptions: z.ZodType<InputPromptOptions, any, any>;
	numberInputPromptOptions: z.ZodType<NumberInputPromptOptions, any, any>;

	constructor() {
		this.htmlElement = schemaForType<HTMLElement>()(z.instanceof(HTMLElement));
		this.voidFunction = schemaForType<() => void>()(z.function().args().returns(z.void()));
		this.component = schemaForType<Component>()(z.instanceof(Component));
		this.tFile = schemaForType<TFile>()(z.instanceof(TFile));
		this.cachedMetadata = schemaForType<CachedMetadata>()(z.record(z.unknown())) as z.ZodType<CachedMetadata, any, any>;
		this.block = schemaForType<Block>()(
			z.object({
				from: z.number(),
				to: z.number(),
			}),
		);
		this.tableElementType = schemaForType<TableElementType>()(z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]));
		this.tableElementBody = schemaForType<TableElementType[][]>()(z.array(z.array(this.tableElementType)));
		this.executionContext = schemaForType<ExecutionContext>()(
			z.discriminatedUnion('executionSource', [
				z.object({
					executionSource: z.literal(ExecutionSource.MarkdownCodeBlock),
					file: this.tFile,
					metadata: this.cachedMetadata.optional(),
					block: this.block.optional(),
				}),
				z.object({
					executionSource: z.literal(ExecutionSource.JSFile),
					file: this.tFile,
				}),
				z.object({
					executionSource: z.literal(ExecutionSource.Unknown),
					file: this.tFile.optional(),
				}),
			]),
		);
		this.engineExecutionParams = schemaForType<EngineExecutionParams>()(
			z.object({
				code: z.string(),
				component: this.component,
				container: this.htmlElement.optional(),
				context: this.executionContext,
				contextOverrides: z.record(z.unknown()).optional(),
			}),
		);
		this.engineExecutionParamsFile = schemaForType<Omit<EngineExecutionParams, 'code' | 'context'>>()(
			z.object({
				component: this.component,
				container: this.htmlElement.optional(),
				context: this.executionContext.optional(),
				contextOverrides: z.record(z.unknown()).optional(),
			}),
		);
		this.engineExecutionParamsFileSimple = schemaForType<Omit<EngineExecutionParams, 'code' | 'component' | 'context'>>()(
			z.object({
				container: this.htmlElement.optional(),
				context: this.executionContext.optional(),
				contextOverrides: z.record(z.unknown()).optional(),
			}),
		);
		this.jsExecutionGlobalsConstructionOptions = schemaForType<JsExecutionGlobalsConstructionOptions>()(
			z.object({
				engine: z.instanceof(API).optional(),
				component: this.component,
				context: z.intersection(this.executionContext, z.record(z.unknown())),
				container: this.htmlElement.optional(),
			}),
		);
		this.abstractMarkdownElement = schemaForType<AbstractMarkdownElement>()(z.instanceof(AbstractMarkdownElement));
		this.messageType = schemaForType<MessageType>()(z.nativeEnum(MessageType));
		this.buttonStyleType = schemaForType<ButtonStyleType>()(z.nativeEnum(ButtonStyleType));
		this.buttonPromptButtonOptions = schemaForType<ButtonPromptButtonOptions<unknown>>()(
			z.object({
				label: z.string(),
				value: z.unknown(),
				variant: this.buttonStyleType.optional(),
			}) as z.ZodType<ButtonPromptButtonOptions<unknown>, any, any>,
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
			}) as z.ZodType<SuggesterOption<unknown>, any, any>,
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
