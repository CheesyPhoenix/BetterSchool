<script lang="ts">
	import { isMobile } from "$lib/stores/isMobile";
	import { inview } from "svelte-inview";

	let isInView: boolean;

	export let name: string;
	export let url: string;
	export let parent: HTMLElement;
</script>

<a
	use:inview={{
		root: parent,
		threshold: 0.2,
		rootMargin: "0px 0px -40px 0px",
	}}
	on:change={(e) => {
		isInView = e.detail.inView;
	}}
	class="{$isMobile == true
		? 'p-4'
		: 'p-2'} bg-[#444] block mb-2 rounded-lg duration-200 w-full hover:bg-[#666] {isInView
		? 'opacity-100'
		: 'opacity-0'}"
	href={url}>{name}</a
>
