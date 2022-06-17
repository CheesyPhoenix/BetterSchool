interface Week {
	weekNr: string;
	days: {
		name: string;
		date: string;
		classes: { date: string; time: string; room: string; name: string }[];
	}[];
}

let data: Week[];
