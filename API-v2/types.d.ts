export interface SchoolClass {
	weeks: {
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
	}[];
	classID: string;
	className: string;
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
