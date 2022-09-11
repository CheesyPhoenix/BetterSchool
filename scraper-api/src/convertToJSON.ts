import fs from "fs";

const list = fs.readFileSync("./allSchools.txt");

console.log(list.toString().split("\r\n"));
