<script lang="ts">
	import { JSFileSelectModal } from 'jsEngine/fileRunner/JSFileSelectModal';
	import Button from 'jsEngine/utils/Button.svelte';
	import ModalButtonGroup from 'jsEngine/utils/ModalButtonGroup.svelte';
	import type { StartupScriptsModal } from './StartupScriptModal';
	import { ButtonStyleType } from 'jsEngine/utils/Util';
	import { Menu } from 'obsidian';
	import Icon from 'jsEngine/utils/Icon.svelte';

	let {
		startupScripts: initialStartupScripts,
		modal,
	}: {
		startupScripts: string[];
		modal: StartupScriptsModal;
	} = $props();

	let startupScripts = $state(initialStartupScripts);

	function addScript() {
		new JSFileSelectModal(modal.plugin, async selected => {
			startupScripts.push(selected.path);
		}).open();
	}

	function save() {
		modal.save($state.snapshot(startupScripts));
		modal.close();
	}

	function cancel() {
		modal.close();
	}

	function contextMenu(e: MouseEvent, index: number) {
		let menu = new Menu();
		if (index > 0) {
			menu.addItem(item => {
				item.setTitle('Move up');
				item.setIcon('arrow-up');
				item.onClick(() => {
					const temp = startupScripts[index - 1];
					startupScripts[index - 1] = startupScripts[index];
					startupScripts[index] = temp;
				});
			});
		}
		if (index < startupScripts.length - 1) {
			menu.addItem(item => {
				item.setTitle('Move down');
				item.setIcon('arrow-down');
				item.onClick(() => {
					const temp = startupScripts[index + 1];
					startupScripts[index + 1] = startupScripts[index];
					startupScripts[index] = temp;
				});
			});
		}

		menu.addItem(item => {
			item.setTitle('Remove');
			item.setIcon('x');
			item.setWarning(true);
			item.onClick(() => {
				startupScripts.splice(index, 1);
			});
		});

		menu.showAtMouseEvent(e);
	}
</script>

<div>
	<div class="js-engine-list">
		{#each startupScripts as script, i}
			<div class="js-engine-list-item">
				<span>{script}</span>
				<Button onclick={e => contextMenu(e, i)} variant={ButtonStyleType.PLAIN} tooltip="Edit">
					<Icon iconName="ellipsis-vertical" />
				</Button>
			</div>
		{/each}
	</div>

	<Button onclick={() => addScript()}>Add startup script</Button>

	<ModalButtonGroup>
		<Button onclick={() => save()} variant={ButtonStyleType.PRIMARY} tooltip="Save changes">Save</Button>
		<Button onclick={() => cancel()} tooltip="Revert changes">Cancel</Button>
	</ModalButtonGroup>
</div>
