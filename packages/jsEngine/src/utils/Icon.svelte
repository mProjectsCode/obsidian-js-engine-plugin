<!--adapted from @joethei's code: https://github.com/joethei/obsidian-rss/blob/master/src/view/IconComponent.svelte-->
<!--adapted from @javalent's code: https://discord.com/channels/686053708261228577/840286264964022302/902949764209987654-->
<script lang="ts">
	import { setIcon } from 'obsidian';

	const {
		iconName = '',
	}: {
		iconName?: string;
	} = $props();

	let iconEl: HTMLElement | undefined = $state();

	$effect(() => (iconEl ? setIcon(iconEl, iconName) : undefined));
</script>

{#if iconName.length > 0}
	<div class="js-engine-icon-wrapper" bind:this={iconEl}></div>
{/if}
