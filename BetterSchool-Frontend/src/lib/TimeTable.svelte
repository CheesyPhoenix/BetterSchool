<script lang="ts">
	import Day from "./TimeTable/Day.svelte";

	interface Week {
		weekNr: string;
		days: {
			name: string;
			classes: {
				date: string;
				time: string;
				room: string;
				name: string;
			}[];
		}[];
	}

	function getWeekNr() {
		const currentdate = new Date();
		const oneJan = new Date(currentdate.getFullYear(), 0, 1);
		const numberOfDays = Math.floor(
			(currentdate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
		);
		const result = Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);

		return result;
	}

	const weekP = (async (): Promise<Week> => {
		const res = await fetch("https://api.betterschool.cheesyphoenix.tk");
		const weeks: Week[] = await res.json();

		const weekNr = getWeekNr().toString();

		for (let i = 0; i < weeks.length; i++) {
			const week = weeks[i];
			if (week.weekNr == weekNr) return week;
		}

		return weeks[0];
	})();
</script>

{#await weekP then week}
	<div class="weekNrCont">
		<h3 class="weekNr">{"Uke " + week.weekNr}</h3>
	</div>

	<div class="table">
		{#each week.days as wd}
			<Day day={wd} />
		{/each}
	</div>
{/await}

<style>
	.weekNrCont {
		width: 90%;
		margin: auto;
	}

	.table {
		background-color: gray;
		margin: auto;
		width: 90%;
		display: flex;
		justify-content: center;
	}
</style>
