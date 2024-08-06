import assert from "node:assert";
import test from "node:test";
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

test("Get number of errors", async () => {
	const cli = new checkInvalidDateTimes();
	cli.setOptions(options);
	const result = await cli.run();

	const errorInstances = getErrorInstances(result.errors);

	assert.strictEqual(errorInstances.length, 3);
});

test("Get number of HTML errors", async () => {
	const cli = new checkInvalidDateTimes();
	cli.setOptions(Object.assign({}, options, { fileTypes: "html" }));
	const result = await cli.run();

	const errorInstances = getErrorInstances(result.errors);

	assert.strictEqual(errorInstances.length, 2);
});

test("Get number of XML errors", async () => {
	const cli = new checkInvalidDateTimes();
	cli.setOptions(Object.assign({}, options, { fileTypes: "xml" }));
	const result = await cli.run();

	const errorInstances = getErrorInstances(result.errors);

	assert.strictEqual(errorInstances.length, 1);
});

test("Get location of errors", async () => {
	const cli = new checkInvalidDateTimes();
	cli.setOptions(Object.assign({}, options, { fileTypes: "xml" }));
	const result = await cli.run();

	const errorInstances = getErrorInstances(result.errors);

	assert.strictEqual(errorInstances[0].lineNumber, 11);
	assert.strictEqual(errorInstances[0].columnNumber, 12);
	assert.strictEqual(
		errorInstances[0].string,
		"<summary>Invalid DateTime</summary>",
	);
});

test("Check message is not empty", async () => {
	const cli = new checkInvalidDateTimes();
	cli.setOptions(Object.assign({}, options, { fileTypes: "xml" }));
	const result = await cli.run();

	assert.notStrictEqual(result.message, "");
});
