import type { API } from 'jsEngine/api/API';
import { ButtonStyleType } from 'jsEngine/utils/Util';
import { SvelteModal } from 'jsEngine/api/prompts/SvelteModal';
import { ButtonModalComponent } from 'jsEngine/api/prompts/ButtonModalComponent';
import { Suggester } from 'jsEngine/api/prompts/Suggester';
import { customMount } from 'jsEngine/utils/SvelteUtils';

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

export class PromptAPI {
	readonly apiInstance: API;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
	}

	/**
	 * Prompts the user with a modal containing a list of buttons.
	 * Returns the value of the button that was clicked, or undefined if the modal was closed.
	 */
	public button<T>(options: ButtonPromptOptions<T>): Promise<T | undefined> {
		return new Promise<T | undefined>((resolve, reject) => {
			try {
				new SvelteModal(
					this.apiInstance.app,
					options,
					(modal, targetEl) => {
						return customMount<ButtonModalComponent<T>>(ButtonModalComponent, targetEl, {
							options,
							modal,
						});
					},
					// we cast to narrow the type, so that it is inferred correctly
					resolve as (value: T | undefined) => void,
				).open();
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Prompts the user with a confirm/cancel dialog.
	 * Returns true if the user confirms, false if the user cancels or otherwise closes the modal.
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
}
