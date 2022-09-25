import Scraper from "./scraper.js";
import swaggerUI from "swagger-ui-express";
import fs from "fs";
import "./swagger.js";
import express from "express";
const app = express();
import cors from "cors";
import { addToPass, migrateAccounts, update, } from "./dataHandler.js";
const swaggerfile = fs.readFileSync("./data/swaggerfile.json");
app.use(cors());
app.use(express.json());
app.use("/doc", swaggerUI.serve, swaggerUI.setup(JSON.parse(swaggerfile.toString())));
let data = [];
//migrate old accounts
migrateAccounts();
data = await update();
setInterval(update, 60 * 60 * 1000);
let schools = data.map((school) => {
    return { name: school.schoolName, schoolID: school.schoolID };
});
app.get("/schools", (req, res) => {
    // #swagger.description = "Use this endpoint to get all the schools and their ID's"
    /* #swagger.responses[200] = {
                description: "Returns a list of schools and their respective ID's",
                schema: [{"name":"Amalieskram VGS","schoolID":"78f7ae51-b9e7-5c61-95e7-283b7cd7f8f2"}]
        } */
    res.type("json");
    res.json(schools);
});
app.get("/school/:schoolID/classes", (req, res) => {
    // #swagger.description = 'Use this endpoint to get a list of all classes in a school'
    /* #swagger.parameters['schoolID'] = {
        in: "path",
        description: "The school-ID to get the classes from",
        required: true,
        type: "string",
} */
    /* #swagger.responses[200] = {
                description: "Returns a list of the classes registered to said school",
                schema: [{"className":"3PBYA","classID":"f0907e85-8d20-51a2-a307-956b55ad77ad"}]
        } */
    res.type("json");
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
app.get("/school/:schoolID/class/:classID", (req, res) => {
    // #swagger.summarry = 'Use this endpoint to get the schedule of a class in a school'
    // #swagger.parameters['schoolID'] = { description: 'The ID of the school' }
    // #swagger.parameters['classID'] = { description: 'The ID of the class' }
    /* #swagger.responses[200] = {
                description: "Returns a list of the classes registered to said school",
                schema: [{"weekNr":"38","days":[{"name":"Mandag","date":"Mon Sep 19 2022","classes":[{"date":"19. september 2022","time":"08:15-09:15","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"19. september 2022","time":"09:25-10:25","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"19. september 2022","time":"13:25-14:25","room":"UTGÅR","name":"Kroppsøving","teacher":"Arnfinn Refvik"},{"date":"19. september 2022","time":"14:35-15:35","room":"UTGÅR","name":"Kroppsøving","teacher":"Arnfinn Refvik"}]},{"name":"Tirsdag","date":"Tue Sep 20 2022","classes":[{"date":"20. september 2022","time":"08:15-09:15","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"20. september 2022","time":"09:25-10:25","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"20. september 2022","time":"10:35-11:35","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"20. september 2022","time":"12:30-13:30","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"20. september 2022","time":"13:40-14:40","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"20. september 2022","time":"14:50-15:50","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"}]},{"name":"Onsdag","date":"Wed Sep 21 2022","classes":[{"date":"21. september 2022","time":"10:35-11:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Helge Bohne"},{"date":"21. september 2022","time":"12:30-13:30","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Helge Bohne"},{"date":"21. september 2022","time":"13:40-14:40","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"21. september 2022","time":"14:50-15:50","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"}]},{"name":"Torsdag","date":"Thu Sep 22 2022","classes":[{"date":"22. september 2022","time":"09:25-10:25","room":"457","name":"Naturfag","teacher":"Ole-Kristian Eide"},{"date":"22. september 2022","time":"10:35-11:35","room":"457","name":"Naturfag","teacher":"Ole-Kristian Eide"},{"date":"22. september 2022","time":"12:05-13:05","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"22. september 2022","time":"13:15-14:15","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"}]},{"name":"Fredag","date":"Fri Sep 23 2022","classes":[{"date":"23. september 2022","time":"08:15-09:15","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"23. september 2022","time":"09:25-10:25","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"23. september 2022","time":"10:35-11:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Helge Bohne"},{"date":"23. september 2022","time":"12:05-13:05","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Helge Bohne"},{"date":"23. september 2022","time":"13:15-14:15","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"23. september 2022","time":"14:25-15:25","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"}]}]},{"weekNr":"39","days":[{"name":"Mandag","date":"Mon Sep 26 2022","classes":[{"date":"26. september 2022","time":"08:15-09:15","room":"513","name":"Matematikk 2P-Y","teacher":"Valery Carine Ngami Tchouatchoua"},{"date":"26. september 2022","time":"09:25-10:25","room":"513","name":"Matematikk 2P-Y","teacher":"Valery Carine Ngami Tchouatchoua"},{"date":"26. september 2022","time":"13:25-14:25","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"26. september 2022","time":"14:35-15:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"}]},{"name":"Tirsdag","date":"Tue Sep 27 2022","classes":[{"date":"27. september 2022","time":"08:15-09:15","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"27. september 2022","time":"09:25-10:25","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"27. september 2022","time":"10:35-11:35","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"27. september 2022","time":"12:30-13:30","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"27. september 2022","time":"13:40-14:40","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"27. september 2022","time":"14:50-15:50","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"}]},{"name":"Onsdag","date":"Wed Sep 28 2022","classes":[{"date":"28. september 2022","time":"10:35-11:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"28. september 2022","time":"12:30-13:30","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"28. september 2022","time":"13:40-14:40","room":"457","name":"Naturfag","teacher":"Ole-Kristian Eide"},{"date":"28. september 2022","time":"14:50-15:50","room":"457","name":"Naturfag","teacher":"Ole-Kristian Eide"}]},{"name":"Torsdag","date":"Thu Sep 29 2022","classes":[{"date":"29. september 2022","time":"08:15-09:15","room":"UTGÅR","name":"Kroppsøving","teacher":"Arnfinn Refvik"},{"date":"29. september 2022","time":"09:25-10:25","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"29. september 2022","time":"10:35-11:35","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"29. september 2022","time":"12:05-13:05","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"29. september 2022","time":"13:15-14:15","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"}]},{"name":"Fredag","date":"Fri Sep 30 2022","classes":[{"date":"30. september 2022","time":"08:15-09:15","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"30. september 2022","time":"09:25-10:25","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"30. september 2022","time":"10:35-11:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"30. september 2022","time":"12:05-13:05","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"30. september 2022","time":"13:15-14:15","room":"553","name":"Naturfag","teacher":"Ole-Kristian Eide"}]}]},{"weekNr":"40","days":[{"name":"Mandag","date":"Mon Oct 03 2022","classes":[{"date":"3. oktober 2022","time":"08:15-09:15","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"3. oktober 2022","time":"09:25-10:25","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"3. oktober 2022","time":"13:25-14:25","room":"UTGÅR","name":"Kroppsøving","teacher":"Arnfinn Refvik"},{"date":"3. oktober 2022","time":"14:35-15:35","room":"UTGÅR","name":"Kroppsøving","teacher":"Arnfinn Refvik"}]},{"name":"Tirsdag","date":"Tue Oct 04 2022","classes":[{"date":"4. oktober 2022","time":"08:15-09:15","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"4. oktober 2022","time":"09:25-10:25","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"4. oktober 2022","time":"10:35-11:35","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"4. oktober 2022","time":"10:35-12:05","room":"Aktivitet","name":"MOT-økt 3PBYa i rom 513","teacher":""},{"date":"4. oktober 2022","time":"12:30-13:30","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"4. oktober 2022","time":"13:40-14:40","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"4. oktober 2022","time":"14:50-15:50","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"}]},{"name":"Onsdag","date":"Wed Oct 05 2022","classes":[{"date":"5. oktober 2022","time":"10:35-11:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"5. oktober 2022","time":"12:30-13:30","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"5. oktober 2022","time":"13:40-14:40","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"5. oktober 2022","time":"14:50-15:50","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"}]},{"name":"Torsdag","date":"Thu Oct 06 2022","classes":[{"date":"6. oktober 2022","time":"09:25-10:25","room":"457","name":"Naturfag","teacher":"Ole-Kristian Eide"},{"date":"6. oktober 2022","time":"10:35-11:35","room":"457","name":"Naturfag","teacher":"Ole-Kristian Eide"},{"date":"6. oktober 2022","time":"12:05-13:05","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"6. oktober 2022","time":"13:15-14:15","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"}]},{"name":"Fredag","date":"Fri Oct 07 2022","classes":[{"date":"7. oktober 2022","time":"08:15-09:15","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"7. oktober 2022","time":"09:25-10:25","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"7. oktober 2022","time":"10:35-11:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"7. oktober 2022","time":"12:05-13:05","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"7. oktober 2022","time":"13:15-14:15","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"7. oktober 2022","time":"14:25-15:25","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"}]}]},{"weekNr":"41","days":[{"name":"Mandag","date":"Mon Oct 10 2022","classes":[]},{"name":"Tirsdag","date":"Tue Oct 11 2022","classes":[]},{"name":"Onsdag","date":"Wed Oct 12 2022","classes":[]},{"name":"Torsdag","date":"Thu Oct 13 2022","classes":[]},{"name":"Fredag","date":"Fri Oct 14 2022","classes":[]}]},{"weekNr":"42","days":[{"name":"Mandag","date":"Mon Oct 17 2022","classes":[{"date":"17. oktober 2022","time":"08:15-09:15","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"17. oktober 2022","time":"09:25-10:25","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"17. oktober 2022","time":"13:25-14:25","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"17. oktober 2022","time":"14:35-15:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"}]},{"name":"Tirsdag","date":"Tue Oct 18 2022","classes":[{"date":"18. oktober 2022","time":"08:15-09:15","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"18. oktober 2022","time":"09:25-10:25","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Endre Torbjørn Bjørlykke"},{"date":"18. oktober 2022","time":"10:35-11:35","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"18. oktober 2022","time":"12:30-13:30","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"18. oktober 2022","time":"13:40-14:40","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"18. oktober 2022","time":"14:50-15:50","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"}]},{"name":"Onsdag","date":"Wed Oct 19 2022","classes":[{"date":"19. oktober 2022","time":"10:35-11:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"19. oktober 2022","time":"12:30-13:30","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"19. oktober 2022","time":"13:40-14:40","room":"457","name":"Naturfag","teacher":"Ole-Kristian Eide"},{"date":"19. oktober 2022","time":"14:50-15:50","room":"457","name":"Naturfag","teacher":"Ole-Kristian Eide"}]},{"name":"Torsdag","date":"Thu Oct 20 2022","classes":[{"date":"20. oktober 2022","time":"08:15-09:15","room":"UTGÅR","name":"Kroppsøving","teacher":"Arnfinn Refvik"},{"date":"20. oktober 2022","time":"09:25-10:25","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"20. oktober 2022","time":"10:35-11:35","room":"513","name":"Historie","teacher":"Ingunn Palma Dahle"},{"date":"20. oktober 2022","time":"12:05-13:05","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"},{"date":"20. oktober 2022","time":"13:15-14:15","room":"513","name":"Matematikk 2P-Y","teacher":"Ole-Kristian Eide"}]},{"name":"Fredag","date":"Fri Oct 21 2022","classes":[{"date":"21. oktober 2022","time":"08:15-09:15","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"21. oktober 2022","time":"09:25-10:25","room":"413","name":"Informasjonsteknologi 1","teacher":"Jo Bjørnar Hausnes"},{"date":"21. oktober 2022","time":"10:35-11:35","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"21. oktober 2022","time":"12:05-13:05","room":"UTGÅR","name":"Norsk hovedmål, skriftlig","teacher":"Eva Morken Endresen"},{"date":"21. oktober 2022","time":"13:15-14:15","room":"553","name":"Naturfag","teacher":"Ole-Kristian Eide"}]}]}]
        } */
    res.type("json");
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
app.post("/addUser", async (req, res) => {
    // #swagger.summarry = 'Use this endpoint to add a new user, if the user already had an account the name of the old one will be raplaced with the new one'
    /*    #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Credentials of the new user',
            schema: {
                username: "e-bobkåre",
                pass: "BoblikerKål123",
                class: "2ITKA",
                schoolID: "78f7ae51-b9e7-5c61-95e7-283b7cd7f8f2"
            }
        } */
    // #swagger.responses[401] = {description: "Returns 401 if the api failed to verify the credentials"}
    // #swagger.responses[400] = {description: "Retuns 400 if the body object did not include the correct params"}
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
    if (school && (await Scraper.validate(creds, school.schoolURL))) {
        console.log("creds validated");
        res.sendStatus(200);
        addToPass({
            username: creds.username,
            class: creds.class,
            pass: creds.pass,
            schoolURL: school.schoolURL,
        });
        console.log("creds added");
        data = await update();
    }
    else {
        res.status(401).send("incorrect credentials");
        console.log("incorrect credentials");
    }
});
app.listen(8080, () => {
    console.log("running");
});
function getSchoolById(schoolID) {
    return data.find((school) => {
        return school.schoolID == schoolID;
    });
}
