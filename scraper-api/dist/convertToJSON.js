"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const list = fs_1.default.readFileSync("./allSchools.txt").toString().split("\r\n");
let namedList = [];
list.forEach((e) => {
    namedList.push({
        name: capitalizeBySpace(e
            .replace("https://", "")
            .replace(".inschool.visma.no/", "")
            .replace("-", " ")).replace("Vgs", "VGS"),
        url: e,
    });
});
function capitalizeBySpace(string) {
    return string
        .split(" ")
        .map((e) => {
        if (e.length == 0)
            return e;
        return e[0].toUpperCase() + (e.length > 1 ? e.slice(1) : "");
    })
        .join(" ");
}
fs_1.default.writeFileSync("./allSchools.json", JSON.stringify(namedList));
