import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch }) => {
	const res = await fetch("https://api.betterschool.chph.tk/schools");
	let schools: App.School[] = await res.json();
	schools = schools.sort((a, b) => a.name.localeCompare(b.name));

	return { schools };
};
