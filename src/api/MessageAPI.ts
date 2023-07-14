import { API } from './API';
import { Message, MessageManager, MessageType, MessageWrapper } from '../messages/MessageManager';

export class MessageAPI {
	readonly apiInstance: API;
	readonly messageManager: MessageManager;

	constructor(apiInstance: API) {
		this.apiInstance = apiInstance;
		this.messageManager = apiInstance.plugin.messageManager;
	}

	createMessage(type: MessageType, title: string, content: string, code: string = ''): MessageWrapper {
		return this.messageManager.addMessage(new Message(type, title, content, code), this.apiInstance.instanceId);
	}
}
