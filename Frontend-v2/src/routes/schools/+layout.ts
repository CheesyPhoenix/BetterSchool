import type { LayoutLoad } from "./$types";
import { env } from "$env/dynamic/public";

export const load: LayoutLoad = async ({ fetch }) => {
	const res = await fetch(
		`${env.PUBLIC_API_URL ?? "https://api.betterschool.chph.tk"}/schools`
	);

	let schools: App.School[] = await res.json();
	schools = schools.sort((a, b) => a.name.localeCompare(b.name));

	return { schools };
};
