import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(
		`https://api.betterschool.chph.tk/school/${params.schoolID}/class/${params.classID}`
	);

	const weeks: App.Week[] = await res.json();

	return { weeks };
};
