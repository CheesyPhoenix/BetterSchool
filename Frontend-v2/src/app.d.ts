// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}

		interface School {
			name: string;
			schoolID: string;
		}

		interface Class {
			className: string;
			classID: string;
		}

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
					teacher: string;
				}[];
			}[];
		}
	}
}

export {};
