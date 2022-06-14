<script>
	import { dataset_dev } from "svelte/internal";

	import Class from "./Class.svelte";

	export let day;

	const dayName = day.name;
	const classes = day.classes;
</script>

<div class="day">
	<div class="header">{dayName}</div>
	{#each classes as classOb}
		<Class name={classOb.name} />
	{/each}
</div>

<style>
	.header {
		width: 100%;
		height: 1em;
		text-align: center;
	}
	.day {
		background-color: aquamarine;
		width: 20%;
		padding: 1em;
	}
</style>
