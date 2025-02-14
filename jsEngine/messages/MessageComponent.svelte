<script lang="ts">
	import { mapMessageTypeToClass, mapMessageTypeToIcon, MessageManager, MessageWrapper } from './MessageManager';
	import { useIcon } from 'jsEngine/utils/UseIcon';
	import { slide } from 'svelte/transition';

	const {
		messageWrapper,
		messageManager,
		showDeleteButton = true,
		showMessageSource = true,
	}: {
		messageWrapper: MessageWrapper;
		messageManager: MessageManager;
		showDeleteButton?: boolean;
		showMessageSource?: boolean;
	} = $props();

	console.log(messageWrapper.source.executionContext);

	let showMore: boolean = $state(false);
</script>

<div class="js-engine-message callout {mapMessageTypeToClass(messageWrapper.message.type)}" data-callout={messageWrapper.message.type}>
	<div class="js-engine-message-header callout-title">
		<div class="js-engine-message-icon callout-icon" use:useIcon={mapMessageTypeToIcon(messageWrapper.message.type)}></div>
		<span class="js-engine-message-title">{messageWrapper.message.title}</span>
		{#if showDeleteButton}
			<div
				class="js-engine-message-delete-icon callout-icon"
				onclick={() => messageManager.removeMessage(messageWrapper.uuid)}
				onkeydown={e => (e.key === ' ' ? messageManager.removeMessage(messageWrapper.uuid) : undefined)}
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
				onclick={() => (showMore = !showMore)}
				aria-expanded={showMore ? 'true' : 'false'}
				onkeydown={e => (e.key === ' ' ? (showMore = !showMore) : undefined)}
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
						{@const executionContext = messageWrapper.source.executionContext}
						{#if executionContext}
							<p>Execution Type: {executionContext.executionSource}</p>
							{#if 'file' in executionContext}
								<p>Execution File: {executionContext.file?.path ?? 'none'}</p>
							{/if}
							{#if 'jsFile' in executionContext}
								<p>Execution JS File: {executionContext.jsFile?.path ?? 'none'}</p>
							{/if}
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
