<script lang="ts">
	import Button from 'jsEngine/utils/Button.svelte';
	import type { InputPromptOptions } from '../PromptAPI';
	import type { SvelteModal } from './SvelteModal';
	import { ButtonStyleType } from 'jsEngine/utils/Util';

	const {
		options,
		modal,
		inputType,
	}: {
		options: InputPromptOptions;
		modal: SvelteModal<any, unknown>;
		inputType: 'text' | 'number' | 'textarea';
	} = $props();

	let value = $state();
</script>

<p>{options.content}</p>

{#if inputType === 'textarea'}
	<textarea style="width: 100%; resize: vertical; height: 200px" bind:value={value} placeholder={options.placeholder ?? 'Text here...'}></textarea>
{:else if inputType === 'text'}
	<input style="width: 100%;" type="text" bind:value={value} placeholder={options.placeholder ?? 'Text here...'} />
{:else}
	<input style="width: 100%;" type="number" bind:value={value} placeholder={options.placeholder ?? 'Number here...'} />
{/if}

<div class="modal-button-container">
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => modal.submit(value)}>Submit</Button>
	<Button variant={ButtonStyleType.DEFAULT} onclick={() => modal.submit(undefined)}>Cancel</Button>
</div>
