import { error } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { env } from "$env/dynamic/public";

export const load: LayoutLoad = async ({ params, fetch, parent }) => {
	const res = await fetch(
		`${env.PUBLIC_API_URL ?? "https://api.betterschool.chph.tk"}/school/${
			params.schoolID
		}/classes`
	);
	if (res.status == 404) throw error(404, "Not found");

	let classes: App.Class[] = await res.json();
	classes = classes.sort((a, b) => a.className.localeCompare(b.className));

	const data = await parent();
	const schoolName = data.schools.filter(
		(x) => x.schoolID == params.schoolID
	)[0].name;

	return { classes, schoolName, schoolID: params.schoolID };
};
