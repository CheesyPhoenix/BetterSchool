import Scraper from "./scraper.js";
import swaggerUI from "swagger-ui-express";
import fs from "fs";

import "./swagger.js";

import express from "express";
const app = express();
import cors from "cors";
import {
	addToPass,
	migrateAccounts,
	SchoolClass,
	update,
} from "./dataHandler.js";

const swaggerfile = fs.readFileSync("./data/swaggerfile.json");

app.use(cors());
app.use(express.json());
app.use(
	"/doc",
	swaggerUI.serve,
	swaggerUI.setup(JSON.parse(swaggerfile.toString()))
);

let data: {
	classes: SchoolClass[];
	schoolName: string;
	schoolURL: string;
	schoolID: string;
}[] = [];

//migrate old accounts
migrateAccounts();

data = await update();
setInterval(update, 60 * 60 * 1000);

let schools: { name: string; schoolID: string }[] = data.map((school) => {
	return { name: school.schoolName, schoolID: school.schoolID };
});

app.get("/schools", (req, res) => {
	// #swagger.description = 'Use this endpoint to get all the schools and their id's'

	res.type("json");
	res.json(schools);
});

app.get("/school/:schoolID/classes", (req, res) => {
	// #swagger.description = 'Use this endpoint to get a list of all classes in a school'
	/* #swagger.parameters['schoolID'] = {
        in: "path",
        description: "The school-ID to get the classes from",
        required: true,
        type: "string",
} */

	res.type("json");

	const classes: { className: string; classID: string }[] = [];

	const schoolID = req.params.schoolID;
	const school = data.find((school) => {
		return school.schoolID == schoolID;
	});

	if (!school) {
		res.sendStatus(404);
		return;
	}

	for (let i = 0; i < school.classes.length; i++) {
		classes.push({
			className: school.classes[i].className,
			classID: school.classes[i].classID,
		});
	}

	console.log(school);

	res.json(classes);
});

app.get("/school/:schoolID/class/:classID", (req, res) => {
	// #swagger.description = 'Use this endpoint to get the schedule of a class in a school'
	// #swagger.parameters['schoolID'] = { description: 'The ID of the school' }
	// #swagger.parameters['classID'] = { description: 'The ID of the class' }

	res.type("json");

	const schoolID = req.params.schoolID;
	const school = getSchoolById(schoolID);

	if (!school) {
		res.sendStatus(404);
		return;
	}

	const classID = req.params.classID;

	const klasse = school.classes.find((klasse) => {
		return klasse.classID == classID;
	});

	if (!klasse) {
		res.sendStatus(404);
		return;
	}

	res.json(klasse.weeks);
});

app.post("/addUser", async (req, res) => {
	let creds: {
		username: string;
		pass: string;
		class: string;
		schoolID: string;
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

function getSchoolById(schoolID: string) {
	return data.find((school) => {
		return school.schoolID == schoolID;
	});
}
