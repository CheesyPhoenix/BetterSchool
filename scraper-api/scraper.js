const puppeteer = require("puppeteer");

module.exports = { scrape, validate };

async function validate(creds) {
	const browser = await puppeteer.launch({
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-gpu",
			"--disable-dev-shm-usage",
		],
		headless: true,
	});

	const page = (await browser.pages())[0];
	await page.goto("https://amalieskram-vgs.inschool.visma.no/");

	await page.waitForSelector("#login-with-feide-button");
	await page.click("#login-with-feide-button");

	await page.waitForSelector("#username");
	await page.type("#username", creds.username);
	await page.type("#password", creds.pass);

	await page.evaluate(() => {
		document
			.getElementsByClassName("button-primary breathe-top")[0]
			.click();
	});

	await page.waitForTimeout(5000);

	let validated;

	if (page.url().includes("https://idp.feide.no")) {
		validated = false;
	} else {
		validated = true;
	}

	await browser.close();

	return validated;
}

async function scrape(pass) {
	if (!(await validate(pass))) {
		console.log("creds invalid");
		return;
	}

	const browser = await puppeteer.launch({
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-gpu",
			"--disable-dev-shm-usage",
		],
		headless: true,
		defaultViewport: { height: 1080, width: 1920 },
	});

	//login
	const page = (await browser.pages())[0];
	await page.goto("https://amalieskram-vgs.inschool.visma.no/");

	await page.waitForSelector("#login-with-feide-button");
	await page.click("#login-with-feide-button");

	await page.waitForSelector("#username");
	await page.type("#username", pass.username);
	await page.type("#password", pass.pass);

	await page.evaluate(() => {
		document
			.getElementsByClassName("button-primary breathe-top")[0]
			.click();
	});

	await page.waitForTimeout(5000);

	//wait for login to complete
	if (
		!(await page.evaluate(() => {
			if (document.getElementById("top-menu-navbar-brand")) {
				return true;
			}
			return false;
		})) &&
		page.url() != "https://amalieskram-vgs.inschool.visma.no/"
	) {
		console.log("waiting for page load. Currently at: " + page.url());
		await page.waitForSelector("#top-menu-navbar-brand");
	}

	await page.waitForTimeout(2000);

	await page.goto(
		"https://amalieskram-vgs.inschool.visma.no/#/app/dashboard"
	);

	await page.waitForTimeout(10000);

	//remove pop-ups
	await page.evaluate(() => {
		try {
			let el = document.querySelector(
				"html > body > div:nth-of-type(6) > button:nth-of-type(2)"
			);

			if (el) el.click();

			setTimeout(() => {
				el = document.querySelector(
					"html > body > div:nth-of-type(5) > button:nth-of-type(2)"
				);

				if (el) el.click();
			}, 2000);
		} catch (error) {}
	});

	await page.waitForTimeout(6000);

	function getWeekData() {
		const days = document.getElementsByClassName(
			"Timetable-TimetableDays_day"
		);

		const dayNames = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];

		let weekOb = {
			weekNr: document
				.getElementsByClassName(
					"subheading2 userTimetable_currentWeek"
				)[0]
				.innerText.split(",")[0]
				.replace("UKE ", ""),
			days: [],
		};

		let prevDay = 0;

		for (let i = 0; i < days.length; i++) {
			const day = days[i];

			let dayOb = {
				name: dayNames[i],
				date: "",
				classes: [],
			};

			//get date
			const dateDay = document
				.getElementsByClassName("Timetable-TimetableHeader")[0]
				.children[i].innerText.split(" ")[1];

			const dateRest = document
				.getElementsByClassName(
					"subheading2 userTimetable_currentWeek"
				)[0]
				.innerText.split(",")[1];

			const date = new Date(dateDay + dateRest);

			if (parseInt(dateDay) < prevDay) {
				for (let x = 0; x < i; x++) {
					const day = weekOb.days[x];

					const date = new Date(day.date);
					date.setMonth(date.getMonth() - 1);

					day.date = date.toDateString();
				}
			}

			prevDay = parseInt(dateDay);

			dayOb.date = date.toDateString();

			//get classes

			const classes =
				day.getElementsByClassName("Timetable-Items")[0].children;

			for (let x = 0; x < classes.length; x++) {
				const sClass = classes[x];

				let classOb = {
					date: "",
					time: "",
					room: "",
					name: "",
				};

				const data = sClass.children[1].innerText;

				classOb.date = data.split(" Starter ")[1].split(" klokken")[0];
				classOb.time =
					data.split(" klokken ")[1].split(" og")[0] +
					"-" +
					data.split(" slutter ")[1].trim();

				if (data.includes("Aktivitet")) {
					classOb.room = "Aktivitet";
					classOb.name = data.split(".")[0].trim();
				} else {
					classOb.room = data.split(" rom ")[1].split(".")[0];
					classOb.name = data.split(" i rom ")[0].trim();
				}

				dayOb.classes.push(classOb);
			}

			weekOb.days.push(dayOb);
		}

		return weekOb;
	}

	let foresight = 5;

	let weeks = [];

	//scrape data
	for (let i = 0; i < foresight; i++) {
		console.log("Getting week data at: " + page.url());

		try {
			let data = await page.evaluate(getWeekData);
			if (data.days.length != 5) {
				data = await page.evaluate(getWeekData);
			}
			weeks.push(data);
		} catch (error) {
			await page.screenshot({
				fullPage: true,
				path: "./errorScreenshots/latestError.png",
			});

			await browser.close();

			throw error;
		}

		await page.evaluate(() => {
			document.getElementById("nextweek").click();
		});
		await page.waitForTimeout(1000);
		await page.waitForSelector(
			"#dashboard-widget-TimetableWidget-panel-hiddenArea > div > div > div > div > div:nth-child(2) > div.timetable-grid"
		);
	}

	await browser.close();

	console.log(weeks);

	return weeks;
}
