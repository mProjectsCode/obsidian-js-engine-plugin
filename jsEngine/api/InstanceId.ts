export enum InstanceType {
	JS_EXECUTION = 'JS_EXECUTION',
	PLUGIN = 'PLUGIN',
}

/**
 * Identifies an instance of the API.
 *
 * For the API passed into a JsExecution this is the id of the JsExecution itself.
 */
export class InstanceId {
	readonly name: InstanceType | string;
	readonly id: string;

	constructor(name: InstanceType | string, id: string) {
		this.name = name;
		this.id = id;
	}

	toString(): string {
		return `plugin:js-engine:${this.name}:${this.id}`;
	}

	static create(name: string): InstanceId {
		return new InstanceId(name, self.crypto.randomUUID());
	}
}
