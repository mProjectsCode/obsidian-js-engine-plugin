import { type App, Modal } from 'obsidian';
import { type Component as SvelteComponent, unmount } from 'svelte';
import type { ModalPromptOptions } from 'jsEngine/api/PromptAPI';

export class SvelteModal<Component extends SvelteComponent, T> extends Modal {
	private component: ReturnType<Component> | undefined;
	private readonly options: ModalPromptOptions;
	private readonly createComponent: (modal: SvelteModal<Component, T>, targetEl: HTMLElement) => ReturnType<Component>;
	private readonly onSubmit: (value: T | undefined) => void;
	private submitted: boolean;

	constructor(
		app: App,
		options: ModalPromptOptions,
		createComponent: (modal: SvelteModal<Component, T>, targetEl: HTMLElement) => ReturnType<Component>,
		onSubmit: (value: T | undefined) => void,
	) {
		super(app);

		this.options = options;
		this.createComponent = createComponent;
		this.onSubmit = onSubmit;

		this.submitted = false;
	}

	public onOpen(): void {
		this.submitted = false;

		this.setTitle(this.options.title);
		this.containerEl.addClasses(this.options.classes ?? []);

		this.createComponent(this, this.contentEl);
	}

	public onClose(): void {
		if (!this.submitted) {
			this.submitted = true;
			this.onSubmit(undefined);
		}

		if (this.component) {
			unmount(this.component);
		}
		this.contentEl.empty();
	}

	public submit(value: T): void {
		this.submitted = true;
		this.onSubmit(value);
		this.close();
	}
}
