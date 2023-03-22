import swaggerAutogen from "swagger-autogen";
const outFile = "./data/swaggerfile.json";
const endpointsFiles = ["./dist/index.js"];
const doc = {
    info: {
        title: "BetterSchool API",
        description: "The api for BetterSchool",
    },
    host: "api.betterschool.chph.tk",
    schemes: ["https"],
};
await swaggerAutogen(outFile, endpointsFiles, doc);
