<script lang="ts">
	import { MessageManager } from "./MessageManager";
	import MessageComponent from "./MessageComponent.svelte";

	export let messageManager: MessageManager;
	let messages = messageManager.messages;
</script>

<h2>Messages</h2>

<div>
	{#each $messages as [id, message]}
		<MessageComponent bind:messageWrapper="{message}" messageManager="{messageManager}"></MessageComponent>
	{:else}
		<p>None</p>
	{/each}
</div>
