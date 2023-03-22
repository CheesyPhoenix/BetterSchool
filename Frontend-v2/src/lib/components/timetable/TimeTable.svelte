<script lang="ts">
	import Day from "./Day.svelte";
	import { fly, fade } from "svelte/transition";
	import { getWeekNr } from "./shared";

	export let week: App.Week;
	$: days = week.days;

	export let swipeOffset: number;

	const now = new Date();

	const nowFormatted = `${now.getDate()}.${
		now.getMonth() + 1
	}.${now.getFullYear()}, uke ${getWeekNr()}`;

	export let className: string;
</script>

<div class="absolute right-[7%] top-0">
	<h2 class="weekNr">{"Uke " + week.weekNr} - {className}</h2>
	<h5 class="nowDate">Dato: {nowFormatted}</h5>
</div>
{#key days}
	<div
		class="centerVertical"
		out:fly={{ x: swipeOffset, duration: 500, opacity: 0 }}
		in:fly={{ x: -swipeOffset, duration: 500, opacity: 1 }}
	>
		<div class="table">
			{#each days as wd}
				<Day day={wd} widthPer={20} singleDay={false} />
			{/each}
		</div>
	</div>
{/key}

<style>
	.centerVertical {
		display: flex;
		justify-content: center;
		height: 100vh;
		position: absolute;
		width: 100vw;
		margin: 0;
		left: 0;
		top: 0;
		min-height: 710px;
	}

	.table {
		margin: auto;
		width: 90%;
		margin-left: 67px;
		margin-right: 67px;
		display: flex;
		overflow: auto;
		border-radius: 15px;
		margin-top: 5em;
		margin-bottom: 3em;
	}

	.weekNr {
		margin-bottom: 0;
		margin-top: 0.5em;
		font-size: 1.5em;
		font-weight: bold;
	}
	.nowDate {
		font-size: 0.83em;
		font-weight: bold;
	}
</style>
