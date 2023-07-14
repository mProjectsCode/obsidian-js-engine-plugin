export function iteratorToArray<T>(iterator: Iterable<T>): T[] {
	return [...iterator];
}
