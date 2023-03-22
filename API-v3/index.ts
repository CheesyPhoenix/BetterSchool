import { DataManager } from "./src/DataManager";
import express from "express";
import cors from "cors";
import { createRoutes } from "./src/routes";
import swaggerAutogen from "swagger-autogen";
import swaggerUI from "swagger-ui-express";
import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//swagger
const doc = {
	info: {
		title: "BetterSchool API",
	},
	host: "api.betterschool.chph.tk",
	schemes: ["https"],
};

await swaggerAutogen(__dirname + "/swagger-def.json", ["./src/routes.ts"], doc);
//--

const dataManager = new DataManager();

const app = express();
app.use(cors());
app.use(
	"/doc",
	swaggerUI.serve,
	swaggerUI.setup(JSON.parse(fs.readFileSync("./swagger-def.json", "utf-8")))
);
app.use(express.json());

app.use(createRoutes(dataManager));

const PORT = 8080;
app.listen(8080, () => console.log("listening on http://localhost:" + PORT));
