import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DataManager } from "./dataManager.ts";
import { createRoutes } from "./routes.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";

const dataManager = new DataManager();

const app = new Application();
const router = createRoutes(dataManager);

app.use(oakCors({ methods: "*", allowedHeaders: "*", origin: "*" }));

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Now listening on http://localhost:3000`);
await app.listen(":3000");
