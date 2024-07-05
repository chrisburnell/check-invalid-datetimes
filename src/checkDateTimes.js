import fs from "fs"
import he from "he"
import readline from "readline"

export default async function checkDateTimes(files) {
	const errors = []

	for (const file of files) {
		const rl = readline.createInterface({
			input: fs.createReadStream(file),
			output: process.stdout,
			terminal: false,
		})

		const instances = []
		let lineNumber = 0
		let columnNumber = 0
		for await (const line of rl) {
			lineNumber++
			if (line.includes("Invalid DateTime")) {
				columnNumber = line.indexOf("Invalid DateTime") + 1
				instances.push({
					lineNumber: lineNumber,
					columnNumber: columnNumber,
					string: he.decode(line).trim(),
				})
			}
		}

		if (instances.length > 0) {
			errors.push({
				filePath: file,
				instances: instances,
			})
		}
	}

	return errors
}
