<script lang="ts">
	import { headerText } from "$lib/stores/header";
</script>

<header
	class="w-screen h-16 p-2 z-10 flex flex-col justify-center font-bold absolute"
>
	<div>
		<h1 class="inline text-2xl hover:underline">
			<a href="/">BetterSchool</a>
		</h1>
		<br />
		{#if $headerText}
			<h2 class="inline ml-2 text-sm">
				{#each $headerText as text, i}
					<a href={text.url} class={text.url ? "hover:underline" : ""}
						>{text.text}</a
					>
					<p class="inline opacity-40">
						{i < $headerText.length - 1 ? " / " : ""}
					</p>
				{/each}
			</h2>
		{/if}
	</div>
</header>

<div class="h-16 mb-2" />

<slot />
