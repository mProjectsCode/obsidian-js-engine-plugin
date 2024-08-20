import type { API } from 'jsEngine/api/API';
import { ButtonStyleType } from 'jsEngine/utils/Util';
import { SvelteModal } from 'jsEngine/api/prompts/SvelteModal';
import ButtonModalComponent from 'jsEngine/api/prompts/ButtonModalComponent.svelte';
import InputModalComponent from 'jsEngine/api/prompts/InputModalComponent.svelte';
import { Suggester } from 'jsEngine/api/prompts/Suggester';
import { mount } from 'svelte';
import type { AnySvelteComponent } from 'jsEngine/utils/SvelteUtils';

export interface ModalPromptOptions {
	/**
	 * The title of the modal.
	 */
	title: string;
	/**
	 * A list of CSS classes to apply to the modal.
	 */
	classes?: string[];
}

export interface ButtonPromptOptions<T> extends ModalPromptOptions {
	/**
	 * Text content to display in the modal.
	 */
	content?: string;
	/**
	 * A list of buttons to display in the modal.
	 */
	buttons: {
		label: string;
		value: T;
		variant?: ButtonStyleType;
	}[];
}

export interface ConfirmPromptOptions extends ModalPromptOptions {
	/**
	 * Text content to display in the modal.
	 */
	content?: string;
}

export interface YesNoPromptOptions extends ModalPromptOptions {
	/**
	 * Text content to display in the modal.
	 */
	content?: string;
}

export interface SuggesterPromptOptions<T> {
	placeholder?: string;
	options: SuggesterOption<T>[];
}

export interface SuggesterOption<T> {
	value: T;
	label: string;
}

export interface InputPromptOptions extends ModalPromptOptions {
	/**
	 * Text content to display in the modal.
	 */
	content?: string;
	/**
	 * The placeholder text for the input field. This will show when the input field is empty.
	 */
	placeholder?: string;
	/**
	 * The initial value of the input field that is pre-filled when the modal is opened.
	 */
	initialValue?: string;
}

export interface NumberInputPromptOptions extends ModalPromptOptions {
	/**
	 * Text content to display in the modal.
	 */
	content?: string;
	/**
	 * The placeholder text for the input field. This will show when the input field is empty.
	 */
	placeholder?: string;
	/**
	 * The initial value of the input field that is pre-filled when the modal is opened.
	 */
	initialValue?: number;
}

export class PromptAPI {
	readonly apiInstance: API;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
	}

	/**
	 * Prompts the user with a modal containing a list of buttons.
	 * Returns the value of the button that was clicked, or undefined if the modal was closed.
	 *
	 * @example
	 * ```typescript
	 * // Prompt the user with a true/false question.
	 *
	 * const ret = await engine.prompt.button({
	 *     title: 'The set of natural numbers with zero and the addition operation is a monoid.',
	 *     buttons: [
	 *         {
	 *             label: 'True',
	 *             value: true,
	 *         },
	 *         {
	 *             label: 'False',
	 *             value: false,
	 *         },
	 *         {
	 *             label: 'Cancel',
	 *             value: undefined,
	 *         }
	 *     ]
	 * });
	 * ```
	 */
	public button<T>(options: ButtonPromptOptions<T>): Promise<T | undefined> {
		return new Promise<T | undefined>((resolve, reject) => {
			try {
				new SvelteModal<AnySvelteComponent, unknown>(
					this.apiInstance.app,
					options,
					(modal, targetEl) => {
						return mount(ButtonModalComponent, {
							target: targetEl,
							props: {
								options,
								modal,
							},
						});
					},
					resolve as (value: unknown) => void,
				).open();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Prompts the user with a confirm/cancel dialog.
	 * Returns true if the user confirms, false if the user cancels or otherwise closes the modal.
	 *
	 * @example
	 * ```typescript
	 * // Ask the user if they want to confirm an action.
	 *
	 * const ret = await engine.prompt.confirm({
	 *     title: 'Confirm File Deletion',
	 *     content: 'Are you sure you want to delete this file? This action cannot be undone.',
	 * });
	 * ```
	 */
	public async confirm(options: ConfirmPromptOptions): Promise<boolean> {
		return (
			(await this.button<boolean>({
				...options,
				buttons: [
					{
						label: 'Confirm',
						value: true,
						variant: ButtonStyleType.PRIMARY,
					},
					{
						label: 'Cancel',
						value: false,
						variant: ButtonStyleType.DEFAULT,
					},
				],
			})) ?? false
		);
	}

	/**
	 * Prompts the user with a yes/no dialog.
	 * Returns true if the user selects yes, false if the user selects no, and undefined if the user otherwise closes the modal.
	 *
	 * @example
	 * ```typescript
	 * // Ask the user if they like Obsidian.
	 *
	 * const ret = await engine.prompt.yesNo({
	 *     title: 'Is this a test?',
	 *     content: 'Are you sure this is a test? Are you sure that your choice is really meaningless?',
	 * });
	 * ```
	 */
	public async yesNo(options: YesNoPromptOptions): Promise<boolean | undefined> {
		return await this.button<boolean>({
			...options,
			buttons: [
				{
					label: 'Yes',
					value: true,
					variant: ButtonStyleType.PRIMARY,
				},
				{
					label: 'No',
					value: false,
					variant: ButtonStyleType.DEFAULT,
				},
			],
		});
	}

	/**
	 * Prompts the user with a fuzzy finder suggester dialog.
	 * Returns the value of the selected option, or undefined if the user closes the modal.
	 *
	 * @example
	 * ```typescript
	 * // Query a list of files and prompt the user to select one.
	 *
	 * const files = engine.query.files((file) => {
	 *     return {
	 *         label: file.name,
	 *         value: file.pat,
	 *     };
	 * });
	 *
	 * const ret = await engine.prompt.suggester({
	 *     placeholder: 'Select a file',
	 *     options: files,
	 * });
	 * ```
	 */
	public suggester<T>(options: SuggesterPromptOptions<T>): Promise<T | undefined> {
		return new Promise<T | undefined>((resolve, reject) => {
			try {
				new Suggester<T>(this.apiInstance.app, options, resolve).open();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Prompts the user with a text input dialog.
	 * Returns the value of the input field, or undefined if the user closes the modal.
	 * While the input field is focused, the user can use `enter` to submit the value and `esc` to cancel and close the modal.
	 *
	 * @example
	 * ```typescript
	 * // Prompt the user to input their name.
	 *
	 * const ret = await engine.prompt.text({
	 *     title: 'Please enter your name',
	 *     content: 'Please enter your name in the field below.',
	 * });
	 * ```
	 */
	public text(options: InputPromptOptions): Promise<string | undefined> {
		return new Promise<string | undefined>((resolve, reject) => {
			try {
				new SvelteModal<AnySvelteComponent, unknown>(
					this.apiInstance.app,
					options,
					(modal, targetEl) => {
						return mount(InputModalComponent, {
							target: targetEl,
							props: {
								options,
								modal,
								inputType: 'text',
							},
						});
					},
					resolve as (value: unknown) => void,
				).open();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Prompts the user with a textarea input dialog.
	 * Returns the value of the input field, or undefined if the user closes the modal.
	 * While the input field is focused, the user can use `esc` to cancel and close the modal.
	 *
	 * @example
	 * ```typescript
	 * // Prompt the user to input a multi-line message.
	 *
	 * const ret = await engine.prompt.textarea({
	 *     title: 'Please enter your message',
	 *     content: 'Please enter your message in the field below.',
	 *     placeholder: 'Your message here...',
	 * });
	 * ```
	 */
	public textarea(options: InputPromptOptions): Promise<string | undefined> {
		return new Promise<string | undefined>((resolve, reject) => {
			try {
				new SvelteModal<AnySvelteComponent, unknown>(
					this.apiInstance.app,
					options,
					(modal, targetEl) => {
						return mount(InputModalComponent, {
							target: targetEl,
							props: {
								options,
								modal,
								inputType: 'textarea',
							},
						});
					},
					resolve as (value: unknown) => void,
				).open();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Prompts the user with a number input dialog.
	 * Returns the value of the input field, or undefined if the user closes the modal.
	 * While the input field is focused, the user can use `enter` to submit the value and `esc` to cancel and close the modal.
	 *
	 * @example
	 * ```typescript
	 * // Prompt the user to input their age.
	 *
	 * const ret = await engine.prompt.text({
	 *     title: 'Please enter your age',
	 *     content: 'Please enter your age in years in the field below.',
	 * });
	 * ```
	 */
	public number(options: NumberInputPromptOptions): Promise<number | undefined> {
		return new Promise<number | undefined>((resolve, reject) => {
			try {
				new SvelteModal<AnySvelteComponent, unknown>(
					this.apiInstance.app,
					options,
					(modal, targetEl) => {
						return mount(InputModalComponent, {
							target: targetEl,
							props: {
								options,
								modal,
								inputType: 'number',
							},
						});
					},
					resolve as (value: unknown) => void,
				).open();
			} catch (error) {
				reject(error);
			}
		});
	}
}
