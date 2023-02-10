<script lang="ts">
	export let searchables: { name: string; url: string }[];

	let searchTerm: string;

	let filteredSearchables = searchables;

	$: {
		if (searchTerm || searchTerm == "")
			filteredSearchables = searchables.filter((x) =>
				x.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
	}
</script>

<div class="m-auto w-64">
	<input
		type="text"
		placeholder="Search..."
		bind:value={searchTerm}
		class="text-stone-800 w-full block mb-2"
	/>

	<div
		class="overflow-y-auto max-h-[80vh] pr-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-thumb-rounded-full"
	>
		{#each filteredSearchables as searchable}
			<a
				href={searchable.url
					.replace("//", "/")
					.replace(/:\/[^\/]/, "://")}>{searchable.name}</a
			>
			<br />
		{/each}
	</div>
</div>
