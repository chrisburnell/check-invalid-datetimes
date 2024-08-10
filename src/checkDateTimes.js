import fs from "fs";
import he from "he";
import readline from "readline";

export function hasInvalidDateTime(file, line) {
	if (/\.html$/i.test(file)) {
		return (
			/<time\b[^>]*>(?:(?!<\/time>).)*Invalid DateTime(?:(?!<\/time>).)*<\/time>/.test(
				line,
			) ||
			/<time\b[^>]*\bdatetime\s*=\s*"[^"]*Invalid DateTime[^"]*"/.test(
				line,
			)
		);
	} else if (/\.(rss|xml)$/i.test(file)) {
		return /<(pubDate|lastBuildDate|updated|published)\b[^>]*>(?:(?!<\/\1>).)*Invalid DateTime(?:(?!<\/\1>).)*<\/\1>/.test(
			line,
		);
	}
	return /Invalid DateTime/.test(line);
}

export function findAllIndexes(string) {
	const indexes = [];
	let i = string.indexOf("Invalid DateTime");

	while (i !== -1) {
		indexes.push(i);
		i = string.indexOf("Invalid DateTime", i + 1);
	}

	return indexes;
}

export async function checkDateTimes(files) {
	const errors = [];

	for (const file of files) {
		const rl = readline.createInterface({
			input: fs.createReadStream(file),
			output: process.stdout,
			terminal: false,
		});

		const instances = [];
		let lineNumber = 0;
		let columnNumber = 0;
		for await (const line of rl) {
			lineNumber++;
			if (hasInvalidDateTime(file, line)) {
				findAllIndexes(line).forEach((index) => {
					columnNumber = index + 1;
					instances.push({
						lineNumber: lineNumber,
						columnNumber: columnNumber,
						string: he.decode(line),
					});
				});
			}
		}

		if (instances.length > 0) {
			errors.push({
				filePath: file,
				instances: instances,
			});
		}
	}

	return errors;
}
