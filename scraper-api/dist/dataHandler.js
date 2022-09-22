"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateAccounts = exports.addToPass = exports.update = void 0;
const scraper_1 = __importDefault(require("./scraper"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const process_1 = require("process");
const uuid_1 = require("uuid");
if ((!process.env.iv || !process.env.key) && process.argv[2] != "--dev") {
    console.log("enter iv (string[16]) and key (string[32]) as env variables");
    (0, process_1.exit)();
}
let key;
let initVector;
if (process.argv[2] == "--dev") {
    fs_1.default.writeFileSync("./creds/pass.json", "[]");
    initVector = crypto_1.default.randomBytes(16);
    key = crypto_1.default.randomBytes(32);
}
else {
    key = process.env.key;
    initVector = process.env.iv;
}
//uuid namespace
const uuidNamespace = "32b5b01c-a581-46a3-bdb2-5456b0e9390e";
function getPass() {
    return JSON.parse(fs_1.default.readFileSync("./creds/pass.json").toString());
}
function addToPass(creds) {
    console.log("adding to pass");
    let pass = getPass();
    for (let i = 0; i < pass.length; i++) {
        console.log("testing for duplicate, i: " + i);
        console.log("pass length: " + pass.length);
        if (decrypt(pass[i].username) == creds.username) {
            console.log("match found, removing");
            pass.splice(i, 1);
            i -= 1;
        }
    }
    pass.push({
        username: encrypt(creds.username),
        pass: encrypt(creds.pass),
        classID: (0, uuid_1.v5)(creds.class, uuidNamespace),
        className: creds.class,
        schoolID: (0, uuid_1.v5)(creds.schoolURL, uuidNamespace),
    });
    console.log(pass);
    fs_1.default.writeFileSync("./creds/pass.json", JSON.stringify(pass));
}
exports.addToPass = addToPass;
async function update() {
    console.log("updating data");
    let schools = JSON.parse(fs_1.default.readFileSync("./allSchools.json").toString());
    let _data = [];
    schools.forEach((school, i) => {
        _data.push({
            classes: [],
            schoolID: (0, uuid_1.v5)(school.url, uuidNamespace).toString(),
            schoolName: school.name,
            schoolURL: school.url,
        });
    });
    const pass = getPass();
    for (let i = 0; i < pass.length; i++) {
        const cred = pass[i];
        console.log("updating for: " + cred.className);
        const credDecrypted = {
            username: decrypt(cred.username),
            pass: decrypt(cred.pass),
        };
        const school = _data.find((school) => {
            return school.schoolID == cred.schoolID;
        });
        if (!school)
            continue;
        const result = await scrapeForCred(credDecrypted, school?.schoolURL, 0);
        if (result && result[0].days.length > 0) {
            school.classes.push({
                weeks: result,
                className: cred.className,
                classID: cred.classID,
            });
            console.log("update for: " + cred.className + "  Successful!");
        }
        else {
            console.log("update for: " + cred.className + " Failed!");
        }
    }
    return _data;
    //function declaration --------------------------------------------------------------
    async function scrapeForCred(cred, url, maxRetries, retries = 0) {
        let _data;
        try {
            _data = await scraper_1.default.scrape(cred, url);
            console.log("Scraper successful");
            return _data;
        }
        catch (error) {
            if (retries < maxRetries) {
                console.log("Scraper failed! Retrying in 10sec");
                await new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        _data = await scrapeForCred(cred, url, maxRetries, retries + 1);
                        resolve(null);
                    }, 10000);
                });
                return _data;
            }
            else {
                console.log("Scraper failed! Max retries reached");
                console.log(error);
                return [{ weekNr: "Error", days: [] }];
            }
        }
    }
}
exports.update = update;
function encrypt(string) {
    const cipher = crypto_1.default.createCipheriv("aes-256-cbc", key, initVector);
    let encryptedData = cipher.update(string, "utf-8", "hex") + cipher.final("hex");
    return encryptedData;
}
function decrypt(string) {
    const decipher = crypto_1.default.createDecipheriv("aes-256-cbc", key, initVector);
    let decryptedData = decipher.update(string, "hex", "utf-8") + decipher.final("utf-8");
    return decryptedData;
}
// migration from single to multiple schools
function migrateAccounts() {
    const pass = JSON.parse(fs_1.default.readFileSync("./creds/pass.json").toString());
    let newPass = [];
    for (let i = 0; i < pass.length; i++) {
        const element = pass[i];
        if (!element.classID) {
            newPass.push({
                username: element.username,
                pass: element.pass,
                className: element.class,
                classID: (0, uuid_1.v5)(element.class, uuidNamespace),
                schoolID: (0, uuid_1.v5)("https://amalieskram-vgs.inschool.visma.no/", uuidNamespace),
            });
        }
        else {
            newPass.push(element);
        }
    }
    fs_1.default.writeFileSync("./creds/pass.json", JSON.stringify(newPass));
}
exports.migrateAccounts = migrateAccounts;
