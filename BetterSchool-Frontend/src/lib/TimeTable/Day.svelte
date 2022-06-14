<script>
	import Class from "./Class.svelte";

	export let day;

	const dayName = day.name;
	const classes = day.classes;
</script>

<div class="day">
	<div class="header">{dayName}</div>
	<div class="classes">
		{#each classes as classOb}
			<Class {classOb} />
		{/each}
	</div>
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

	.classes {
		position: relative;
		height: 700px;
	}
</style>
