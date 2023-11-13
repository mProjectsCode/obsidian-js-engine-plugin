<script lang="ts">
	import { mapMessageTypeToClass, mapMessageTypeToIcon, MessageManager, MessageWrapper } from './MessageManager';
	import { useIcon } from 'obsidian-svelte';
	import { slide } from 'svelte/transition';

	export let messageWrapper: MessageWrapper;
	export let messageManager: MessageManager;
	export let showDeleteButton: boolean = true;
	export let showMessageSource: boolean = true;

	let showMore: boolean = false;
</script>

<div class="js-engine-message callout {mapMessageTypeToClass(messageWrapper.message.type)}" data-callout={messageWrapper.message.type}>
	<div class="js-engine-message-header callout-title">
		<div class="js-engine-message-icon callout-icon" use:useIcon={mapMessageTypeToIcon(messageWrapper.message.type)}></div>
		<span class="js-engine-message-title">{messageWrapper.message.title}</span>
		{#if showDeleteButton}
			<div
				class="js-engine-message-delete-icon callout-icon"
				on:click={() => messageManager.removeMessage(messageWrapper.uuid)}
				on:keydown={e => (e.key === ' ' ? messageManager.removeMessage(messageWrapper.uuid) : undefined)}
				use:useIcon={'x'}
				aria-label="remove"
				role="button"
				tabindex="0"
			></div>
		{/if}
	</div>

	<div class="js-engine-message-content callout-content">
		{#if messageWrapper.message.content}
			<p>{messageWrapper.message.content}</p>
		{/if}

		{#if messageWrapper.message.code}
			<pre class="language-none"><code>{messageWrapper.message.code}</code></pre>
		{/if}

		<div class="js-engine-message-detail">
			<div
				class="js-engine-message-detail-row"
				on:click={() => (showMore = !showMore)}
				aria-expanded={showMore ? 'true' : 'false'}
				on:keydown={e => (e.key === ' ' ? (showMore = !showMore) : undefined)}
				role="button"
				tabindex="0"
			>
				<span>Details</span>
				<div class="js-engine-message-icon" use:useIcon={showMore ? 'chevron-down' : 'chevron-right'}></div>
			</div>
			{#if showMore}
				<div class="js-engine-message-detail-content" transition:slide={{ duration: 100 }}>
					<p>Type: {messageWrapper.message.type}</p>
					<p>Time: {messageWrapper.time.toISOString()}</p>
					{#if showMessageSource}
						<p>Source Name: {messageWrapper.source.name}</p>
						<p>Source ID: {messageWrapper.source.id}</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
