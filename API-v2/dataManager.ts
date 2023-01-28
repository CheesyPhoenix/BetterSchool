import { IDManager } from "./idManager.ts";
import { School, SchoolClass, User } from "./types.d.ts";
class DataManager {
	private data: {
		classes: SchoolClass[];
		schoolName: string;
		schoolURL: string;
		schoolID: string;
	}[] = [];

	private idManager: IDManager;
	private _schools: School[] = [];

	constructor() {
		this.idManager = new IDManager("./data/ids.json");

		try {
			this._schools = JSON.parse(
				Deno.readTextFileSync("./data/schools.json")
			);
		} catch (error) {
			this._schools = [];
			this.importSchools();
		}

		this.update();
		setInterval(this.update, 60 * 60 * 1000);
	}

	private async importSchools() {
		const importedSchools = JSON.parse(
			Deno.readTextFileSync("./data/allSchools.json")
		) as { name: string; url: string }[];

		for (const school of importedSchools) {
			this.schools.push({
				id: await this.idManager.newUUID(),
				...school,
			});
		}

		Deno.writeTextFileSync(
			"./data/schools.json",
			JSON.stringify(this._schools)
		);
	}

	private readUsers(): User[] {
		return JSON.parse(Deno.readTextFileSync("./data/users.json"));
	}

	private update() {
		console.log("Updating...");
	}

	public get schools() {
		return this._schools;
	}
}

export { DataManager };
