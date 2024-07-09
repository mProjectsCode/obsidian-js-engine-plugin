import { type API } from 'jsEngine/api/API';
import { Message, type MessageManager, type MessageType, type MessageWrapper } from 'jsEngine/messages/MessageManager';

export class MessageAPI {
	readonly apiInstance: API;
	readonly messageManager: MessageManager;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
		this.messageManager = apiInstance.plugin.messageManager;
	}

	public createMessage(type: MessageType, title: string, content: string, code: string = ''): MessageWrapper {
		return this.messageManager.addMessage(new Message(type, title, content, code), this.apiInstance.instanceId);
	}

	public getMessageById(id: string): MessageWrapper | undefined {
		return this.messageManager.messages.get().get(id);
	}

	public getMessagesForInstance(): MessageWrapper[] {
		return this.messageManager.getMessagesFromSource(this.apiInstance.instanceId);
	}
}
