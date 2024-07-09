import { setIcon } from 'obsidian';

export function useIcon(node: HTMLElement, icon: string): { update: (icon: string) => void } {
	setIcon(node, icon);
	return {
		update(icon: string): void {
			setIcon(node, icon);
		},
	};
}
