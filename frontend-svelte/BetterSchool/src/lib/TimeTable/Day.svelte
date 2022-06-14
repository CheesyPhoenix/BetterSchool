<script>
	import Class from "./Class.svelte";

	export let dayName;
</script>

<div class="day">
	<div class="header">{dayName}</div>
	<Class name="Prod. og historiefortelling" />
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
