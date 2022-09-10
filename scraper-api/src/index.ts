import Scraper from "./scraper";
import fs from "fs";
import crypto from "crypto";
import { exit } from "process";

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

function getPass() {
	return JSON.parse(fs.readFileSync("./creds/pass.json").toString());
}

function addToPass(creds: { username: string; pass: string; class: any }) {
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
	});

	console.log(pass);

	fs.writeFileSync("./creds/pass.json", JSON.stringify(pass));
}

let data: string | any[] = [];

async function update() {
	console.log("updating data");

	let _data = [];

	const pass = getPass();

	for (let i = 0; i < pass.length; i++) {
		const cred = pass[i];
		console.log("updating for: " + cred.class);

		const credDecrypted = {
			username: decrypt(cred.username),
			pass: decrypt(cred.pass),
		};

		const result = await scrapeForCred(credDecrypted, 5);

		if (result && result[0].days.length > 0) {
			_data.push({ data: result, class: cred.class });

			console.log("update for: " + cred.class + "  Successful!");
		} else {
			console.log("update for: " + cred.class + " Failed!");
		}
	}

	data = _data;

	//function declaration --------------------------------------------------------------

	async function scrapeForCred(
		cred: { username: string; pass: string },
		maxRetries: number,
		retries = 0
	) {
		let _data;
		try {
			_data = await Scraper.scrape(
				cred,
				"https://amalieskram-vgs.inschool.visma.no/"
			);

			console.log("Scraper successful");

			return _data;
		} catch (error) {
			if (retries < maxRetries) {
				console.log("Scraper failed! Retrying in 10sec");

				await new Promise((resolve, reject) => {
					setTimeout(async () => {
						_data = await scrapeForCred(
							cred,
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
(async () => {
	await update();
	setInterval(update, 60 * 60 * 1000);

	const express = require("express");
	const app = express();
	const cors = require("cors");

	app.use(cors());
	app.use(express.json());

	app.get("/classes", (req: any, res: { json: (arg0: any[]) => void }) => {
		const classes = [];

		for (let i = 0; i < data.length; i++) {
			classes.push(data[i].class);
		}

		res.json(classes);
	});

	app.get(
		"/:class",
		(
			req: { params: { class: any } },
			res: {
				sendStatus: (arg0: number) => void;
				json: (arg0: any) => void;
			}
		) => {
			const klasse = req.params.class;

			if (klasse == "classes") {
				res.sendStatus(404);
				return;
			}

			for (let i = 0; i < data.length; i++) {
				const element = data[i];

				if (element.class == klasse) {
					res.json(element.data);
					return;
				}
			}

			res.sendStatus(404);
		}
	);

	app.post(
		"/addUser",
		async (
			req: { body: any },
			res: {
				status: (arg0: number) => {
					(): any;
					new (): any;
					send: { (arg0: string): void; new (): any };
				};
				sendStatus: (arg0: number) => void;
			}
		) => {
			let creds = req.body;

			if (!creds.username || !creds.pass || !creds.class) {
				res.status(400).send("Incorrectly formatted body object");
				return;
			}

			console.log("validating creds");

			if (await Scraper.validate(creds)) {
				console.log("creds validated");

				res.sendStatus(200);

				addToPass(creds);

				console.log("creds added");
				update();
			} else {
				res.status(401).send("incorrect credentials");
				console.log("incorrect credentials");
			}
		}
	);

	app.listen(8080, () => {
		console.log("running");
	});
})();
