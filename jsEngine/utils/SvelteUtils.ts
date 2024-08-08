/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument */

import { mount, type Component, type ComponentProps, type SvelteComponent } from 'svelte';

export function customMount<Comp extends Component<any, any> | SvelteComponent>(
	component: Component<any, any> | SvelteComponent,
	target: HTMLElement,
	props: ComponentProps<Comp>,
): ComponentExports<Comp> {
	return mount(component as any, { target, props });
}

export type AnyRecord = Record<string, any>;
export type UnknownRecord = Record<string, unknown>;

export type ComponentExports<Comp extends Component<any, any> | SvelteComponent> =
	Comp extends SvelteComponent<any, infer Exports> ? (Exports extends any ? AnyRecord : Exports) : AnyRecord;

export type MountedComponent<Comp extends Component<any, any> | SvelteComponent> = ComponentExports<Comp>;
