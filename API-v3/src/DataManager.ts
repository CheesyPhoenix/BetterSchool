import { IDManager } from "./idManager.js";
import { School, SchoolClass, User, Week } from "../types.js";
import { v5 } from "uuid";
import fs from "fs";
import crypto from "crypto";
import scraper from "./scraper.js";

class DataManager {
	private data: SchoolClass[] = [];

	private idManager: IDManager;
	private _schools: School[] = [];

	private users: User[] = [];

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
				fs.readFileSync("./data/schools.json", "utf-8")
			);

			this.users = JSON.parse(
				fs.readFileSync("./data/users.json", "utf-8")
			);
		} catch (_error) {
			this._schools = [];
			this.users = [];
			this.migrateData();
		}

		if (process.argv.includes("--dev")) {
			this.initVector = "asweghiKaliytbij";
			this.key = "asweghiKaliytbijasweghiKaliytbij";
		} else {
			const key = process.env["key"];
			const iv = process.env["iv"];

			if (!key || !iv)
				throw Error("Both key and iv env variables need to be set");

			this.key = key;
			this.initVector = iv;
		}

		this.update();
		setInterval(() => {
			this.update();
		}, 60 * 60 * 1000);
	}

	private async migrateData() {
		console.log("Migrating old data");

		await this.importSchools();

		await this.importUsers();

		this.update();
	}

	private async importSchools() {
		const importedSchools = JSON.parse(
			fs.readFileSync("./src/allSchools.json", "utf-8")
		) as { name: string; url: string }[];

		for (const school of importedSchools) {
			this._schools.push({
				id: await this.idManager.newUUID(),
				...school,
			});
		}

		fs.writeFileSync("./data/schools.json", JSON.stringify(this._schools));
	}

	private async importUsers() {
		let importedUsers: User[];
		try {
			importedUsers = JSON.parse(
				fs.readFileSync("./creds/pass.json", "utf-8")
			) as User[];
		} catch (error) {
			importedUsers = [];
		}

		const oldNamespace = "32b5b01c-a581-46a3-bdb2-5456b0e9390e";

		for (const user of importedUsers) {
			let newSchoolID: string | undefined = undefined;

			for (const school of this._schools) {
				const oldUUID = await v5(
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

		fs.writeFileSync("./data/users.json", JSON.stringify(this.users));
	}

	/**
	 * Gets the **to** school year. Eg. for 2022/2023, it returns 2023
	 */
	private getSchoolYear(): number {
		const now = new Date();
		now.setMonth(now.getMonth() + 6);
		return now.getFullYear();
	}

	private async update() {
		console.log("Updating...");

		const _data: SchoolClass[] = [];

		const pool: (() => Promise<void>)[] = [];

		// Check for outdated users
		this.users = this.users.filter((user) => {
			if (user.toSchoolYear && user.toSchoolYear < this.getSchoolYear()) {
				return false;
			}

			if (!user.toSchoolYear) user.toSchoolYear = this.getSchoolYear();

			return true;
		});

		fs.writeFileSync("./data/users.json", JSON.stringify(this.users));
		//--

		this.users.forEach((user) => {
			pool.push(async () => {
				const school = this._schools.find(
					(x) => x.id === user.schoolID
				);

				if (!school) throw "user doesn't link to school";

				const scraped = await scraper
					.scrape(
						{
							pass: await this.decrypt(user.pass),
							username: await this.decrypt(user.username),
						},
						school.url
					)
					.catch(() => {
						console.log("Failed to scrape for: " + user.className);
						return undefined;
					});

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

	encrypt(string: string) {
		const cipher = crypto.createCipheriv(
			"aes-256-cbc",
			this.key,
			this.initVector
		);

		let encryptedData =
			cipher.update(string, "utf-8", "hex") + cipher.final("hex");

		return encryptedData;
	}

	decrypt(string: string) {
		const decipher = crypto.createDecipheriv(
			"aes-256-cbc",
			this.key,
			this.initVector
		);

		let decryptedData =
			decipher.update(string, "hex", "utf-8") + decipher.final("utf-8");

		return decryptedData;
	}

	public get schools() {
		return this._schools;
	}

	public getClasses(schoolID: string):
		| {
				className: string;
				classID: string;
		  }[]
		| undefined {
		if (!this._schools.some((x) => x.id == schoolID)) return undefined;

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

		if (this.users.some((x) => x.className == className))
			throw "User exists";

		if (await scraper.validate({ username, pass: password }, school.url)) {
			const newUser: User = {
				className,
				schoolID,
				classID: this.idManager.newUUID(),
				username: await this.encrypt(username),
				pass: await this.encrypt(password),
				toSchoolYear: this.getSchoolYear(),
			};

			if (this.users.some((x) => x.className == newUser.className))
				throw "User exists";

			this.users = this.users.filter(
				(x) => x.username != newUser.username
			);

			this.users.push(newUser);

			fs.writeFileSync("./data/users.json", JSON.stringify(this.users));

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
