<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/betterschool-icon-32.png";
</script>

<svelte:head>
	<link rel="shortcut icon" href={favicon} type="image/x-icon" />
</svelte:head>

<slot />
