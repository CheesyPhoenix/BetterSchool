import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DataManager } from "./dataManager.ts";

function createRoutes(dataManager: DataManager) {
	const router = new Router();

	router.get("/schools", async (ctx) => {
		ctx.response.body = JSON.stringify(await dataManager.getSchools());
		ctx.response.headers.set("Content-Type", "application/json");
	});

	return router;
}

export { createRoutes };
