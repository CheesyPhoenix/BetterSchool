import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(
		`https://api.betterschool.chph.tk/school/${params.schoolID}/classes`
	);
	let classes: App.Class[] = await res.json();
	classes = classes.sort((a, b) => a.className.localeCompare(b.className));

	return { classes };
};
