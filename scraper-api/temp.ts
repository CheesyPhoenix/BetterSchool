interface Week {
	weekNr: string;
	days: {
		name: string;
		classes: { dato: string; time: string; room: string; name: string }[];
	}[];
}

let data: Week[];
