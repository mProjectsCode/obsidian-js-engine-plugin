import type { API } from 'jsEngine/api/API';
import type { MessageManager, MessageType, MessageWrapper } from 'jsEngine/messages/MessageManager';
import { Message } from 'jsEngine/messages/MessageManager';
import { validateAPIArgs } from 'jsEngine/utils/Validators';
import * as z from 'zod';

export class MessageAPI {
	readonly apiInstance: API;
	readonly messageManager: MessageManager;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
		this.messageManager = apiInstance.plugin.messageManager;
	}

	public createMessage(type: MessageType, title: string, content: string, code: string = ''): MessageWrapper {
		validateAPIArgs(z.object({ type: this.apiInstance.validators.messageType, title: z.string(), content: z.string(), code: z.string() }), {
			type,
			title,
			content,
			code,
		});

		return this.messageManager.addMessage(new Message(type, title, content, code), this.apiInstance.instanceId);
	}

	public getMessageById(id: string): MessageWrapper | undefined {
		validateAPIArgs(z.object({ id: z.string() }), { id });

		return this.messageManager.messages.get().find(message => message.uuid === id);
	}

	public getMessagesForInstance(): MessageWrapper[] {
		return this.messageManager.getMessagesFromSource(this.apiInstance.instanceId);
	}
}
