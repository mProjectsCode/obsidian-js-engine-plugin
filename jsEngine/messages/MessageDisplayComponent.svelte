<script lang="ts">
	import { MessageManager } from './MessageManager';
	import MessageComponent from './MessageComponent.svelte';
	import Button from '../utils/Button.svelte';
	import { ButtonStyleType } from 'jsEngine/utils/Util';
	import { onDestroy, onMount } from 'svelte';

	const {
		messageManager,
	}: {
		messageManager: MessageManager;
	} = $props();

	let messages = $state(messageManager.messages.get());
	let unsubscribe: () => void;

	onMount(() => {
		unsubscribe = messageManager.messages.subscribe(newMessages => {
			messages = newMessages;
		});
	});

	onDestroy(() => {
		unsubscribe();
	});
</script>

<h2>Messages</h2>

<Button variant={ButtonStyleType.DESTRUCTIVE} on:click={() => messageManager.removeAllMessages()}>Clear All Messages</Button>

<div>
	{#each messages as [id, message] (id)}
		<MessageComponent messageWrapper={message} messageManager={messageManager}></MessageComponent>
	{:else}
		<p>None</p>
	{/each}
</div>
