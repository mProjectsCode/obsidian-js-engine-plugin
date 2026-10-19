<script lang="ts">
	import type { Listener } from 'packages/jsEngine/src/utils/Signal';
	import './MessageManager';
	import { ButtonStyleType } from 'packages/jsEngine/src/utils/Util';
	import { onDestroy, onMount } from 'svelte';
	import Button from '../utils/Button.svelte';
	import MessageComponent from './MessageComponent.svelte';
	import type { MessageManager, MessageWrapper } from './MessageManager';

	const {
		messageManager,
	}: {
		messageManager: MessageManager;
	} = $props();

	let messages = $state(messageManager.messages.get());
	let listener: Listener<MessageWrapper[]>;

	onMount(() => {
		listener = messageManager.messages.registerListener({
			callback: newMessages => {
				messages = newMessages;
			},
		});
	});

	onDestroy(() => {
		messageManager.messages.unregisterListener(listener);
	});
</script>

<h2>Messages</h2>

<Button variant={ButtonStyleType.DESTRUCTIVE} onclick={() => messageManager.removeAllMessages()}>Clear All Messages</Button>

<div>
	{#each messages as message (message.uuid)}
		<MessageComponent messageWrapper={message} messageManager={messageManager}></MessageComponent>
	{:else}
		<p>None</p>
	{/each}
</div>
