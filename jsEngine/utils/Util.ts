export function iteratorToArray<T>(iterator: Iterable<T>): T[] {
	return [...iterator];
}

export enum ButtonStyleType {
	DEFAULT = 'default',
	PRIMARY = 'primary',
	DESTRUCTIVE = 'destructive',
	PLAIN = 'plain',
}
