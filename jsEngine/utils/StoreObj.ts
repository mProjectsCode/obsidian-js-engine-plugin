import { type Subscriber, type Unsubscriber, type Writable } from 'svelte/store';

export type Store<T> = Writable<T> & {
	get(): T;
	notify(): void;
};

export function store<T>(value: T): Store<T> {
	return new StoreObj<T>(value);
}

declare type Invalidator<T> = (value?: T) => void;

export class StoreObj<T> implements Store<T> {
	private value: T;
	private subscriberCounter: number;
	private subscribers: Map<number, Subscriber<T>>;

	constructor(value: T) {
		this.value = value;
		this.subscriberCounter = 0;
		this.subscribers = new Map<number, Subscriber<T>>();
	}

	set(newValue: T): void {
		// console.log('set');
		if (this.value !== newValue) {
			this.value = newValue;
			this.notify();
		}
	}

	update(fn: (origValue: T) => T): void {
		this.set(fn(this.value));
	}

	get(): T {
		return this.value;
	}

	subscribe(run: Subscriber<T>, _?: Invalidator<T>): Unsubscriber {
		const subscriberId = this.subscriberCounter;
		this.subscriberCounter += 1;
		// console.trace('sub', subscriberId);

		this.subscribers.set(subscriberId, run);
		run(this.value);

		return () => {
			// console.trace('unsub', subscriberId);
			this.subscribers.delete(subscriberId);
		};
	}

	notify(): void {
		for (const subscriber of this.subscribers.values()) {
			// console.log('notify');
			subscriber(this.value);
		}
	}
}
