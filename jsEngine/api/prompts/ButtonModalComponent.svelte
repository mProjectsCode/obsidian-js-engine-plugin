<script lang="ts">
	import type { ButtonPromptOptions } from 'jsEngine/api/PromptAPI';
	import Button from 'jsEngine/utils/Button.svelte';
	import type { SvelteModal } from './SvelteModal';
	import { ButtonStyleType } from 'jsEngine/utils/Util';

	const {
		options,
		modal,
	}: {
		options: ButtonPromptOptions<unknown>;
		modal: SvelteModal<any, unknown>;
	} = $props();
</script>

<p>{options.content}</p>

<div class="modal-button-container">
	{#each options.buttons as button}
		<Button variant={button.variant ?? ButtonStyleType.DEFAULT} onclick={() => modal.submit(button.value)}>
			{button.label}
		</Button>
	{/each}
</div>
