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
			{ name: "quiet", alias: "q", type: Boolean },
		]
		const options = commandLineArgs(mainDefinitions, {
			argv,
		})
		this.options = {
			directory: options["directory"],
			fileTypes: options["file-types"],
			quiet: options["quiet"],
		}
	}

	setOptions(newOptions) {
		this.options = {
			...this.options,
			...newOptions,
		}
	}

	async run() {
		const { directory: userDirectory, fileTypes: userFileTypes, quiet } =
			this.options
		const directory = userDirectory
			? path.resolve(userDirectory)
			: process.cwd()
		const fileTypes = userFileTypes || "html,xml"
		const performanceStart = process.hrtime()
		let message = ""

		const files = await listFiles(
			`**/*.${fileTypes.includes(",") ? `{${fileTypes}}` : fileTypes}`,
			directory,
		)

		const errors = await checkDateTimes(files)

		if (!quiet) {
			console.log(chalk.bold("Check Invalid DateTimes") + "\n")

			const filesOutput =
				files.length == 0
					? `  ⚠️ No files ${chalk.bold(`(${fileTypes})`)} were found inside ${chalk.bold(userDirectory || path.basename(path.resolve()))}.`
					: `  📖 Found ${chalk.bold(files.length)} files ${chalk.bold(`(${fileTypes})`)} inside ${chalk.bold(userDirectory || path.basename(path.resolve()))}.`
			console.log(filesOutput + "\n")

			const performance = process.hrtime(performanceStart)
			let output = []
			if (errors.length > 0) {
				const instanceCount = errors.reduce((total, error) => {
					return total + error.instances.length
				}, 0)
				output = [
					`  ❌ Found ${chalk.bold(instanceCount)} Invalid DateTime${instanceCount > 1 ? "s" : ""} inside ${chalk.bold(errors.length)} file${errors.length > 1 ? "s" : ""}:\n`,
					...formatErrors(errors)
						.split("\n")
						.map((line) => `  ${line}`),
				]
			} else if (files.length > 0) {
				output = [`  ✅ ${chalk.green.bold("No Invalid DateTimes found!")}\n`]
			}

			output.push(
				`  🕑 Checked ${chalk.bold(files.length)} files in ${chalk.bold(performance[0] + "." + (performance[1] / 1000000).toString().split(".")[0])} seconds.`,
			)

			message = output.join("\n")
			console.log(message)
		}

		return { errors, message }
	}
}
