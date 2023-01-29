export interface Week {
	weekNr: string;
	days: {
		name: string;
		date: string;
		classes: {
			date: string;
			time: string;
			room: string;
			name: string;
			teacher: string;
		}[];
	}[];
}

export interface SchoolClass {
	weeks: Week[];
	classID: string;
	className: string;
	schoolID: string;
}

export interface User {
	username: string;
	pass: string;
	classID: string;
	className: string;
	schoolID: string;
}

export interface School {
	id: string;
	name: string;
	url: string;
}
