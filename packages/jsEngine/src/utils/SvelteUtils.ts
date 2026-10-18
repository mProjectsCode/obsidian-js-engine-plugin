import type { Component, SvelteComponent } from 'svelte';

export type UnknownRecord = Record<string, unknown>;
export type AnyRecord = UnknownRecord;
export type ComponentExports<Comp extends AnySvelteComponent | SvelteComponent> = Comp extends AnySvelteComponent ? ReturnType<Comp> : Comp;

export type MountedComponent<Comp extends AnySvelteComponent | SvelteComponent> = ComponentExports<Comp>;

export type AnySvelteComponent = Component<never>;
