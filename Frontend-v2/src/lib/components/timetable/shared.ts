import * as ics from "ics";

function getWeekNr() {
	var date = new Date();
	date.setHours(0, 0, 0, 0);
	// Thursday in current week decides the year.
	date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
	// January 4 is always in week 1.
	var week1 = new Date(date.getFullYear(), 0, 4);
	// Adjust to Thursday in week 1 and count number of weeks from date to week1.
	return (
		1 +
		Math.round(
			((date.getTime() - week1.getTime()) / 86400000 -
				3 +
				((week1.getDay() + 6) % 7)) /
				7
		)
	);
}

function exportICS(weeks: App.Week[]) {
	let events: ics.EventAttributes[] = [];

	weeks.forEach((week) => {
		week.days.forEach((day) => {
			const dayDate = new Date(day.date);

			day.classes.forEach((sClass) => {
				events.push({
					start: [
						dayDate.getFullYear(),
						dayDate.getMonth() + 1,
						dayDate.getDate(),
						parseInt(sClass.time.split("-")[0].split(":")[0]),
						parseInt(sClass.time.split("-")[0].split(":")[1]),
					],
					end: [
						dayDate.getFullYear(),
						dayDate.getMonth() + 1,
						dayDate.getDate(),
						parseInt(sClass.time.split("-")[1].split(":")[0]),
						parseInt(sClass.time.split("-")[1].split(":")[1]),
					],
					startInputType: "local",
					endInputType: "local",
					startOutputType: "local",
					endOutputType: "local",
					title: sClass.name,
					description: `Room: ${sClass.room}, Teacher: ${sClass.teacher}`,
				});
			});
		});
	});

	const createdEvents = ics.createEvents(events);

	if (createdEvents.error) {
		console.error(createdEvents.error);
	}

	const calendar = createdEvents.value;
	if (!calendar) return;

	var element = document.createElement("a");
	element.setAttribute(
		"href",
		"data:text/plain;charset=utf-8," + encodeURIComponent(calendar)
	);
	element.setAttribute("download", "schedule.ics");

	element.style.display = "none";
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

export { getWeekNr, exportICS };
