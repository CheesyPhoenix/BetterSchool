import { IDManager } from "./idManager.ts";
import { School, SchoolClass, User } from "./types.d.ts";
import { v5 } from "https://deno.land/std@0.175.0/uuid/mod.ts";
import {
	decode as hexDecode,
	encode as hexEncode,
} from "https://deno.land/std@0.175.0/encoding/hex.ts";

class DataManager {
	private data: {
		classes: SchoolClass[];
		schoolName: string;
		schoolURL: string;
		schoolID: string;
	}[] = [];

	private idManager: IDManager;
	private _schools: School[] = [];

	private users: User[];

	private key: string;
	private initVector: string;

	private encoder: TextEncoder;
	private decoder: TextDecoder;

	constructor() {
		this.encoder = new TextEncoder();
		this.decoder = new TextDecoder();

		this.idManager = new IDManager("./data/ids.json");

		try {
			this._schools = JSON.parse(
				Deno.readTextFileSync("./data/schools.json")
			);

			this.users = JSON.parse(Deno.readTextFileSync("./data/users.json"));
		} catch (error) {
			this._schools = [];
			this.users = [];
			this.migrateData();
		}

		console.log(Deno.args);

		if (Deno.args[0] == "--dev") {
			this.initVector = "asweghiKaliytbij";
			this.key = "asweghiKaliytbijasweghiKaliytbij";
		} else {
			this.key = Deno.env.get("key") as string;
			this.initVector = Deno.env.get("iv") as string;
		}

		this.update();
		setInterval(this.update, 60 * 60 * 1000);
	}

	private async migrateData() {
		console.log("Migrating old data");

		await this.importSchools();

		await this.importUsers();
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

	private async importUsers() {
		const importedUsers = JSON.parse(
			Deno.readTextFileSync("./creds/pass.json")
		) as User[];

		let oldNamespace = "32b5b01c-a581-46a3-bdb2-5456b0e9390e";

		for (const user of importedUsers) {
			let newSchoolID: string | undefined = undefined;

			for (const school of this.schools) {
				const oldUUID = await v5.generate(
					oldNamespace,
					new TextEncoder().encode(school.url)
				);

				if (user.schoolID == oldUUID) {
					console.log("Found match with school: " + school.name);
					newSchoolID = school.id;
					break;
				}
			}

			if (newSchoolID === undefined) {
				throw "Couldn't migrate user/class: " + user.className;
			}

			this.users.push({
				...user,
				classID: await this.idManager.newUUID(),
				schoolID: newSchoolID,
			});
		}

		Deno.writeTextFileSync("./data/users.json", JSON.stringify(this.users));
	}

	private async update() {
		console.log("Updating...");

		console.log(await this.decrypt(this.users[0].username));
		console.log(
			(await this.encrypt(await this.decrypt(this.users[0].username))) ==
				this.users[0].username
		);
	}

	private async encrypt(string: string) {
		const key = await crypto.subtle.importKey(
			"raw",
			this.encoder.encode(this.key),
			"AES-CBC",
			true,
			["encrypt", "decrypt"]
		);

		return this.decoder.decode(
			hexEncode(
				new Uint8Array(
					await crypto.subtle.encrypt(
						{
							name: "AES-CBC",
							iv: this.encoder.encode(this.initVector),
						},
						key,
						this.encoder.encode(string)
					)
				)
			)
		);
	}

	private async decrypt(string: string) {
		const key = await crypto.subtle.importKey(
			"raw",
			this.encoder.encode(this.key),
			"AES-CBC",
			true,
			["encrypt", "decrypt"]
		);

		return this.decoder.decode(
			await crypto.subtle.decrypt(
				{ name: "AES-CBC", iv: this.encoder.encode(this.initVector) },
				key,
				hexDecode(this.encoder.encode(string))
			)
		);
	}

	public get schools() {
		return this._schools;
	}
}

export { DataManager };
