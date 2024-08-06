import fastglob from "fast-glob";
import fs from "fs";
import path from "path";

export function listFiles(fromGlob, directory) {
	return new Promise((resolve) => {
		fastglob(fromGlob, { cwd: directory }).then((files) => {
			resolve(
				files
					.map((filePath) => path.resolve(directory, filePath))
					.filter(
						(filePath) => !fs.lstatSync(filePath).isDirectory(),
					),
			);
		});
	});
}
