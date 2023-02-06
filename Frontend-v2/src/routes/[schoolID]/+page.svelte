<script lang="ts">
	import type { PageData } from "./$types";
	import { page } from "$app/stores";
	import Search from "$lib/components/Search.svelte";

	import { headerText } from "$lib/stores/header";

	export let data: PageData;

	$headerText = [{ text: data.schoolName, url: "/" }];
</script>

<Search
	searchables={data.classes.map((x) => {
		return { name: x.className, url: $page.url.pathname + "/" + x.classID };
	})}
/>
