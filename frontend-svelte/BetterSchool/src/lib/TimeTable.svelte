<script>
	import Day from "./TimeTable/Day.svelte";

	const weekDays = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];
</script>

<div class="timeTable">
	<div class="table">
		{#each weekDays as wd}
			<Day dayName={wd} />
		{/each}
	</div>
</div>

<style>
	.timeTable {
		width: 100%;
		height: 80vh;
		display: flex;
		margin: 0;
		margin-top: 2em;
		justify-content: center;
		align-items: center;
	}
	.table {
		background-color: gray;
		height: 80%;
		width: 80%;
		display: flex;
		justify-content: center;
	}
</style>
