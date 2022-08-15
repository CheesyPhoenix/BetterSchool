const { scrape, validate } = require("./scraper.js");
const fs = require("fs");
const crypto = require("crypto");
const { exit } = require("process");

if (!process.env.iv || !process.env.key) {
	console.log("enter iv and key as env variables");
	exit();
}

let key = process.env.key;
let initVector = process.env.iv;

function encrypt(string) {
	const cipher = crypto.createCipheriv("aes-256-cbc", key, initVector);

	let encryptedData =
		cipher.update(string, "utf-8", "hex") + cipher.final("hex");

	return encryptedData;
}

function decrypt(string) {
	const decipher = crypto.createDecipheriv("aes-256-cbc", key, initVector);

	let decryptedData =
		decipher.update(string, "hex", "utf-8") + decipher.final("utf-8");

	return decryptedData;
}

function getPass() {
	return JSON.parse(fs.readFileSync("./creds/pass.json").toString());
}

function addToPass(creds) {
	let pass = getPass();

	pass.push({
		username: encrypt(creds.username),
		pass: encrypt(creds.pass),
		type: creds.type,
	});

	fs.writeFileSync("./creds/pass.json", JSON.stringify(pass));
}

let data = {};

async function update() {
	getPass().forEach(async (cred) => {
		try {
			const pass = {
				username: decrypt(cred.username),
				pass: decrypt(cred.pass),
			};

			data[cred.type] = await scrape(pass);
		} catch (error) {
			console.log("Scraper failed!");
			console.log(error);
		}
	});
	setTimeout(update, 60 * 60 * 1000);
}
(async () => {
	await update();

	const express = require("express");
	const app = express();
	const cors = require("cors");

	app.use(cors());
	app.use(express.json());

	app.get("/classes", (req, res) => {
		const classes = [];

		for (const klasse in data) {
			classes.push(klasse);
		}

		res.json(classes);
	});

	app.get("/:class", (req, res) => {
		const klasse = req.params.class;

		if (klasse in data) {
			res.json(data[klasse]);
		} else {
			res.sendStatus(404);
		}
	});

	app.post("/addUser", async (req, res) => {
		let creds = req.body;

		if (!creds.username || !creds.pass || !creds.class) {
			res.status(400).send("Incorrectly formatted body object");
			return;
		}

		if (await validate(creds)) {
			res.sendStatus(200);
			addToPass(creds);
			update();
		} else {
			res.status(401).send("incorrect credentials");
		}
	});

	app.listen(8080, () => {
		console.log("running");
	});
})();
