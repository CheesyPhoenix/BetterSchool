import Scraper from "./scraper.js";
import fs from "fs";
import crypto from "crypto";
import { exit } from "process";
import { v5 as uuidv5 } from "uuid";

if ((!process.env.iv || !process.env.key) && process.argv[2] != "--dev") {
	console.log("enter iv (string[16]) and key (string[32]) as env variables");
	exit();
}

let key: crypto.CipherKey;
let initVector: crypto.BinaryLike;

if (process.argv[2] == "--dev") {
	fs.writeFileSync("./creds/pass.json", "[]");
	initVector = crypto.randomBytes(16);
	key = crypto.randomBytes(32);
} else {
	key = process.env.key as string;
	initVector = process.env.iv as string;
}

//uuid namespace
const uuidNamespace = "32b5b01c-a581-46a3-bdb2-5456b0e9390e";

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

function getPass(): {
	username: string;
	pass: string;
	classID: string;
	className: string;
	schoolID: string;
}[] {
	return JSON.parse(fs.readFileSync("./creds/pass.json").toString());
}

function addToPass(creds: {
	username: string;
	pass: string;
	class: string;
	schoolURL: string;
}) {
	console.log("adding to pass");
	let pass = getPass();

	for (let i = 0; i < pass.length; i++) {
		console.log("testing for duplicate, i: " + i);
		console.log("pass length: " + pass.length);

		if (decrypt(pass[i].username) == creds.username) {
			console.log("match found, removing");
			pass.splice(i, 1);
			i -= 1;
		}
	}

	pass.push({
		username: encrypt(creds.username),
		pass: encrypt(creds.pass),
		classID: uuidv5(creds.class, uuidNamespace),
		className: creds.class,
		schoolID: uuidv5(creds.schoolURL, uuidNamespace),
	});

	// console.log(pass);

	fs.writeFileSync("./creds/pass.json", JSON.stringify(pass));
}

async function update(): Promise<
	{
		classes: SchoolClass[];
		schoolName: string;
		schoolURL: string;
		schoolID: string;
	}[]
> {
	console.log("updating data");

	let schools: { name: string; url: string }[] = JSON.parse(
		fs.readFileSync("./data/allSchools.json").toString()
	);

	let _data: {
		classes: SchoolClass[];
		schoolName: string;
		schoolURL: string;
		schoolID: string;
	}[] = [];

	schools.forEach((school, i) => {
		_data.push({
			classes: [],
			schoolID: uuidv5(school.url, uuidNamespace).toString(),
			schoolName: school.name,
			schoolURL: school.url,
		});
	});

	const pass = getPass();

	async function asyncPool(asyncFns: (() => Promise<any>)[], concurrent = 5) {
		// queue up simultaneous calls
		let queue: any[] = [];
		let ret = [];

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

	const results: {
		class: string;
		success: boolean;
		schoolName: string;
	}[] = [];

	const pool: (() => Promise<any>)[] = [];

	for (let i = 0; i < pass.length; i++) {
		const cred = pass[i];

		const credDecrypted = {
			username: decrypt(cred.username),
			pass: decrypt(cred.pass),
		};

		const school = _data.find((school) => {
			return school.schoolID == cred.schoolID;
		});

		if (!school) continue;

		pool.push(() => {
			return new Promise(async (resolve) => {
				const result = await scrapeForCred(
					credDecrypted,
					school?.schoolURL,
					2
				);

				if (result && result[0].days.length > 0) {
					school.classes.push({
						weeks: result,
						className: cred.className,
						classID: cred.classID,
					});

					results.push({
						class: cred.className,
						success: true,
						schoolName: school.schoolName,
					});
					resolve(undefined);
				} else {
					results.push({
						class: cred.className,
						success: false,
						schoolName: school.schoolName,
					});
					resolve(undefined);
				}
			});
		});
	}

	await asyncPool(pool, 5);

	const asciiGreen = "\u001b[32m";
	const asciiRed = "\u001b[31m";
	const asciiReset = "\u001b[0m";

	results.forEach((result) => {
		console.log(
			`Update for "${result.class}": ${
				result.success
					? asciiGreen + "successfull!"
					: asciiRed + "failed!"
			} ${asciiReset} (${result.schoolName})`
		);
	});

	return _data;

	//function declaration --------------------------------------------------------------

	async function scrapeForCred(
		cred: { username: string; pass: string },
		url: string,
		maxRetries: number,
		retries = 0
	) {
		let _data:
			| {
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
			  }[]
			| undefined;
		try {
			_data = await Scraper.scrape(cred, url);

			// console.log("Scraper successful");

			return _data;
		} catch (error) {
			if (retries < maxRetries) {
				// console.log("Scraper failed! Retrying in 10sec");

				await new Promise((resolve, reject) => {
					setTimeout(async () => {
						_data = await scrapeForCred(
							cred,
							url,
							maxRetries,
							retries + 1
						);
						resolve(null);
					}, 10000);
				});

				return _data;
			} else {
				console.log("Scraper failed! Max retries reached");
				console.log(error);
				return [{ weekNr: "Error", days: [] }];
			}
		}
	}
}

function encrypt(string: string) {
	const cipher = crypto.createCipheriv("aes-256-cbc", key, initVector);

	let encryptedData =
		cipher.update(string, "utf-8", "hex") + cipher.final("hex");

	return encryptedData;
}

function decrypt(string: string) {
	const decipher = crypto.createDecipheriv("aes-256-cbc", key, initVector);

	let decryptedData =
		decipher.update(string, "hex", "utf-8") + decipher.final("utf-8");

	return decryptedData;
}

// migration from single to multiple schools
function migrateAccounts() {
	const pass: any[] = JSON.parse(
		fs.readFileSync("./creds/pass.json").toString()
	);

	let newPass: {
		username: string;
		pass: string;
		classID: string;
		className: string;
		schoolID: string;
	}[] = [];

	for (let i = 0; i < pass.length; i++) {
		const element = pass[i];

		if (!element.classID) {
			newPass.push({
				username: element.username,
				pass: element.pass,
				className: element.class,
				classID: uuidv5(element.class, uuidNamespace),
				schoolID: uuidv5(
					"https://amalieskram-vgs.inschool.visma.no/",
					uuidNamespace
				),
			});
		} else {
			newPass.push(element);
		}
	}

	fs.writeFileSync("./creds/pass.json", JSON.stringify(newPass));
}

export { update, addToPass, SchoolClass, migrateAccounts };
