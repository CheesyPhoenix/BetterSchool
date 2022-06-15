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
		var date = new Date();
		date.setHours(0, 0, 0, 0);
		// Thursday in current week decides the year.
		date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
		// January 4 is always in week 1.
		var week1 = new Date(date.getFullYear(), 0, 4);
		// Adjust to Thursday in week 1 and count number of weeks from date to week1.
		return (
			1 +
			Math.round(
				((date.getTime() - week1.getTime()) / 86400000 -
					3 +
					((week1.getDay() + 6) % 7)) /
					7
			)
		);
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
		margin: auto;
		width: 90%;
		display: flex;
		justify-content: center;
		overflow: hidden;
		border-radius: 15px;
	}
</style>
