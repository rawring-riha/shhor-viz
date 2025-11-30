import { writable } from "svelte/store";

export const currentStep = writable("grayscale");
export const storyActive = writable(true);