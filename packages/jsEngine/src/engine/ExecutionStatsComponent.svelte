<script lang="ts">
	import './JsExecution';
	import { sanitizeHTMLToDom } from 'obsidian';
	import MessageComponent from '../messages/MessageComponent.svelte';
	import type { JsExecution } from './JsExecution';

	const {
		execution,
	}: {
		execution: JsExecution;
	} = $props();

	function renderCode(node: HTMLElement, code: string) {
		function update(code: string): void {
			const prism = window.Prism;
			try {
				node.replaceChildren(sanitizeHTMLToDom(prism!.highlight(code, prism!.languages.javascript, 'javascript')));
			} catch (e) {
				console.warn('js-engine | failed to highlight code', e);
				node.textContent = code;
			}
		}

		update(code);
		return { update };
	}
</script>

<div>
	<h2>JS Execution Stats</h2>

	<p>Execution ID: {execution.uuid}</p>

	<h3>Code</h3>
	<pre class="language-js"><code class="language-js" use:renderCode={execution.code}></code></pre>

	<h3>Time</h3>
	<p>Build Time: {Math.round(execution.functionBuildTime ?? 0)} ms</p>
	<p>Execution Time: {Math.round(execution.functionRunTime ?? 0)} ms</p>

	<h3>Arguments</h3>
	<div class="markdown-rendered">
		<table>
			<thead>
				<tr>
					<th>Argument Name</th>
					<th>Value Type</th>
				</tr>
			</thead>
			<tbody>
				{#each Object.entries(execution.globals) as arg (arg[0])}
					<tr>
						<td>{arg[0]}</td>
						<td>{typeof arg[1]}</td>
					</tr>
				{:else}
					<tr>
						<td>none</td>
						<td>-</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<h3>Messages</h3>
	<div>
		{#each execution.getMessages() as messageWrapper, loopIndex (loopIndex)}
			<MessageComponent
				messageWrapper={messageWrapper}
				messageManager={execution.plugin.messageManager}
				showDeleteButton={false}
				showMessageSource={false}
			></MessageComponent>
		{:else}
			<p>None</p>
		{/each}
	</div>
</div>
