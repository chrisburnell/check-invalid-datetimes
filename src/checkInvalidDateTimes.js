import chalk from "chalk";
import commandLineArgs from "command-line-args";
import path from "path";

import { checkDateTimes } from "./checkDateTimes.js";
import { formatErrors } from "./formatErrors.js";
import { listFiles } from "./listFiles.js";

export class checkInvalidDateTimes {
	constructor({ argv } = { argv: undefined }) {
		const mainDefinitions = [
			{ name: "directory", type: String, defaultOption: true },
			{ name: "file-types", type: String },
			{ name: "quiet", alias: "q", type: Boolean },
			{ name: "continue-on-error", type: Boolean },
		];
		const options = commandLineArgs(mainDefinitions, {
			argv,
		});
		this.options = {
			directory: options["directory"],
			fileTypes: options["file-types"],
			quiet: options["quiet"],
			continueOnError: options["continue-on-error"],
		};
	}

	setOptions(newOptions) {
		this.options = {
			...this.options,
			...newOptions,
		};
	}

	processMessage(message, output, quiet) {
		if (!quiet) {
			console.log(message);
		}
		return [...output, message];
	}

	async run() {
		const {
			directory: userDirectory,
			fileTypes: userFileTypes,
			quiet,
		} = this.options;
		const directory = userDirectory
			? path.resolve(userDirectory)
			: process.cwd();
		const fileTypes = userFileTypes || "html,xml";
		const performanceStart = process.hrtime();
		let output = [];

		output = this.processMessage(
			chalk.bold("Check Invalid DateTimes") + "\n",
			output,
			quiet,
		);

		const files = await listFiles(
			`**/*.${fileTypes.includes(",") ? `{${fileTypes}}` : fileTypes}`,
			directory,
		);

		output = this.processMessage(
			`  ${files.length === 0 ? "⚠️" : "📖"} Found ${chalk.bold(
				files.length,
			)} files ${chalk.bold(`(${fileTypes})`)} inside ${chalk.bold(
				userDirectory || path.basename(path.resolve()),
			)}.\n`,
			output,
			quiet,
		);

		const errors = await checkDateTimes(files);

		const performance = process.hrtime(performanceStart);
		if (errors.length > 0) {
			const instanceCount = errors.reduce((total, error) => {
				return total + error.instances.length;
			}, 0);
			output = this.processMessage(
				`  ❌ Found ${chalk.bold(instanceCount)} Invalid DateTime${
					instanceCount > 1 ? "s" : ""
				} inside ${chalk.bold(errors.length)} file${
					errors.length > 1 ? "s" : ""
				}:\n`,
				output,
				quiet,
			);
			output = this.processMessage(
				formatErrors(errors)
					.split("\n")
					.map((line) => `  ${line}`)
					.join("\n"),
				output,
				quiet,
			);
			output = this.processMessage(
				`  🕑 Checked ${chalk.bold(files.length)} files in ${chalk.bold(
					(performance[0] + performance[1] / 1e9).toFixed(3),
				)} seconds.`,
				output,
				quiet,
			);

			if (this.options.continueOnError === false) {
				if (quiet) {
					console.log(output.join("\n"));
				}
				process.exit(1);
			}
		} else if (files.length > 0) {
			output = this.processMessage(
				`  ✅ ${chalk.green.bold("No Invalid DateTimes found!")}\n`,
				output,
				quiet,
			);
			output = this.processMessage(
				`  🕑 Checked ${chalk.bold(files.length)} files in ${chalk.bold(
					(performance[0] + performance[1] / 1e9).toFixed(3),
				)} seconds.\n`,
				output,
				quiet,
			);
		}

		return { errors, message: output.join("\n") };
	}
}
