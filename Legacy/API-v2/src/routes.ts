import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DataManager } from "./dataManager.ts";

function createRoutes(dataManager: DataManager) {
	const router = new Router();

	router.get("/schools", (ctx) => {
		ctx.response.body = JSON.stringify(
			dataManager.schools.map((x) => {
				return { name: x.name, schoolID: x.id };
			})
		);
		ctx.response.headers.set("Content-Type", "application/json");
	});

	router.get("/school/:schoolID/classes", (ctx) => {
		const schoolID = ctx.params.schoolID;
		const classes = dataManager.getClasses(schoolID);
		if (classes == undefined) {
			ctx.response.status = 404;
			return;
		}

		ctx.response.body = JSON.stringify(classes);
		ctx.response.headers.set("Content-Type", "application/json");
	});

	router.get("/school/:schoolID/class/:classID", (ctx) => {
		const classID = ctx.params.classID;
		const weeks = dataManager.getWeeks(classID);
		if (!weeks) {
			ctx.response.status = 404;
			return;
		}

		ctx.response.body = JSON.stringify(weeks);
		ctx.response.headers.set("Content-Type", "application/json");
	});

	router.post("/addUser", async (ctx) => {
		const creds: {
			username: string;
			pass: string;
			class: string;
			schoolID: string;
		} = await ctx.request.body().value;

		console.log("Adding new user: " + creds.class);

		if (!creds.username || !creds.pass || !creds.class || !creds.schoolID) {
			ctx.response.status = 200;
			ctx.response.body = "Incorrectly formatted body object";
			return;
		}

		try {
			await dataManager.addUser(
				creds.username,
				creds.pass,
				creds.class,
				creds.schoolID
			);

			ctx.response.status = 200;
		} catch (error) {
			console.log(error);

			if (error == "School not found") {
				ctx.response.status = 404;
				ctx.response.body = error;
			} else if (error == "Creds invalid") {
				ctx.response.status = 401;
				ctx.response.body = "Credentials invalid";
			} else if (error == "User exists") {
				ctx.response.status = 409;
				ctx.response.body = "Classname already in use";
			} else {
				ctx.response.status = 500;
			}
		}
	});

	return router;
}

export { createRoutes };
