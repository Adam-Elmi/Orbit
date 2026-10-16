// ###################
// calc.js: the math, the percent rules, and lines that must give nothing
// ###################

import { describe, expect, test } from "vitest";
import { calc } from "../src/lib/calc.js";

describe("basic math", () => {
	test.each([
		["1 + 2", "3"],
		["10 - 4", "6"],
		["6 * 7", "42"],
		["9 / 2", "4.5"],
		["2 + 3 * 4", "14"],
		["8 - 2 - 1", "5"],
		["8 / 2 / 2", "2"],
		["-5 + 2", "-3"],
		["--5", "5"],
		["+5", "5"],
		["0 * -1", "0"]
	])("%s = %s", (line, result) => expect(calc(line)).toBe(result));
});

describe("brackets", () => {
	test.each([
		["(2 + 3) * 4", "20"],
		["2 * (3 + 4) - 1", "13"],
		["((1 + 1) * (2 + 2))", "8"],
		["-(2 + 3)", "-5"],
		["2(3 + 1)", "8"],
		["(1 + 2)(3)", "9"]
	])("%s = %s", (line, result) => expect(calc(line)).toBe(result));
});

describe("percent", () => {
	test.each([
		["50%", "0.5"],
		["200 * 10%", "20"],
		["200 / 50%", "400"],
		["200 + 10%", "220"],
		["80 - 25%", "60"],
		["200 + 10% + 10%", "242"],
		["(100 + 100) + 10%", "220"],
		["(200 + 10)%", "2.1"],
		["200 + 10% - 5%", "209"],
		["-10%", "-0.1"],
		["10%%", "0.001"],
		["0.1 + 20%", "0.12"]
	])("%s = %s", (line, result) => expect(calc(line)).toBe(result));

	test.each([["7 % 3"], ["7%3"], ["10 % 4"]])("%j is not remainder", (line) => expect(calc(line)).toBe(null));
});

describe("exact decimals", () => {
	test.each([
		["0.1 + 0.2", "0.3"],
		["0.3 - 0.1", "0.2"],
		["1.1 * 3", "3.3"],
		[".5 + .5", "1"],
		["1 / 3", "0.333333333333333"],
		["2 / 3", "0.666666666666667"],
		["99999999999 * 99999999999", "9.9999999998e+21"]
	])("%s = %s", (line, result) => expect(calc(line)).toBe(result));
});

describe("keypad symbols", () => {
	test.each([
		["6 × 7", "42"],
		["9 ÷ 2", "4.5"],
		["10 − 4", "6"],
		["−3", "-3"]
	])("%s = %s", (line, result) => expect(calc(line)).toBe(result));
});

describe("lines that give nothing", () => {
	test.each([
		[""],
		["   "],
		["2 +"],
		["2 + ("],
		["(2 + 3"],
		["2 3"],
		["1 / 0"],
		["0 / 0"],
		["1,5"]
	])("%j isn't finished", (line) => expect(calc(line)).toBe(null));

	test.each([
		["2 ^ 3"],
		["x + 1"],
		["pi"],
		["sin(1)"],
		["import({})"],
		["a = 5"],
		["[1, 2]"],
		["1 == 1"],
		["2!"],
		["\"hi\""],
		["5!"],
		["3 (2) 1"]
	])("%j isn't allowed", (line) => expect(calc(line)).toBe(null));

	test("null and undefined", () => {
		expect(calc(null)).toBe(null);
		expect(calc(undefined)).toBe(null);
	});
});

describe("decimals", () => {
	test.each([
		["1 / 3", 2, "0.33"],
		["10 / 4", 2, "2.50"],
		["2 / 3", 0, "1"],
		["7", 4, "7.0000"],
		["1 / 3", 10, "0.3333333333"],
		["-0.001", 2, "0.00"],
		["-1 / 3", 2, "-0.33"],
		["99999999999 * 99999999999", 2, "9999999999800000000001.00"],
		["1 / 3", "auto", "0.333333333333333"]
	])("%s with %s → %s", (line, decimals, result) => expect(calc(line, { decimals })).toBe(result));

	test("unfinished lines still give nothing", () => expect(calc("2 +", { decimals: 2 })).toBe(null));
});
