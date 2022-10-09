<script lang="ts">
	import { onMount } from "svelte";

	export let classOb: {
		date: string;
		time: string;
		room: string;
		name: string;
		teacher: string;
	};
	export let today: boolean;

	let timeStart = classOb.time.split("-")[0];
	let timeSlutt = classOb.time.split("-")[1];

	$: {
		timeStart = classOb.time.split("-")[0];
		timeSlutt = classOb.time.split("-")[1];
	}

	export let dayHeight;

	//const scale = 80;
	$: scale = dayHeight / 8.25;

	// total height / 8.25 (from 8:00 - 16:15) = scale

	$: distTop =
		(parseInt(timeStart.split(":")[0]) +
			parseFloat(timeStart.split(":")[1]) / 60 -
			8) *
		scale;

	$: height =
		(parseInt(timeSlutt.split(":")[0]) +
			parseFloat(timeSlutt.split(":")[1]) / 60 -
			8) *
			scale -
		distTop;

	// check if class is currently active
	const todayDate = new Date();

	let timeStartDate = new Date(todayDate.toDateString() + " " + timeStart);
	let timeSluttDate = new Date(todayDate.toDateString() + " " + timeSlutt);

	$: {
		timeStartDate = new Date(todayDate.toDateString() + " " + timeStart);
		timeSluttDate = new Date(todayDate.toDateString() + " " + timeSlutt);
	}

	let classActive = false;

	$: {
		if (
			today &&
			todayDate.getTime() > timeStartDate.getTime() &&
			todayDate.getTime() < timeSluttDate.getTime()
		) {
			classActive = true;
		}
	}

	$: active = classActive ? "active" : "";
	$: cancelled = classOb.room.toLowerCase() == "utgår" ? "cancelled" : "";

	onMount(() => {
		const interval = setInterval(() => {
			const todayDate = new Date();

			if (
				today &&
				todayDate.getTime() > timeStartDate.getTime() &&
				todayDate.getTime() < timeSluttDate.getTime()
			) {
				classActive = true;
			} else {
				classActive = false;
			}
		}, 5 * 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div
	class="class {active} {cancelled}"
	style="top: {distTop}px; height: {height}px"
>
	<div class="time">
		<p class="bold">{classOb.time}</p>
		- Rom:
		<p class="bold">{classOb.room}</p>
	</div>
	<h5 class="name">{classOb.name}</h5>
	<p class="teacher">{classOb.teacher}</p>
</div>

<style>
	.class {
		background-color: #d9d9d9;
		width: calc(100% - 1em - 5px);
		padding-left: 0.5em;
		padding-right: 0.5em;
		position: absolute;
		border-radius: 10px;
		border-bottom-left-radius: 2px;
		border-top-left-radius: 2px;

		border-left: solid 5px #39444b;
	}
	.active {
		border-color: #27a300;
		background-color: #fbfbfb;
	}

	.cancelled {
		border-color: #a71900 !important;
		background-color: #a5a5a5 !important;
	}

	.name {
		margin-top: 2px;
		margin-bottom: 0;
		color: #39444b;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		margin-right: 5px;
		font-size: 14px;
	}

	.time {
		margin-top: 0;
		margin-bottom: 0;
		font-size: 12px;
		color: #52606a;
		display: inline;
	}

	.bold {
		font-weight: bold;
		display: inline;
		font-size: 13px;
	}

	.teacher {
		color: #666;
		display: inline;
		font-size: 13px;
		font-weight: 600;
	}
</style>
