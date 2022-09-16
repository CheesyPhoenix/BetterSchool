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
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const dataHandler_1 = require("./dataHandler");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let data = [];
(() => __awaiter(void 0, void 0, void 0, function* () {
    data = yield (0, dataHandler_1.update)();
    setInterval(dataHandler_1.update, 60 * 60 * 1000);
    let schools = data.map((school) => {
        return { name: school.schoolName, schoolID: school.schoolID };
    });
    app.get("/schools", (req, res) => {
        res.json(schools);
    });
    app.get("/:schoolID/classes", (req, res) => {
        const classes = [];
        const schoolID = req.params.schoolID;
        const school = data.find((school) => {
            return school.schoolID == schoolID;
        });
        if (!school) {
            res.sendStatus(404);
            return;
        }
        for (let i = 0; i < school.classes.length; i++) {
            classes.push({
                className: school.classes[i].className,
                classID: school.classes[i].classID,
            });
        }
        console.log(school);
        res.json(classes);
    });
    app.get("/:schoolID/class/:classID", (req, res) => {
        const schoolID = req.params.schoolID;
        const school = getSchoolById(schoolID);
        if (!school) {
            res.sendStatus(404);
            return;
        }
        const classID = req.params.classID;
        const klasse = school.classes.find((klasse) => {
            return klasse.classID == classID;
        });
        if (!klasse) {
            res.sendStatus(404);
            return;
        }
        res.json(klasse.weeks);
    });
    app.post("/addUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let creds = req.body;
        if (!creds.username ||
            !creds.pass ||
            !creds.class ||
            creds.schoolID === undefined) {
            res.status(400).send("Incorrectly formatted body object");
            return;
        }
        console.log("validating creds");
        let school = getSchoolById(creds.schoolID);
        if (school && (yield scraper_1.default.validate(creds, school.schoolURL))) {
            console.log("creds validated");
            res.sendStatus(200);
            (0, dataHandler_1.addToPass)({
                username: creds.username,
                class: creds.class,
                pass: creds.pass,
                schoolURL: school.schoolURL,
            });
            console.log("creds added");
            data = yield (0, dataHandler_1.update)();
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
function getSchoolById(schoolID) {
    return data.find((school) => {
        return school.schoolID == schoolID;
    });
}
