import type { Component } from 'svelte';
import type { SvelteModal } from 'jsEngine/api/prompts/SvelteModal';

export type ButtonModalComponent<T> = Component<{
	options: ButtonPromptOptions<T>;
	modal: SvelteModal<ButtonModalComponent<T>, T>;
}>;

export declare const ButtonModalComponent: ButtonModalComponent<T>;
