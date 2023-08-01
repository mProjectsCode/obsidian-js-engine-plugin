<script lang="ts">

	import {JsExecution} from './JsExecution';
	import MessageComponent from '../messages/MessageComponent.svelte';

	export let execution: JsExecution;
	let messages = execution.getMessages();
</script>

<div>
    <h2>JS Execution Stats</h2>

    <p>Execution ID: {execution.uuid}</p>
    <p>Code</p>
    <pre class="language-none"><code>{execution.code}</code></pre>

	<h3>Time</h3>
	<p>Build Time: {Math.round(execution.functionBuildTime)} ms</p>
	<p>Execution Time: {Math.round(execution.functionRunTime)} ms</p>

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
            {#each execution.args as arg (arg.key)}
                <tr>
                    <td>{arg.key}</td>
                    <td>{typeof arg.value}</td>
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
        {#each messages as messageWrapper}
            <MessageComponent messageWrapper={messageWrapper} messageManager={execution.plugin.messageManager}
                              showDeleteButton={false} showMessageSource={false}></MessageComponent>
        {:else}
            <p>None</p>
        {/each}
    </div>
</div>

