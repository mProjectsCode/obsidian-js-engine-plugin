<script lang="ts">
	import { MessageManager } from './MessageManager';
	import MessageComponent from './MessageComponent.svelte';
	import { Button } from 'obsidian-svelte';

	export let messageManager: MessageManager;
	let messages = messageManager.messages;
</script>

<h2>Messages</h2>

<Button variant="destructive" on:click={() => messageManager.removeAllMessages()}>Clear All Messages</Button>

<div>
	{#each $messages as [id, message]}
		<MessageComponent bind:messageWrapper={message} messageManager={messageManager}></MessageComponent>
	{:else}
		<p>None</p>
	{/each}
</div>
