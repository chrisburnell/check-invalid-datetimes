import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkInvalidDateTimes } from "./src/checkInvalidDateTimes.js";

const options = {
	directory: "test",
	quiet: true,
};

const getErrorInstances = (errors) => {
	return errors.flatMap((object) => {
		return object.instances;
	});
};

describe("check-invalid-datetimes", () => {
	it("Should return an array of errors", async () => {
		const cli = new checkInvalidDateTimes();
		cli.setOptions(options);
		const result = await cli.run();

		const errorInstances = getErrorInstances(result.errors);

		assert.strictEqual(errorInstances.length, 5);
	});

	it("Should be able to check only specified file types", async () => {
		const cli = new checkInvalidDateTimes();
		cli.setOptions(Object.assign({}, options, { fileTypes: "html" }));
		const result = await cli.run();

		const errorInstances = getErrorInstances(result.errors);

		assert.strictEqual(errorInstances.length, 2);
	});

	it("Should return the location of found errors", async () => {
		const cli = new checkInvalidDateTimes();
		cli.setOptions(Object.assign({}, options, { fileTypes: "xml" }));
		const result = await cli.run();

		const errorInstances = getErrorInstances(result.errors);

		assert.strictEqual(errorInstances[0].lineNumber, 6);
		assert.strictEqual(errorInstances[0].columnNumber, 11);
		assert.strictEqual(
			errorInstances[0].string.trim(),
			"<updated>Invalid DateTime</updated>",
		);

		assert.strictEqual(errorInstances[1].lineNumber, 12);
		assert.strictEqual(errorInstances[1].columnNumber, 12);
		assert.strictEqual(
			errorInstances[1].string.trim(),
			"<updated>Invalid DateTime</updated>",
		);

		assert.strictEqual(errorInstances[2].lineNumber, 13);
		assert.strictEqual(errorInstances[2].columnNumber, 14);
		assert.strictEqual(
			errorInstances[2].string.trim(),
			"<published>Invalid DateTime</published>",
		);
	});

	it("Should return a message summarising the result", async () => {
		const cli = new checkInvalidDateTimes();
		cli.setOptions(Object.assign({}, options, { fileTypes: "xml" }));
		const result = await cli.run();

		assert.notStrictEqual(result.message, "");
	});
});
