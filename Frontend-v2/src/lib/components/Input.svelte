<script lang="ts">
	import { slide } from "svelte/transition";

	export let type: "text" | "password";
	export let placeholder: string;
	export let required: boolean;
	export let validator: (value: string) => string | undefined;

	export let value: string = "";

	let validataionError: string | undefined = undefined;

	export let valid = validator(value) === undefined;
	$: valid = validataionError === undefined;
</script>

{#if type == "text"}
	<input
		type="text"
		{placeholder}
		{required}
		class="mb-1"
		bind:value
		on:keyup={() => {
			validataionError = validator(value);
		}}
	/>
{:else}
	<input
		type="password"
		{placeholder}
		{required}
		class="mb-1"
		bind:value
		on:keyup={() => {
			validataionError = validator(value);
		}}
	/>
{/if}

{#if validataionError}
	<p in:slide out:slide class="bg-red-700 p-2 rounded-md mb-2">
		{validataionError}
	</p>
{/if}
