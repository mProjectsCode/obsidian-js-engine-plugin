export function iteratorToArray<T>(iterator: Iterable<T>): T[] {
	return [...iterator];
}

export enum ButtonStyleType {
	DEFAULT = 'default',
	PRIMARY = 'primary',
	DESTRUCTIVE = 'destructive',
	PLAIN = 'plain',
}

export function mod(a: number, b: number): number {
	return ((a % b) + b) % b;
}
