<script lang="ts">
	import { isMobile } from "$lib/stores/isMobile";
	import { mobileThreshold } from "../timetable/shared";
	import SearchElement from "./SearchElement.svelte";

	export let searchables: { name: string; url: string }[];

	let searchTerm: string;

	let filteredSearchables = searchables;

	$: {
		if (searchTerm || searchTerm == "")
			filteredSearchables = searchables.filter((x) =>
				x.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
	}

	let screenWidth = 0;

	let searchablesContainer: HTMLElement;
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="m-auto max-w-md pl-4 h-full">
	<div class="pr-4">
		<input
			type="text"
			placeholder="Search..."
			bind:value={searchTerm}
			class="w-full"
		/>

		<slot />
	</div>

	<div
		bind:this={searchablesContainer}
		class="overflow-y-auto h-[90%] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-thumb-rounded-full mb-2 pr-4"
	>
		{#each filteredSearchables as searchable}
			<SearchElement
				url={searchable.url
					.replace("//", "/")
					.replace(/:\/[^\/]/, "://")}
				name={searchable.name}
				parent={searchablesContainer}
			/>
		{/each}
	</div>
</div>

<style>
</style>
