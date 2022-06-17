<script lang="ts">
	import Day from "./TimeTable/Day.svelte";

	interface Week {
		weekNr: string;
		days: {
			name: string;
			date: string;
			classes: {
				date: string;
				time: string;
				room: string;
				name: string;
			}[];
		}[];
	}

	export let week: Week;
	$: days = week.days;
</script>

<div class="weekNrCont">
	<h3 class="weekNr">{"Uke " + week.weekNr}</h3>
</div>
<div class="centerVertical">
	<div class="table">
		{#each days as wd}
			<Day day={wd} />
		{/each}
	</div>
</div>

<style>
	.weekNrCont {
		width: 90%;
		margin: auto;
	}

	.centerVertical {
		display: flex;
		justify-content: center;
		height: 100vh;
		position: absolute;
		width: 100vw;
		margin: 0;
		left: 0;
		top: 0;
	}

	.table {
		margin: auto;
		width: 90%;
		margin-left: 67px;
		margin-right: 67px;
		display: flex;
		overflow-x: auto;
		border-radius: 15px;
	}
</style>
