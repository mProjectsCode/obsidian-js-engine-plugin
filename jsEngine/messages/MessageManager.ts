import type { InstanceId } from 'jsEngine/api/InstanceId';
import type JsEnginePlugin from 'jsEngine/main';
import { MessageDisplay } from 'jsEngine/messages/MessageDisplay';
import { Signal } from 'jsEngine/utils/Signal';
import { iteratorToArray } from 'jsEngine/utils/Util';
import type { Moment } from 'moment';
import type { App } from 'obsidian';
import { moment, setIcon } from 'obsidian';

export enum MessageType {
	INFO = 'info',
	TIP = 'tip',
	SUCCESS = 'success',
	WANING = 'warning',
	ERROR = 'error',
}

export const messageTypeOrder: MessageType[] = [MessageType.ERROR, MessageType.WANING, MessageType.SUCCESS, MessageType.TIP, MessageType.INFO];

export function mapMessageTypeToClass(messageType: MessageType): string {
	return `js-engine-message-mod-${messageType}`;
}

export function mapMessageTypeToIcon(messageType: MessageType): string {
	const map: Map<MessageType, string> = new Map<MessageType, string>();

	map.set(MessageType.ERROR, 'zap');
	map.set(MessageType.WANING, 'alert-triangle');
	map.set(MessageType.SUCCESS, 'check');
	map.set(MessageType.TIP, 'flame');
	map.set(MessageType.INFO, 'info');

	return map.get(messageType) ?? 'info';
}

export function mapMessageTypeToMessageIndicatorClass(messageType: MessageType): string {
	return `js-engine-message-indicator-mod-${messageType}`;
}

export class Message {
	type: MessageType;
	title: string;
	content: string;
	code: string;

	constructor(type: MessageType, title: string, content: string, code: string) {
		this.type = type;
		this.title = title;
		this.content = content;
		this.code = code;
	}
}

export class MessageWrapper {
	uuid: string;
	source: InstanceId;
	message: Message;
	time: Moment;

	constructor(message: Message, source: InstanceId) {
		this.message = message;
		this.source = source;

		this.uuid = self.crypto.randomUUID();
		this.time = moment();
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

	messages: Signal<MessageWrapper[]>;

	statusBarItem: HTMLElement | undefined;
	private messageDisplay: MessageDisplay | undefined;

	constructor(app: App, plugin: JsEnginePlugin) {
		this.app = app;
		this.plugin = plugin;

		this.messages = new Signal<MessageWrapper[]>([]);
	}

	initStatusBarItem(): void {
		this.messageDisplay = new MessageDisplay(this.app, this.plugin);

		this.statusBarItem = this.plugin.addStatusBarItem();

		this.statusBarItem.addClass('mod-clickable');
		this.statusBarItem.addEventListener('click', () => {
			this.messageDisplay?.open();
		});

		this.updateStatusBarItem();
		this.messages.registerListener({
			callback: () => {
				this.updateStatusBarItem();
			},
		});
	}

	addMessage(message: Message, source: InstanceId): MessageWrapper {
		const messageWrapper = new MessageWrapper(message, source);

		this.messages.update(messages => {
			messages.push(messageWrapper);
			return messages;
		});

		return messageWrapper;
	}

	removeMessage(id: string): void {
		this.messages.update(messages => {
			return messages.filter(x => x.uuid !== id);
		});
	}

	removeAllMessages(): void {
		this.messages.set([]);
	}

	private updateStatusBarItem(): void {
		if (!this.statusBarItem) {
			return;
		}

		this.statusBarItem.empty();

		const messageIcon = this.statusBarItem.createEl('div');
		setIcon(messageIcon, 'message-square');

		const messageCountEl = this.statusBarItem.createEl('span');
		messageCountEl.addClass('js-engine-message-counter');
		messageCountEl.innerText = this.messages.get().length.toString();

		const messageTypeSet = new Set<string>(Array.from(this.messages.get().values()).map(x => x.message.type));
		for (const messageType of messageTypeOrder) {
			if (messageTypeSet.has(messageType)) {
				messageCountEl.addClass(mapMessageTypeToMessageIndicatorClass(messageType));
				break;
			}
		}
		if (messageTypeSet.size === 0) {
			messageCountEl.addClass('js-engine-message-indicator-mod-info');
		}
	}

	getMessagesFromSource(source: InstanceId): MessageWrapper[] {
		const messages = this.messages.get();
		return iteratorToArray(messages.values()).filter(x => x.source.id === source.id);
	}
}
