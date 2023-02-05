<script lang="ts">
	import type { PageData } from "./$types";

	export let data: PageData;
</script>

{#each data.classes as _class}
	<a href={location.href + "/" + _class.classID}>{_class.className}</a>
	<br />
{/each}
