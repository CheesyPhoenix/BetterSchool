import { v5 } from "uuid";
import fs from "fs";

export class IDManager {
	private nextID: number;
	private nameSpace: string;
	private filePath: string;

	constructor(filePath: string) {
		this.filePath = filePath;

		let config: { nextID: number; nameSpace: string };
		try {
			const _config = JSON.parse(fs.readFileSync(filePath, "utf-8"));

			if (
				Object.hasOwn(_config, "nextID") &&
				Object.hasOwn(_config, "nameSpace")
			) {
				config = {
					nextID: _config.nextID,
					nameSpace: _config.nameSpace,
				};
			} else {
				throw "invalid config";
			}
		} catch (_error) {
			let dirExists = false;
			for (const filename of fs.readdirSync("./", {
				withFileTypes: true,
			})) {
				if (filename.isDirectory() && filename.name == "data") {
					dirExists = true;
					break;
				}
			}

			if (!dirExists) fs.mkdirSync("./data");

			config = { nextID: 0, nameSpace: crypto.randomUUID() };
			fs.writeFileSync(filePath, JSON.stringify(config));
		}

		this.nextID = config.nextID;
		this.nameSpace = config.nameSpace;
	}

	public newUUID(): string {
		const uuid = v5(this.nextID.toString(), this.nameSpace);

		this.nextID++;
		fs.writeFileSync(
			this.filePath,
			JSON.stringify({ nextID: this.nextID, nameSpace: this.nameSpace })
		);

		return uuid;
	}
}
