import fs from "fs";

const list = fs.readFileSync("./allSchools.txt").toString().split("\r\n");

let namedList: { name: string; url: string }[] = [];

list.forEach((e) => {
	namedList.push({
		name: capitalizeBySpace(
			e
				.replace("https://", "")
				.replace(".inschool.visma.no/", "")
				.replace("-", " ")
		).replace("Vgs", "VGS"),
		url: e,
	});
});

function capitalizeBySpace(string: string): string {
	return string
		.split(" ")
		.map((e) => {
			if (e.length == 0) return e;

			return e[0].toUpperCase() + (e.length > 1 ? e.slice(1) : "");
		})
		.join(" ");
}

fs.writeFileSync("./data/allSchools.json", JSON.stringify(namedList));
