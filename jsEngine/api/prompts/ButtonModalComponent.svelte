<script lang="ts">
	import type { ButtonPromptOptions } from 'jsEngine/api/PromptAPI';
	import Button from 'jsEngine/utils/Button.svelte';
	import type { SvelteModal } from './SvelteModal';
	import { ButtonStyleType, mod } from 'jsEngine/utils/Util';

	const {
		options,
		modal,
	}: {
		options: ButtonPromptOptions<unknown>;
		modal: SvelteModal<any, unknown>;
	} = $props();

	let divEl: HTMLDivElement;

	function shiftFocus(next: boolean) {
		const focusedButton = divEl.querySelector('button:focus');

		if (focusedButton) {
			const index = parseInt(focusedButton.getAttribute('data-index') ?? '0', 10);
			const nextIndex = mod(index + (next ? 1 : -1), options.buttons.length);

			const newFocusedButton = divEl.querySelector(`button[data-index="${nextIndex}"]`);

			if (newFocusedButton && newFocusedButton instanceof HTMLElement) {
				newFocusedButton.focus();
			}
		}
	}

	function handleKey(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') {
			event.preventDefault();
			shiftFocus(true);
		}

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			shiftFocus(true);
		}
	}
</script>

<p>{options.content}</p>

<div class="modal-button-container" bind:this={divEl}>
	{#each options.buttons as button, i}
		<Button
			variant={button.variant ?? ButtonStyleType.DEFAULT}
			onclick={() => modal.submit(button.value)}
			other={{
				'data-index': i,
				onkeydown: (e: KeyboardEvent) => handleKey(e),
			}}
		>
			{button.label}
		</Button>
	{/each}
</div>
