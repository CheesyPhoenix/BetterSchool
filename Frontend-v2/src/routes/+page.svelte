<script>
	import { fly } from "svelte/transition";
</script>

<main in:fly={{ y: 100 }} out:fly={{ y: -100 }} class="absolute w-screen">
	<h1 class="text-3xl font-bold m-auto w-max mt-12">BetterSchool</h1>
	<h3 class="w-max m-auto">The better alternative to Visma Inschool</h3>

	<br />

	<a
		href="/schools"
		class="w-max m-auto block bg-zinc-500 p-2 rounded-xl hover:bg-zinc-400 hover:rounded-lg active:bg-zinc-600 active:top-4 duration-150"
		>Get started!</a
	>
</main>
