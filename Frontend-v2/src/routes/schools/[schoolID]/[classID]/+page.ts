import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch, parent }) => {
	const res = await fetch(
		`https://api.betterschool.chph.tk/school/${params.schoolID}/class/${params.classID}`
	);
	if (res.status == 404) throw error(404, "Not found");
	const weeks: App.Week[] = await res.json();

	const data = await parent();

	const className = data.classes.filter((x) => x.classID == params.classID)[0]
		.className;

	return { weeks, className };
};
