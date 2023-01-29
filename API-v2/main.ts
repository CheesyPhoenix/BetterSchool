import { Application, send } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DataManager } from "./dataManager.ts";
import { createRoutes } from "./routes.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const dataManager = new DataManager();

const app = new Application();
const router = createRoutes(dataManager);

app.use(oakCors({ methods: "*", allowedHeaders: "*", origin: "*" }));

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx, next) => {
	if (!ctx.request.url.pathname.startsWith("/doc")) {
		next();
		return;
	}

	if (
		ctx.request.url.pathname == "/doc" ||
		ctx.request.url.pathname == "/doc/"
	) {
		ctx.response.redirect("/doc/index.html");
	}

	await send(ctx, ctx.request.url.pathname.replace("/doc", ""), {
		root: "./swaggerUI",
	});
});

console.log(`Now listening on http://localhost:8080`);
await app.listen(":8080");
