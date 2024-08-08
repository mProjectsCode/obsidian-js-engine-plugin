/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Component, type SvelteComponent } from 'svelte';

export type AnyRecord = Record<string, any>;
export type UnknownRecord = Record<string, unknown>;
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

export type ComponentExports<Comp extends Component<any, any> | SvelteComponent> =
	Comp extends SvelteComponent<any, infer Exports> ? IfAny<Exports, AnyRecord, Exports> : AnyRecord;

export type MountedComponent<Comp extends Component<any, any> | SvelteComponent> = ComponentExports<Comp>;

export type AnySvelteComponent = Component<any, any>;
