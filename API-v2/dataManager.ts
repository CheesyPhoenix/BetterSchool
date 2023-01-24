import { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";

interface SchoolClass {
	weeks: {
		weekNr: string;
		days: {
			name: string;
			date: string;
			classes: {
				date: string;
				time: string;
				room: string;
				name: string;
				teacher: string;
			}[];
		}[];
	}[];
	classID: string;
	className: string;
}

interface User {
	username: string;
	pass: string;
	classID: string;
	className: string;
	schoolID: string;
}

class DataManager {
	data: {
		classes: SchoolClass[];
		schoolName: string;
		schoolURL: string;
		schoolID: string;
	}[] = [];

	schools: { name: string; url: string }[] = [];

	users: User[] = [];

	constructor() {
		this.schools = this.readSchools();

		this.users = this.readUsers();

		this.update();
		setInterval(this.update, 60 * 60 * 1000);
	}

	readSchools(): { name: string; url: string }[] {
		return JSON.parse(Deno.readTextFileSync("./data/allSchools.json"));
	}

	readUsers(): {
		username: string;
		pass: string;
		classID: string;
		className: string;
		schoolID: string;
	}[] {
		return JSON.parse(Deno.readTextFileSync("./data/users.json"));
	}

	update() {
		console.log("Updating...");
	}
}

export { DataManager };
