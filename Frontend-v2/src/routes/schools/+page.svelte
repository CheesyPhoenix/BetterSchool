<script lang="ts">
	import Search from "$lib/components/Search/Search.svelte";
	import type { PageData } from "./$types";
	import { headerText } from "$lib/stores/header";
	import { fly } from "svelte/transition";

	$headerText = [{ text: "Schools" }];

	export let data: PageData;
</script>

<main
	in:fly={{ y: 100 }}
	out:fly={{ y: -100 }}
	class="absolute w-screen top-16 h-[calc(100vh-8rem)]"
>
	<Search
		searchables={data.schools.map((x) => {
			return { name: x.name, url: `/schools/${x.schoolID}` };
		})}
	/>
</main>
