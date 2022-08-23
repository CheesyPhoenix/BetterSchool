<script lang="ts">
	import Day from "./TimeTable/Day.svelte";
	import { fly, fade } from "svelte/transition";

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

	export let swipeOffset: number;
</script>

<div class="weekNrCont">
	<h2 class="weekNr">{"Uke " + week.weekNr}</h2>
</div>
{#key week}
	<div class="centerVertical" out:fly={{ x: swipeOffset }} in:fade>
		<div class="table">
			{#each days as wd}
				<Day day={wd} widthPer={20} />
			{/each}
		</div>
	</div>
{/key}

<style>
	.weekNrCont {
		width: 90%;
		margin: auto;
		margin-left: 6%;
		margin-right: 67px;
		position: absolute;
		z-index: 1;
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
