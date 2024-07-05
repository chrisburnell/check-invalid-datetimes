import chalk from "chalk"
import commandLineArgs from "command-line-args"
import path from "path"

import { checkDateTimes } from "./checkDateTimes.js"
import { formatErrors } from "./formatErrors.js"
import { listFiles } from "./listFiles.js"

export class checkInvalidDateTimes {
	constructor({ argv } = { argv: undefined }) {
		const mainDefinitions = [
			{ name: "directory", type: String, defaultOption: true },
			{ name: "file-types", type: String },
		]
		const options = commandLineArgs(mainDefinitions, {
			argv,
		})
		this.options = {
			directory: options["directory"],
			fileTypes: options["file-types"],
		}
	}

	setOptions(newOptions) {
		this.options = {
			...this.options,
			...newOptions,
		}
	}

	async run() {
		const { directory: userDirectory, fileTypes: userFileTypes } =
			this.options
		const directory = userDirectory
			? path.resolve(userDirectory)
			: process.cwd()
		const fileTypes = userFileTypes || "html,xml"
		const performanceStart = process.hrtime()

		const files = await listFiles(
			`**/*.${fileTypes.includes(",") ? `{${fileTypes}}` : fileTypes}`,
			directory,
		)

		console.log("Check Invalid DateTimes")

		const filesOutput =
			files.length == 0
				? "  🧐 No files to check. Did you select the correct folder?"
				: `  📖 Found ${chalk.green.bold(files.length)} files (${fileTypes}).`
		console.log(filesOutput)

		const errors = await checkDateTimes(files)

		const performance = process.hrtime(performanceStart)
		let output = []
		let message = ""
		if (errors.length > 0) {
			const instanceCount = errors.reduce((total, error) => {
				return total + error.instances.length
			}, 0)
			output = [
				`  ❌ Found ${chalk.bold(instanceCount)} Invalid DateTime${instanceCount > 1 ? "s" : ""} inside ${chalk.bold(errors.length)} files:\n`,
				...formatErrors(errors)
					.split("\n")
					.map((line) => `  ${line}`),
			]
		} else {
			output = [`  ✅ ${chalk.green.bold(0)} Invalid DateTimes found.`]
		}
		output.push(
			`  🕑 Checking DateTimes duration: ${performance[0]}s ${performance[1] / 1000000}ms`,
		)
		message = output.join("\n")
		console.log(message)

		return { errors, message }
	}
}
