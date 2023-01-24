import {
	Database,
	SQLite3Connector,
} from "https://deno.land/x/denodb@v1.2.0/mod.ts";
import { School } from "./database.ts";
import { SchoolClass, User } from "./types.d.ts";

class DataManager {
	private data: {
		classes: SchoolClass[];
		schoolName: string;
		schoolURL: string;
		schoolID: string;
	}[] = [];

	private db: Database;

	constructor() {
		const connector = new SQLite3Connector({
			filepath: "./data/database.db",
		});
		this.db = new Database(connector);
		this.db.link([School]);
		this.db.sync();

		this.importSchools();

		this.update();
		setInterval(this.update, 60 * 60 * 1000);
	}

	private readSchoolsMaster(): { name: string; url: string }[] {
		return JSON.parse(Deno.readTextFileSync("./data/allSchools.json"));
	}

	private async importSchools() {
		await School.create(this.readSchoolsMaster());
	}

	private readUsers(): User[] {
		return JSON.parse(Deno.readTextFileSync("./data/users.json"));
	}

	private update() {
		console.log("Updating...");
	}

	public async getSchools() {
		return await School.select("id", "name").all();
	}
}

export { DataManager };
