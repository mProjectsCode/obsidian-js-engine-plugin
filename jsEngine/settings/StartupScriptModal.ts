import type JsEnginePlugin from 'jsEngine/main';
import StartupScripts from 'jsEngine/settings/StartupScripts.svelte';
import type { MountedComponent } from 'jsEngine/utils/SvelteUtils';
import { Modal } from 'obsidian';
import { mount, unmount } from 'svelte';

export class StartupScriptsModal extends Modal {
	readonly plugin: JsEnginePlugin;
	private component?: MountedComponent<typeof StartupScripts> | undefined;

	constructor(plugin: JsEnginePlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onOpen(): void {
		this.contentEl.empty();

		this.component = mount(StartupScripts, {
			target: this.contentEl,
			props: {
				modal: this,
				startupScripts: this.plugin.settings.startupScripts ?? [],
			},
		});
	}

	onClose(): void {
		if (this.component) {
			void unmount(this.component);
		}
	}

	save(startupScripts: string[]): void {
		this.plugin.settings.startupScripts = startupScripts;
		void this.plugin.saveSettings();
	}
}
