const scrape = require("./scraper");

let data;

async function update() {
	data = await scrape();
	setTimeout(update, 60 * 60 * 1000);
}
(async () => {
	await update();

	const express = require("express");
	const app = express();

	app.get("/", (req, res) => {
		res.send(data);
	});

	app.listen(8080, () => {
		console.log("running");
	});
})();
