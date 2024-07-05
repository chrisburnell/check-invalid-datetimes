import chalk from "chalk"
import path from "path"

export function formatErrors(errors, relativeFrom = process.cwd()) {
	let number = 0
	let output = []
	for (const error of errors) {
		number += 1
		const filePath = path.relative(relativeFrom, error.filePath)
		output.push(
			`  ${number}. Invalid Datetime${error.instances.length > 1 ? "s" : ""} found in ${chalk.red.bold(filePath)}`,
			...error.instances
				.map(instance => `    from ${chalk.cyanBright.bold(filePath + ":" + instance.lineNumber + ":" + instance.columnNumber)} via ${instance.string.replace("Invalid DateTime", chalk.red.bold("Invalid DateTime"))}`)
		)
		output.push("")
	}
	return output.join("\n")
}
