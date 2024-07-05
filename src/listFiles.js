import fs from "fs"
import glob from "glob"
import path from "path"

export function listFiles(fromGlob, directory) {
	return new Promise(resolve => {
		glob(
			fromGlob,
			{ cwd: directory },
			(err, files) => {
				resolve(
					files
						.map(filePath => path.resolve(directory, filePath))
						.filter(filePath => !fs.lstatSync(filePath).isDirectory()),
				)
			},
		)
	})
}
