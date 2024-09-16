<script lang="ts">
	import Button from 'jsEngine/utils/Button.svelte';
	import type { InputPromptOptions, NumberInputPromptOptions } from '../PromptAPI';
	import type { SvelteModal } from './SvelteModal';
	import { ButtonStyleType } from 'jsEngine/utils/Util';

	const {
		options,
		modal,
		inputType,
	}:
		| {
				options: InputPromptOptions;
				modal: SvelteModal<any, unknown>;
				inputType: 'text' | 'textarea';
		  }
		| {
				options: NumberInputPromptOptions;
				modal: SvelteModal<any, unknown>;
				inputType: 'number';
		  } = $props();

	let value = $state(options.initialValue);

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && inputType !== 'textarea') {
			event.stopPropagation();
			event.preventDefault();

			modal.submit(value);
		}
		if (event.key === 'Enter' && event.ctrlKey && inputType === 'textarea') {
			event.stopPropagation();
			event.preventDefault();

			modal.submit(value);
		}

		if (event.key === 'Escape') {
			event.stopPropagation();
			event.preventDefault();

			modal.submit(undefined);
		}
	}
</script>

<p>{options.content}</p>

{#if inputType === 'textarea'}
	<textarea style="width: 100%; resize: vertical; height: 200px" bind:value={value} placeholder={options.placeholder ?? 'Text here...'} onkeydown={onKeydown}
	></textarea>
{:else if inputType === 'text'}
	<input style="width: 100%;" type="text" bind:value={value} placeholder={options.placeholder ?? 'Text here...'} onkeydown={onKeydown} />
{:else}
	<input style="width: 100%;" type="number" bind:value={value} placeholder={options.placeholder ?? 'Number here...'} onkeydown={onKeydown} />
{/if}

<div class="modal-button-container">
	<Button variant={ButtonStyleType.PRIMARY} onclick={() => modal.submit(value)}>Submit</Button>
	<Button variant={ButtonStyleType.DEFAULT} onclick={() => modal.submit(undefined)}>Cancel</Button>
</div>
