import type { ModalPromptOptions } from 'jsEngine/api/PromptAPI';
import type { AnySvelteComponent, MountedComponent } from 'jsEngine/utils/SvelteUtils';
import type { App } from 'obsidian';
import { Modal } from 'obsidian';
import { unmount } from 'svelte';

export class SvelteModal<Component extends AnySvelteComponent, T> extends Modal {
	private component: MountedComponent<Component> | undefined;
	private readonly options: ModalPromptOptions;
	private readonly createComponent: (modal: SvelteModal<Component, T>, targetEl: HTMLElement) => MountedComponent<Component>;
	private readonly onSubmit: (value: T | undefined) => void;
	private submitted: boolean;

	constructor(
		app: App,
		options: ModalPromptOptions,
		createComponent: (modal: SvelteModal<Component, T>, targetEl: HTMLElement) => MountedComponent<Component>,
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
			void unmount(this.component);
		}
		this.contentEl.empty();
	}

	public submit(value: T): void {
		this.submitted = true;
		this.onSubmit(value);
		this.close();
	}
}
