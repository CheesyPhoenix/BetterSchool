import { v5 } from "https://deno.land/std@0.175.0/uuid/mod.ts";

export class IDManager {
	private nextID: number;
	private nameSpace: string;
	private filePath: string;

	constructor(filePath: string) {
		this.filePath = filePath;

		let config: { nextID: number; nameSpace: string };
		try {
			const _config = JSON.parse(Deno.readTextFileSync(filePath));

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
			for (const filename of Deno.readDirSync("./")) {
				if (filename.isDirectory && filename.name == "data") {
					dirExists = true;
					break;
				}
			}

			if (!dirExists) Deno.mkdirSync("./data");

			config = { nextID: 0, nameSpace: crypto.randomUUID() };
			Deno.writeTextFileSync(filePath, JSON.stringify(config));
		}

		this.nextID = config.nextID;
		this.nameSpace = config.nameSpace;
	}

	public async newUUID(): Promise<string> {
		const uuid = await v5.generate(
			this.nameSpace,
			new TextEncoder().encode(this.nextID.toString())
		);

		this.nextID++;
		Deno.writeTextFileSync(
			this.filePath,
			JSON.stringify({ nextID: this.nextID, nameSpace: this.nameSpace })
		);

		return uuid;
	}
}
