<!-- Inspired by https://github.com/marcusolsson/obsidian-svelte -->

<script lang="ts">
	import { ButtonStyleType } from './Util';
	import type { Snippet } from 'svelte';

	const {
		variant = ButtonStyleType.DEFAULT,
		disabled = false,
		tooltip = '',
		other = {},
		onclick = () => {},
		children,
	}: {
		variant?: ButtonStyleType;
		disabled?: boolean;
		tooltip?: string;
		other?: Record<string, unknown>;
		onclick?: (e: MouseEvent) => void | Promise<void>;
		children: Snippet;
	} = $props();
</script>

<button
	class="js-engine-button"
	class:mod-cta={variant === ButtonStyleType.PRIMARY}
	class:mod-warning={variant === ButtonStyleType.DESTRUCTIVE}
	class:mod-plain={variant === ButtonStyleType.PLAIN}
	class:disabled={disabled}
	aria-label={tooltip}
	onclick={onclick}
	disabled={disabled}
	{...other}
>
	{@render children()}
</button>
