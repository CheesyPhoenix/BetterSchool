<script lang="ts">
	export let classOb: {
		dato: string;
		time: string;
		room: string;
		name: string;
	};

	const timeStart = classOb.time.split("-")[0];
	const timeSlutt = classOb.time.split("-")[1];

	const scale = 80;

	const distTop =
		(parseInt(timeStart.split(":")[0]) +
			parseFloat(timeStart.split(":")[1]) / 60 -
			8) *
		scale;

	const height =
		(parseInt(timeSlutt.split(":")[0]) +
			parseFloat(timeSlutt.split(":")[1]) / 60 -
			8) *
			scale -
		distTop;
</script>

<div class="class" style="top: {distTop}px; height: {height}px">
	<p class="time">{classOb.time} - Rom: 352</p>
	<h5 class="name">{classOb.name}</h5>
</div>

<style>
	.class {
		background-color: white;
		width: 100%;
		padding-left: 0.5em;
		margin-top: 1em;
		position: absolute;
	}

	.name {
		margin-top: 2px;
		margin-bottom: 0;
		color: #39444b;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		margin-right: 5px;
	}

	.time {
		margin-top: 0;
		margin-bottom: 0;
		font-size: 12px;
		color: #52606a;
	}
</style>
