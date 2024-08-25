import type JsEnginePlugin from 'jsEngine/main';
import { FuzzySuggestModal, TFile } from 'obsidian';

export class JSFileSelectModal extends FuzzySuggestModal<TFile> {
	plugin: JsEnginePlugin;
	selectCallback: (selected: TFile) => void | Promise<void>;

	constructor(plugin: JsEnginePlugin, selectCallback: (selected: TFile) => void | Promise<void>) {
		super(plugin.app);

		this.plugin = plugin;
		this.selectCallback = selectCallback;
	}

	getItems(): TFile[] {
		const allFiles = this.app.vault.getAllLoadedFiles().filter(file => file instanceof TFile);
		return allFiles.filter(file => file.extension === 'js');
	}

	getItemText(item: TFile): string {
		return item.path;
	}

	public onChooseItem(item: TFile, _evt: MouseEvent | KeyboardEvent): void {
		void this.selectCallback(item);
	}
}
