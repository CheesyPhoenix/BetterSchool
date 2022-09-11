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
const scraper_1 = __importDefault(require("./scraper"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const process_1 = require("process");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
if ((!process.env.iv || !process.env.key) && process.argv[2] != "--dev") {
    console.log("enter iv and key as env variables");
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
        class: creds.class,
    });
    console.log(pass);
    fs_1.default.writeFileSync("./creds/pass.json", JSON.stringify(pass));
}
let data = [];
function update() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("updating data");
        let _data = [];
        const pass = getPass();
        for (let i = 0; i < pass.length; i++) {
            const cred = pass[i];
            console.log("updating for: " + cred.class);
            const credDecrypted = {
                username: decrypt(cred.username),
                pass: decrypt(cred.pass),
            };
            const result = yield scrapeForCred(credDecrypted, 5);
            if (result && result[0].days.length > 0) {
                _data.push({ data: result, class: cred.class });
                console.log("update for: " + cred.class + "  Successful!");
            }
            else {
                console.log("update for: " + cred.class + " Failed!");
            }
        }
        data = _data;
        //function declaration --------------------------------------------------------------
        function scrapeForCred(cred, maxRetries, retries = 0) {
            return __awaiter(this, void 0, void 0, function* () {
                let _data;
                try {
                    _data = yield scraper_1.default.scrape(cred, "https://amalieskram-vgs.inschool.visma.no/");
                    console.log("Scraper successful");
                    return _data;
                }
                catch (error) {
                    if (retries < maxRetries) {
                        console.log("Scraper failed! Retrying in 10sec");
                        yield new Promise((resolve, reject) => {
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                _data = yield scrapeForCred(cred, maxRetries, retries + 1);
                                resolve(null);
                            }), 10000);
                        });
                        return _data;
                    }
                    else {
                        console.log("Scraper failed! Max retries reached");
                        console.log(error);
                        return [{ weekNr: "Error", days: [] }];
                    }
                }
            });
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield update();
    setInterval(update, 60 * 60 * 1000);
    app.get("/classes", (req, res) => {
        const classes = [];
        for (let i = 0; i < data.length; i++) {
            classes.push(data[i].class);
        }
        res.json(classes);
    });
    app.get("/:class", (req, res) => {
        const klasse = req.params.class;
        if (klasse == "classes") {
            res.sendStatus(404);
            return;
        }
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            if (element.class == klasse) {
                res.json(element.data);
                return;
            }
        }
        res.sendStatus(404);
    });
    app.post("/addUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let creds = req.body;
        if (!creds.username || !creds.pass || !creds.class) {
            res.status(400).send("Incorrectly formatted body object");
            return;
        }
        console.log("validating creds");
        if (yield scraper_1.default.validate(creds)) {
            console.log("creds validated");
            res.sendStatus(200);
            addToPass(creds);
            console.log("creds added");
            update();
        }
        else {
            res.status(401).send("incorrect credentials");
            console.log("incorrect credentials");
        }
    }));
    app.listen(8080, () => {
        console.log("running");
    });
}))();
