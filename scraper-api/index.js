const scrape = require("./scraper");

let data;

async function update() {
	try {
		data = await scrape();
	} catch (error) {
		console.log("Scraper failed!");
	}
	setTimeout(update, 60 * 60 * 1000);
}
(async () => {
	await update();

	const express = require("express");
	const app = express();
	const cors = require("cors");

	app.use(cors());

	app.get("/", (req, res) => {
		res.send(data);
	});

	app.listen(8080, () => {
		console.log("running");
	});
})();
