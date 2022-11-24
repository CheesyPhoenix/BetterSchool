import puppeteer from "puppeteer";
async function validate(creds, schoolURL) {
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
    try {
        return await doValidate(creds, schoolURL, browser);
    }
    catch (e) {
        throw e;
    }
    finally {
        await browser.close();
    }
}
async function doValidate(creds, schoolURL, browser) {
    const page = (await browser.pages())[0];
    await page.goto(schoolURL);
    await page.waitForSelector("#login-with-feide-button");
    //decline the bloody cookies
    await page.waitForTimeout(1000);
    await page.click(".onetrust-close-btn-ui");
    await page.waitForTimeout(1000);
    await page.click("#login-with-feide-button");
    await page.waitForSelector("#username");
    await page.type("#username", creds.username);
    await page.type("#password", creds.pass);
    await page.evaluate(() => {
        document.getElementsByClassName("button-primary breathe-top")[0].click();
    });
    await page.waitForTimeout(5000);
    let validated;
    if (page.url().includes("https://idp.feide.no") ||
        page.url().includes("login_error")) {
        validated = false;
    }
    else {
        validated = true;
    }
    return validated;
}
async function scrape(pass, schoolURL) {
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
    try {
        return await doScrape(pass, browser, schoolURL);
    }
    catch (e) {
        throw e;
    }
    finally {
        await browser.close();
    }
}
async function doScrape(pass, browser, schoolURL) {
    if (!(await validate(pass, schoolURL))) {
        console.log("creds invalid");
        return;
    }
    //login
    const page = (await browser.pages())[0];
    await page.goto(schoolURL);
    await page.waitForSelector("#login-with-feide-button");
    //decline the bloody cookies
    await page.waitForTimeout(1000);
    await page.click(".onetrust-close-btn-ui");
    await page.waitForTimeout(1000);
    await page.click("#login-with-feide-button");
    await page.waitForSelector("#username");
    await page.type("#username", pass.username);
    await page.type("#password", pass.pass);
    await page.evaluate(() => {
        document.getElementsByClassName("button-primary breathe-top")[0].click();
    });
    await page.waitForTimeout(5000);
    //wait for login to complete
    if (!(await page.evaluate(() => {
        if (document.getElementById("top-menu-navbar-brand")) {
            return true;
        }
        return false;
    })) &&
        page.url() != schoolURL + "#/app/dashboard") {
        await page.waitForSelector("#top-menu-navbar-brand");
    }
    await page.waitForTimeout(2000);
    await page.goto(schoolURL + "#/app/dashboard");
    await page.waitForTimeout(10000);
    //remove pop-ups
    await page.evaluate(() => {
        try {
            let el = document.querySelector("html > body > div:nth-of-type(6) > button:nth-of-type(2)");
            if (el)
                el.click();
            setTimeout(() => {
                el = document.querySelector("html > body > div:nth-of-type(5) > button:nth-of-type(2)");
                if (el)
                    el.click();
            }, 2000);
        }
        catch (error) { }
    });
    await page.waitForTimeout(6000);
    async function getWeekData() {
        const days = document.getElementsByClassName("Timetable-TimetableDays_day");
        const dayNames = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];
        let weekOb = {
            weekNr: document.getElementsByClassName("subheading2 userTimetable_currentWeek")[0].innerText
                .split(",")[0]
                .replace("UKE ", ""),
            days: [],
        };
        // let prevDay = 0;
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            let dayOb = {
                name: dayNames[i],
                date: "",
                classes: [],
            };
            //get date
            let week = weekOb.weekNr;
            let year = parseInt(document.getElementsByClassName("userTimetable_currentWeek")[0].innerText
                .split(",")[1]
                .split(" ")[2]);
            const w = new Date(year, 0).getTime() + 604800000 * (parseInt(week) - 1);
            dayOb.date = new Date(w + (518400000 / 6) * (i + 2)).toDateString();
            const classes = day.getElementsByClassName("Timetable-Items")[0].children;
            for (let x = 0; x < classes.length; x++) {
                const sClass = classes[x];
                let classOb = {
                    date: "",
                    time: "",
                    room: "",
                    name: "",
                    teacher: "",
                };
                const data = sClass.children[1].innerText;
                if (data.includes("og slutter Klikk for å se detaljer")) {
                    //for screen reader bug
                    classOb.date = data.split(".")[1].split(".")[0].trim();
                    classOb.time =
                        data.split("Starter")[1].split("klokken")[0].trim() +
                            "-" +
                            data.split(" klokken ")[1].split(" og")[0].trim();
                }
                else {
                    classOb.date = data
                        .split(" Starter ")[1]
                        .split(" klokken")[0];
                    classOb.time =
                        data.split(" klokken ")[1].split(" og")[0] +
                            "-" +
                            data.split(" slutter ")[1].trim();
                }
                // if (data.includes("Aktivitet")) {
                // 	classOb.room = "Aktivitet";
                // 	classOb.name = data.split(".")[0].trim();
                /* } else*/ if (!data.includes(" rom ")) {
                    classOb.room = "ingen";
                    classOb.name = data.split(".")[0].trim();
                }
                else {
                    console.log(data);
                    if (data.includes("og slutter Klikk for å se detaljer")) {
                        //for screen reader bug
                        classOb.room = data.split("\n")[1].split(" ")[0].trim();
                        classOb.name = data.split("\n")[0].trim();
                    }
                    else {
                        classOb.room = data.split(" rom ")[1].split(".")[0];
                        classOb.name = data.split(" i rom ")[0].trim();
                    }
                }
                //get teacher
                //click to open context menu
                sClass.click();
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(undefined);
                    }, 20);
                });
                //get data from context menu
                const menu = document.getElementsByClassName("list-group")[0];
                if (menu) {
                    const elements = menu.children;
                    for (let i = 0; i < elements.length; i++) {
                        const element = elements[i];
                        if (element.children[0].classList.value ==
                            "svg-inline--fa fa-user fa-w-14") {
                            classOb.teacher = element.innerText.trim();
                            break;
                        }
                    }
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
        // console.log("Getting week data at: " + page.url());
        try {
            let data = await page.evaluate(getWeekData);
            if (data.days.length != 5) {
                data = await page.evaluate(getWeekData);
            }
            weeks.push(data);
        }
        catch (error) {
            await page.screenshot({
                fullPage: true,
                path: "./errorScreenshots/latestError.png",
            });
            // console.log(
            // 	"encountered error while getting week data, saving screenshot"
            // );
            throw error;
        }
        await page.evaluate(() => {
            document.getElementById("nextweek").click();
        });
        await page.waitForTimeout(1000);
        await page.waitForSelector("#dashboard-widget-TimetableWidget-panel > div.vs-panel-body > div > div > div > div:nth-child(2) > div.Timetable-TimetableHeader > div:nth-child(1) > p");
    }
    // console.log(weeks);
    return weeks;
}
export default { scrape, validate };
