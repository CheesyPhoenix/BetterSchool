import Scraper from "./scraper";
import fs from "fs";
import crypto from "crypto";
import { exit } from "process";

function getPass(): {
	username: string;
	pass: string;
	class: string;
	schoolURL: string;
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
		class: creds.class,
		schoolURL: creds.schoolURL,
	});

	console.log(pass);

	fs.writeFileSync("./creds/pass.json", JSON.stringify(pass));
}

async function update(): Promise<
	{
		classes: {
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
					}[];
				}[];
			}[];
			class: string;
		}[];
		schoolName: string;
		schoolURL: string;
		schoolID: number;
	}[]
> {
	console.log("updating data");

	let schools: { name: string; url: string }[] = JSON.parse(
		fs.readFileSync("./allSchools.json").toString()
	);

	let _data: {
		classes: {
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
					}[];
				}[];
			}[];
			class: string;
		}[];
		schoolName: string;
		schoolURL: string;
		schoolID: number;
	}[] = [];

	schools.forEach((school, i) => {
		_data.push({
			classes: [],
			schoolID: i,
			schoolName: school.name,
			schoolURL: school.url,
		});
	});

	const pass = getPass();

	for (let i = 0; i < pass.length; i++) {
		const cred = pass[i];
		console.log("updating for: " + cred.class);

		const credDecrypted = {
			username: decrypt(cred.username),
			pass: decrypt(cred.pass),
		};

		const result = await scrapeForCred(credDecrypted, cred.schoolURL, 5);

		if (result && result[0].days.length > 0) {
			_data
				.find((school) => {
					return school.schoolURL == cred.schoolURL;
				})
				?.classes.push({ weeks: result, class: cred.class });

			console.log("update for: " + cred.class + "  Successful!");
		} else {
			console.log("update for: " + cred.class + " Failed!");
		}
	}

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
						}[];
					}[];
			  }[]
			| undefined;
		try {
			_data = await Scraper.scrape(cred, url);

			console.log("Scraper successful");

			return _data;
		} catch (error) {
			if (retries < maxRetries) {
				console.log("Scraper failed! Retrying in 10sec");

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

if ((!process.env.iv || !process.env.key) && process.argv[2] != "--dev") {
	console.log("enter iv and key as env variables");
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

export { update, addToPass };
