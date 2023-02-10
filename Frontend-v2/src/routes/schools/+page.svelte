<script lang="ts">
	import Search from "$lib/components/Search.svelte";
	import type { PageData } from "./$types";
	import { headerText } from "$lib/stores/header";

	$headerText = [{ text: "Schools" }];

	export let data: PageData;
</script>

<Search
	searchables={data.schools.map((x) => {
		return { name: x.name, url: `/schools/${x.schoolID}` };
	})}
/>
