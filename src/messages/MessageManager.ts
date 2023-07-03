import {ExecutionContext} from '../ArgumentManager';
import {JsExecution} from '../JsEngine';
import {App, setIcon} from 'obsidian';
import JsEnginePlugin from '../main';

export enum MessageType {
	INFO = "info",
	TIP = "tip",
	SUCCESS = "success",
	WANING = "warning",
	ERROR = "error",
}

export const messageTypeOrder: MessageType[] = [
	MessageType.ERROR,
	MessageType.WANING,
	MessageType.SUCCESS,
	MessageType.TIP,
	MessageType.INFO,
]

export function mapMessageTypeToMessageIndicatorClass(messageType: MessageType): string {
	return `js-engine-message-indicator-mod-${messageType}`;
}

export class Message {
	type: MessageType;
	title: string;

	constructor(type: MessageType, title: string) {
		this.type = type;
		this.title = title;
	}
}

export class MessageWrapper {
	uuid: string;
	message: Message;
	activeExecutions: Map<string, JsExecution | undefined>;


	constructor(message: Message, activeExecutions: Map<string, JsExecution | undefined>) {
		this.message = message;
		this.activeExecutions = activeExecutions;

		this.uuid = self.crypto.randomUUID();
	}
}

export class MessageManager {
	/**
	 * Reference to the obsidian app.
	 */
	private readonly app: App;
	/**
	 * Reference the JS Engine plugin.
	 */
	private readonly plugin: JsEnginePlugin;

	messages: Map<string, MessageWrapper>;
	readonly statusBarItem: HTMLElement;


	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;

		this.messages = new Map<string, MessageWrapper>();
		this.statusBarItem = plugin.addStatusBarItem();
		this.updateStatusBarItem();
	}

	addMessage(message: Message): void {
		const activeExecutions: Map<string, JsExecution> = new Map(this.plugin.jsEngine?.activeExecutions);
		const messageWrapper = new MessageWrapper(message, activeExecutions);
		this.messages.set(messageWrapper.uuid, messageWrapper);
		this.updateStatusBarItem();
	}

	createMessage(type: MessageType, title: string): void {
		this.addMessage(new Message(type, title));
	}

	removeMessage(id: string): void {
		this.messages.delete(id);
	}

	private updateStatusBarItem(): void {
		this.statusBarItem.empty();
		this.statusBarItem.addClass('mod-clickable')

		const messageIcon = this.statusBarItem.createEl("div");
		setIcon(messageIcon, "message-square");

		const messageCountEl = this.statusBarItem.createEl('span');
		messageCountEl.addClass("js-engine-message-counter")
		messageCountEl.innerText = this.messages.size.toString();

		const messageTypeSet = new Set<string>(Array.from(this.messages.values()).map(x => x.message.type));
		for (const messageType of messageTypeOrder) {
			if (messageTypeSet.has(messageType)) {
				messageCountEl.addClass(mapMessageTypeToMessageIndicatorClass(messageType));
				break;
			}
		}
		if (messageTypeSet.size === 0) {
			messageCountEl.addClass("js-engine-message-indicator-mod-info");
		}
	}
}
