interface Week {
	weekNr: string;
	days: {
		name: string;
		date: string;
		classes: {
			date: string;
			time: string;
			room: string;
			name: string;
		}[];
	}[];
}

class DataManager {
	private apiURL: string;

	public schoolID: string;
	public classID: string;

	constructor(apiURL: string) {
		this.apiURL = apiURL;
	}

	async getSchools(): Promise<{ name: string; schoolID: string }[]> {
		const res = await fetch(this.apiURL + "/schools");
		const schools: { name: string; schoolID: string }[] = await res.json();

		return schools;
	}

	async getClasses(): Promise<{ className: string; classID: string }[]> {
		const res = await fetch(
			this.apiURL + "/school/" + this.schoolID + "/classes"
		);
		const klasser: { className: string; classID: string }[] =
			await res.json();

		return klasser;
	}

	async getWeeks(): Promise<Week[]> {
		const res = await fetch(
			this.apiURL + "/school/" + this.schoolID + "/class/" + this.classID
		);
		const weeks: Week[] = await res.json();

		return weeks;
	}

	async addNewUser(
		username: string,
		password: string,
		className: string,
		schoolID: string
	): Promise<{ status: number }> {
		const myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");

		const raw = JSON.stringify({
			username: username,
			pass: password,
			class: className,
			schoolID,
		});

		const requestOptions: RequestInit = {
			method: "POST",
			headers: myHeaders,
			body: raw,
		};

		const res = await fetch(this.apiURL + "/addUser", requestOptions);

		return { status: res.status };
	}
}
export { DataManager };
export type { Week };