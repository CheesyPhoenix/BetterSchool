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
	let days = week.days;
	$: days = week.days;

	let dayIndex: number = 0;

	for (let i = 0; i < days.length; i++) {
		const day = days[i];

		if (new Date(day.date).getDay() == new Date().getDay()) {
			dayIndex = i;
			break;
		}
	}
</script>

<div class="weekNrCont">
	<h2 class="weekNr">{"Uke " + week.weekNr}</h2>
</div>
<div class="centerVertical">
	<div class="table">
		<Day day={days[dayIndex]} widthPer={100} />
	</div>
</div>

<style>
	.weekNrCont {
		width: 95%;
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
		width: 95%;
		display: flex;
		overflow-x: auto;
		border-radius: 15px;
	}
</style>
