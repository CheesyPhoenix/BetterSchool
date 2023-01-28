import { IDManager } from "./idManager.ts";
import { School, SchoolClass, User, Week } from "./types.d.ts";
import { v5 } from "https://deno.land/std@0.175.0/uuid/mod.ts";
import {
	decode as hexDecode,
	encode as hexEncode,
} from "https://deno.land/std@0.175.0/encoding/hex.ts";
import scraper from "./scraper.ts";

class DataManager {
	private data: SchoolClass[] = [];

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
		} catch (_error) {
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
			this._schools.push({
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

		const oldNamespace = "32b5b01c-a581-46a3-bdb2-5456b0e9390e";

		for (const user of importedUsers) {
			let newSchoolID: string | undefined = undefined;

			for (const school of this._schools) {
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

		const _data: SchoolClass[] = [];

		const pool: (() => Promise<void>)[] = [];

		this.users.forEach((user) => {
			pool.push(async () => {
				const school = this._schools.find(
					(x) => x.id === user.schoolID
				);

				if (!school) throw "user doesn't link to school";

				const scraped = await scraper.scrape(
					{
						pass: await this.decrypt(user.pass),
						username: await this.decrypt(user.username),
					},
					school.url
				);

				if (scraped) {
					_data.push({
						weeks: scraped,
						classID: user.classID,
						className: user.className,
						schoolID: user.schoolID,
					});
				}
			});
		});

		await asyncPool(pool);

		this.data = _data;
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

	public getClasses(schoolID: string): {
		className: string;
		classID: string;
	}[] {
		return this.data
			.filter((x) => x.schoolID == schoolID)
			.map((x) => {
				return { className: x.className, classID: x.classID };
			});
	}

	public getWeeks(classID: string): Week[] | undefined {
		return this.data.find((x) => x.classID === classID)?.weeks;
	}

	public async addUser(
		username: string,
		password: string,
		className: string,
		schoolID: string
	) {
		const school = this.schools.find((x) => x.id === schoolID);
		if (!school) {
			throw "School not found";
		}

		if (await scraper.validate({ username, pass: password }, school.url)) {
			const newUser: User = {
				className,
				schoolID,
				classID: await this.idManager.newUUID(),
				username: await this.encrypt(username),
				pass: await this.encrypt(password),
			};

			this.users.push(newUser);

			this.update();
		} else {
			throw "Creds invalid";
		}
	}
}

async function asyncPool(asyncFns: (() => Promise<any>)[], concurrent = 5) {
	// queue up simultaneous calls
	const queue: any[] = [];
	const ret = [];

	for (let i = 0; i < asyncFns.length; i++) {
		const fn = asyncFns[i];
		// fire the async function, add its promise to the queue, and remove
		// it from queue when complete

		console.log(`Running update ${i + 1}/${asyncFns.length}`);

		const p = fn().then((res) => {
			console.log(`Update ${i + 1} complete`);

			queue.splice(queue.indexOf(p), 1);
			return res;
		});
		queue.push(p);
		ret.push(p);
		// if max concurrent, wait for one to finish
		if (queue.length >= concurrent) {
			await Promise.race(queue);
		}
	}

	// wait for the rest of the calls to finish
	await Promise.all(queue);
}

export { DataManager };
