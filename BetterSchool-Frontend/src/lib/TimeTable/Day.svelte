<script lang="ts">
	import { onMount } from "svelte";

	import Class from "./Class.svelte";

	export let day: {
		name: string;
		classes: { date: string; time: string; room: string; name: string }[];
	};

	let dayName = day.name;
	let dayDate = day.classes[0].date;

	let classes = day.classes;
	$: classes = day.classes;

	let dateOb =
		classes.length == 0 ? undefined : new Date(day.classes[0].date);
	$: {
		dateOb =
			classes.length == 0 ? undefined : new Date(day.classes[0].date);
	}

	const todayDate = new Date();

	let bgColor = "#595959";
	let today = false;

	$: {
		if (
			dateOb &&
			dateOb.getDate() == todayDate.getDate() &&
			dateOb.getMonth() == todayDate.getMonth() &&
			dateOb.getFullYear() == todayDate.getFullYear()
		) {
			bgColor = "#696969";
			today = true;
		} else {
			bgColor = "#595959";
			today = false;
		}
	}

	onMount(() => {
		let blurred = false;
		window.addEventListener("blur", () => {
			blurred = true;
		});

		let refocusTimeout = false;

		window.addEventListener("focus", () => {
			if (refocusTimeout) return;

			refocusTimeout = true;
			setTimeout(() => {
				refocusTimeout = false;
			}, 60 * 1000);

			const todayDate = new Date();

			if (blurred) {
				if (
					dateOb.getDate() == todayDate.getDate() &&
					dateOb.getMonth() == todayDate.getMonth() &&
					dateOb.getFullYear() == todayDate.getFullYear()
				) {
					bgColor = "#696969";
					today = true;
				} else {
					today = false;
					bgColor = "#595959";
				}
			}
		});
	});
</script>

<div class="day" style="background-color: {bgColor};">
	<div class="header">{dayName} {dayDate}</div>
	<div class="classes">
		{#each classes as classOb}
			<Class {classOb} {today} />
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
		width: 20%;
		padding: 1em;
	}

	.classes {
		position: relative;
		height: 700px;
	}
</style>
