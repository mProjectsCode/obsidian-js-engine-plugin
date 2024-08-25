<script lang="ts">
	import { MessageManager, MessageWrapper } from './MessageManager';
	import MessageComponent from './MessageComponent.svelte';
	import Button from '../utils/Button.svelte';
	import { ButtonStyleType } from 'jsEngine/utils/Util';
	import { onDestroy, onMount } from 'svelte';
	import type { Listener } from 'jsEngine/utils/Signal';

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
				console.log('Messages updated', newMessages);

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
