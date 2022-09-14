import Scraper from "./scraper";

import express from "express";
const app = express();
import cors from "cors";
import { addToPass, update } from "./dataHandler";

app.use(cors());
app.use(express.json());

let data: {
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

(async () => {
	data = await update();
	setInterval(update, 60 * 60 * 1000);

	let schools: { name: string; schoolID: number }[] = data.map((school) => {
		return { name: school.schoolName, schoolID: school.schoolID };
	});

	app.get("/schools", (req, res) => {
		res.json(schools);
	});

	app.get("/:schoolID/classes", (req, res) => {
		const classes = [];

		const schoolID = parseInt(req.params.schoolID);
		const school = data.find((school) => {
			return school.schoolID == schoolID;
		});

		if (!school) {
			res.sendStatus(404);
			return;
		}

		for (let i = 0; i < school.classes.length; i++) {
			classes.push(school.classes[i].class);
		}

		console.log(school);

		res.json(classes);
	});

	app.get("/:schoolID/class/:class", (req, res) => {
		const schoolID = parseInt(req.params.schoolID);
		const school = data.find((school) => {
			return school.schoolID == schoolID;
		});

		if (!school) {
			res.sendStatus(404);
			return;
		}

		const klasse = req.params.class;

		for (let i = 0; i < school.classes.length; i++) {
			const element = school.classes[i];

			if (element.class == klasse) {
				res.json(element.weeks);
				return;
			}
		}

		res.sendStatus(404);
	});

	app.post("/addUser", async (req, res) => {
		let creds: {
			username: string;
			pass: string;
			class: string;
			schoolID: number;
		} = req.body;

		if (
			!creds.username ||
			!creds.pass ||
			!creds.class ||
			creds.schoolID === undefined
		) {
			res.status(400).send("Incorrectly formatted body object");
			return;
		}

		console.log("validating creds");

		let school = getSchoolById(creds.schoolID);

		if (school && (await Scraper.validate(creds, school.schoolURL))) {
			console.log("creds validated");

			res.sendStatus(200);

			addToPass({
				username: creds.username,
				class: creds.class,
				pass: creds.pass,
				schoolURL: school.schoolURL,
			});

			console.log("creds added");
			data = await update();
		} else {
			res.status(401).send("incorrect credentials");
			console.log("incorrect credentials");
		}
	});

	app.listen(8080, () => {
		console.log("running");
	});
})();

function getSchoolById(schoolID: number) {
	return data.find((school) => {
		return school.schoolID == schoolID;
	});
}
