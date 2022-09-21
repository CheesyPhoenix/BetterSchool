"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
function validate(creds, schoolURL) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
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
            return yield doValidate(creds, schoolURL, browser);
        }
        catch (e) {
            throw e;
        }
        finally {
            yield browser.close();
        }
    });
}
function doValidate(creds, schoolURL, browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = (yield browser.pages())[0];
        yield page.goto(schoolURL);
        yield page.waitForSelector("#login-with-feide-button");
        yield page.click("#login-with-feide-button");
        yield page.waitForSelector("#username");
        yield page.type("#username", creds.username);
        yield page.type("#password", creds.pass);
        yield page.evaluate(() => {
            document.getElementsByClassName("button-primary breathe-top")[0].click();
        });
        yield page.waitForTimeout(5000);
        let validated;
        if (page.url().includes("https://idp.feide.no") ||
            page.url().includes("login_error")) {
            validated = false;
        }
        else {
            validated = true;
        }
        return validated;
    });
}
function scrape(pass, schoolURL) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch({
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
            return yield doScrape(pass, browser, schoolURL);
        }
        catch (e) {
            throw e;
        }
        finally {
            yield browser.close();
        }
    });
}
function doScrape(pass, browser, schoolURL) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield validate(pass, schoolURL))) {
            console.log("creds invalid");
            return;
        }
        //login
        const page = (yield browser.pages())[0];
        yield page.goto(schoolURL);
        yield page.waitForSelector("#login-with-feide-button");
        yield page.click("#login-with-feide-button");
        yield page.waitForSelector("#username");
        yield page.type("#username", pass.username);
        yield page.type("#password", pass.pass);
        yield page.evaluate(() => {
            document.getElementsByClassName("button-primary breathe-top")[0].click();
        });
        yield page.waitForTimeout(5000);
        //wait for login to complete
        if (!(yield page.evaluate(() => {
            if (document.getElementById("top-menu-navbar-brand")) {
                return true;
            }
            return false;
        })) &&
            page.url() != schoolURL + "#/app/dashboard") {
            console.log("waiting for page load. Currently at: " + page.url());
            yield page.waitForSelector("#top-menu-navbar-brand");
        }
        yield page.waitForTimeout(2000);
        yield page.goto(schoolURL + "#/app/dashboard");
        yield page.waitForTimeout(10000);
        //remove pop-ups
        yield page.evaluate(() => {
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
        yield page.waitForTimeout(6000);
        function getWeekData() {
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
                    }
                    else if (!data.includes(" rom ")) {
                        classOb.room = "ingen";
                        classOb.name = data.split(".")[0].trim();
                    }
                    else {
                        console.log(data);
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
                let data = yield page.evaluate(getWeekData);
                if (data.days.length != 5) {
                    data = yield page.evaluate(getWeekData);
                }
                weeks.push(data);
            }
            catch (error) {
                yield page.screenshot({
                    fullPage: true,
                    path: "./errorScreenshots/latestError.png",
                });
                console.log("encountered error while getting week data, saving screenshot");
                throw error;
            }
            yield page.evaluate(() => {
                document.getElementById("nextweek").click();
            });
            yield page.waitForTimeout(1000);
            yield page.waitForSelector("#dashboard-widget-TimetableWidget-panel > div.vs-panel-body > div > div > div > div:nth-child(2) > div.Timetable-TimetableHeader > div:nth-child(1) > p");
        }
        console.log(weeks);
        return weeks;
    });
}
exports.default = { scrape, validate };
