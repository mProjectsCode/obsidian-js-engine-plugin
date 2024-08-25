import type { SuggesterOption, SuggesterPromptOptions } from 'jsEngine/api/PromptAPI';
import type { App } from 'obsidian';
import { FuzzySuggestModal } from 'obsidian';

export class Suggester<T> extends FuzzySuggestModal<SuggesterOption<T>> {
	private readonly options: SuggesterPromptOptions<T>;
	private readonly onSubmit: (value: T | undefined) => void;
	private selectedValue: T | undefined;

	constructor(app: App, options: SuggesterPromptOptions<T>, onSubmit: (value: T | undefined) => void) {
		super(app);

		this.options = options;
		this.onSubmit = onSubmit;

		if (options.placeholder) {
			this.setPlaceholder(options.placeholder);
		}
	}

	getItems(): SuggesterOption<T>[] {
		return this.options.options;
	}

	getItemText(item: SuggesterOption<T>): string {
		return item.label;
	}

	onChooseItem(item: SuggesterOption<T>, _: MouseEvent | KeyboardEvent): void {
		this.selectedValue = item.value;
	}

	onOpen(): void {
		super.onOpen();

		this.selectedValue = undefined;
	}

	onClose(): void {
		super.onClose();

		queueMicrotask(() => {
			this.onSubmit(this.selectedValue);
		});
	}
}
