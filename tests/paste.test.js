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
	["6 × 7", "6×7"],
	["sqrt(16)", "√(16)"],
	["2*pi", "2×π"],
	["e^2", "ℯ^2"],
	["2 ** 10", "2^10"],
	["1.5e+21", "1.5e+21"],
	["1.5e-7", "1.5e−7"],
	["√2 + 5²", "√2+5²"],
	["17 mod 5", "17⊘5"],
	["17 MOD -3", "17⊘−3"]
])("%j → %j", (text, line) => expect(cleanPaste(text)).toBe(line));

test.each([[""], ["hello"], ["12 apples"], ["2^y"], ["sin(1)"], ["log(2)"], [null], ["1".repeat(201)]])("%j is refused", (text) => {
	expect(cleanPaste(text)).toBe(null);
});
