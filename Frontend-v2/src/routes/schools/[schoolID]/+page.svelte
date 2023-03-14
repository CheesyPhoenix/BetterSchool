<script lang="ts">
	import type { PageData } from "./$types";
	import { page } from "$app/stores";
	import Search from "$lib/components/Search/Search.svelte";

	import { headerText } from "$lib/stores/header";
	import { fly } from "svelte/transition";

	export let data: PageData;

	$headerText = [
		{ text: "Schools", url: "/schools" },
		{ text: data.schoolName },
	];
</script>

<main
	in:fly={{ y: 100 }}
	out:fly={{ y: -100 }}
	class="absolute w-screen top-16"
>
	<Search
		searchables={data.classes.map((x) => {
			return {
				name: x.className,
				url: $page.url.pathname + "/" + x.classID,
			};
		})}
	>
		<a
			href={($page.url.pathname + "/addClass")
				.replace("//", "/")
				.replace(/:\/[^\/]/, "://")}
			class="bg-stone-800 w-full block mb-2 p-2 text-center rounded-xl hover:bg-stone-700 active:rounded-sm active:bg-stone-600 duration-200"
			>Your class not listed? Add it!</a
		>
	</Search>
</main>
