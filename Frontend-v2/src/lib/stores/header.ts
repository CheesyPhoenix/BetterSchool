import { writable } from "svelte/store";

export const headerText = writable<{ text: string; url?: string }[]>();
