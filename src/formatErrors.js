import chalk from "chalk";
import path from "path";

function padWithSpaces(total, number) {
	const digits = total.toString().length - number.toString().length;
	return " ".repeat(digits);
}

export function formatErrors(errors, relativeFrom = process.cwd()) {
	let number = 0;
	const output = [];
	for (const error of errors) {
		number += 1;
		const filePath = path.relative(relativeFrom, error.filePath);
		output.push(
			`${padWithSpaces(
				errors.length,
				number,
			)}  ${number}. ${chalk.red.bold(filePath)}`,
			...error.instances.map(
				(instance) =>
					`${padWithSpaces(
						errors.length,
						number,
					)}     from ${chalk.cyanBright.bold(
						filePath +
							":" +
							instance.lineNumber +
							":" +
							instance.columnNumber,
					)} via ${(
						instance.string.slice(0, instance.columnNumber - 1) +
						chalk.red.bold("Invalid DateTime") +
						instance.string.slice(instance.columnNumber + 15)
					).trim()}`,
			),
		);
		output.push("");
	}
	return output.join("\n");
}
