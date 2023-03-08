<script lang="ts">
	import { isMobile } from "$lib/stores/isMobile";
	import { mobileThreshold } from "./timetable/shared";

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
	$: mobileMode = screenWidth < mobileThreshold;
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="m-auto max-w-md pl-4">
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
		class="overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-thumb-rounded-full mb-2 pr-4"
	>
		{#each filteredSearchables as searchable}
			<a
				class="{$isMobile == true
					? 'p-4'
					: 'p-2'} bg-[#444] block mb-2 rounded-lg duration-200 w-full hover:bg-[#666]"
				href={searchable.url
					.replace("//", "/")
					.replace(/:\/[^\/]/, "://")}>{searchable.name}</a
			>
		{/each}
	</div>
</div>
