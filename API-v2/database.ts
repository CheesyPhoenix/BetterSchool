import { ModelFields } from "https://deno.land/x/denodb@v1.2.0/lib/model.ts";
import { DataTypes, Model } from "https://deno.land/x/denodb@v1.2.0/mod.ts";

export class School extends Model {
	static table = "schools";

	static fields: ModelFields = {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			allowNull: false,
		},
		name: { type: DataTypes.TEXT, allowNull: false },
		url: { type: DataTypes.TEXT, allowNull: false },
	};
}
