<script>
	import { fly } from "svelte/transition";
</script>

<svelte:head>
	<title>BetterSchool</title>
</svelte:head>

<main in:fly={{ y: 100 }} out:fly={{ y: -100 }} class="absolute w-screen">
	<div class="m-4 overflow-y-auto max-screenHeight">
		<h1 class="text-3xl font-bold m-auto max-w-[max-content] mt-12">
			BetterSchool
		</h1>
		<h3 class="max-w-[max-content] m-auto">
			The better alternative to Visma Inschool
		</h3>

		<br />

		<div class="max-w-md m-auto flex">
			<p class="inline-block">
				BetterSchool is a better way of viewing your Visma InSchool
				schedule. Don't waste time logging in to the app every time you
				just want to check when your next class starts, use BetterSchool
				instead!
			</p>
		</div>

		<br />

		<a href="/schools" class="btn max-w-md m-auto">Get started!</a>

		<br />
		<br />
		<br />

		<h2 class="m-auto max-w-md text-xl font-bold mb-2">
			Are you a developer?
		</h2>
		<p class="m-auto max-w-md">
			This is an open-source project on <a
				href="https://github.com/CheesyPhoenix/BetterSchool"
				class="underline">GitHub</a
			>, feel free to contribute, fork or open an issue. All help is
			greatly appreciated.

			<br />
			<br />

			You can even self-host your own instance of both the API and
			frontend using docker. Check out the
			<a
				href="https://github.com/CheesyPhoenix/BetterSchool"
				class="underline">GitHub page</a
			>
			for more information.
		</p>
	</div>
</main>
