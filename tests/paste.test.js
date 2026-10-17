// ###################
// cleanPaste: what Ctrl+V lets into the line
// ###################

import { expect, test } from "vitest";
import { cleanPaste } from "../src/lib/state.js";

test.each([
	["1234.5", "1234.5"],
	[" 42 ", "42"],
	["12*3", "12×3"],
	["(4+6)/2", "(4+6)÷2"],
	["10 - 4", "10−4"],
	["-5", "−5"],
	["2 x 3", "2×3"],
	["1,234", "1234"],
	["1,234,567.89", "1234567.89"],
	["2,5", "2.5"],
	["12 + 3 =", "12+3"],
	["50%", "50%"],
	["6 × 7", "6×7"]
])("%j → %j", (text, line) => expect(cleanPaste(text)).toBe(line));

test.each([[""], ["hello"], ["12 apples"], ["2^3"], ["sin(1)"], [null], ["1".repeat(201)]])("%j is refused", (text) => {
	expect(cleanPaste(text)).toBe(null);
});
