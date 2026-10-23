// ###################
// The caret: keys, ⌫, Delete and paste act where the caret is; ← → Home End move it
// ###################

import { beforeEach, describe, expect, test } from "vitest";
import { sessions, current, now, press, move, moveTo, paste, caretOf, showAt, shownToCaret, useLine } from "../src/lib/state.js";
import { restore } from "../src/lib/sessions.js";

const type = (keys) => [...keys].forEach((k) => press(k));
// the line with | where the caret is
const line = () => now().input.slice(0, caretOf()) + "|" + now().input.slice(caretOf());

beforeEach(() => {
	current(0);
	sessions([{ input: "", lines: [], done: false }]);
});

describe("typing at the caret", () => {
	test("keys go to the end until the caret moves", () => {
		type("12+3");
		expect(line()).toBe("12+3|");
	});

	test("a digit goes in the middle", () => {
		type("12+3");
		move(-2);
		press("5");
		expect(line()).toBe("125|+3");
	});

	test("an operator before the caret is replaced; − after × starts a negative number", () => {
		type("12+3");
		move(-1);
		press("×");
		expect(line()).toBe("12×|3");
		press("−");
		expect(line()).toBe("12×−|3");
	});

	test("at the start only − goes in", () => {
		type("5+3");
		moveTo(0);
		press("+");
		expect(line()).toBe("|5+3");
		press("−");
		expect(line()).toBe("−|5+3");
	});
});

describe("deleting", () => {
	test("⌫ deletes before the caret, Delete after it", () => {
		type("123+45");
		move(-3);
		press("⌫");
		expect(line()).toBe("12|+45");
		press("Del");
		expect(line()).toBe("12|45");
	});

	test("nothing to delete at the ends", () => {
		type("12");
		press("Del");
		expect(line()).toBe("12|");
		moveTo(0);
		press("⌫");
		expect(line()).toBe("|12");
	});

	test("C clears the line and the caret", () => {
		type("12+3");
		move(-2);
		press("C");
		expect(line()).toBe("|");
	});
});

describe("moving", () => {
	test("the caret stays inside the line", () => {
		type("12");
		move(5);
		expect(caretOf()).toBe(2);
		move(-9);
		expect(caretOf()).toBe(0);
	});

	test("Enter puts the caret after the result, and moving lets digits edit it", () => {
		type("23+7");
		move(-3);
		press("=");
		expect(line()).toBe("30|");
		move(-1);
		press("5");
		expect(line()).toBe("35|0");
	});

	test("paste goes in at the caret", () => {
		type("2+3");
		move(-2);
		paste("×10");
		expect(line()).toBe("2×10|+3");
	});

	test("a history line comes back with the caret at its end", () => {
		type("25÷5");
		press("=");
		useLine(0);
		expect(line()).toBe("25÷5|");
	});
});

describe("showing the caret", () => {
	test.each([
		["12+3", 0, ["", "12 + 3"]],
		["12+3", 2, ["12", " + 3"]],
		["12+3", 3, ["12 +", " 3"]],
		["12+3", 4, ["12 + 3", ""]]
	])("%j at %i", (input, caret, parts) => expect(showAt(input, caret)).toEqual(parts));

	test("a place in the shown line turns back into a caret", () => {
		expect(shownToCaret("12 + ")).toBe(3);
		expect(shownToCaret("")).toBe(0);
	});
});

describe("saved caret", () => {
	const saved = (caret) => JSON.stringify({ version: 1, current: 0, sessions: [{ input: "12", lines: [], caret }] });
	test("a caret inside the line is kept", () => expect(restore(saved(1)).sessions[0].caret).toBe(1));
	test.each([[5], [-1], [1.5], ["1"]])("%j is dropped", (caret) => expect(restore(saved(caret)).sessions[0]).not.toHaveProperty("caret"));
});

describe("scientific keys", () => {
	test("^ is an operator: it replaces one before it, and − after it starts a negative number", () => {
		type("2+^−1");
		expect(line()).toBe("2^−1|");
	});

	test("after Enter, ² and ^ go on from the result; √ π ℯ start a new line", () => {
		type("3+2=²");
		expect(line()).toBe("5²|");
		type("=π");
		expect(line()).toBe("π|");
	});

	test("√ goes in at the caret", () => {
		type("2+16");
		move(-2);
		press("√");
		expect(line()).toBe("2+√|16");
	});
});

describe("the mod key", () => {
	test("it is one key: ⌫ removes all of it, ← → step over it", () => {
		type("17⊘5");
		move(-1);
		expect(showAt(now().input, caretOf())).toEqual(["17 mod", " 5"]);
		move(-1);
		expect(showAt(now().input, caretOf())).toEqual(["17", " mod 5"]);
		move(1);
		press("⌫");
		expect(line()).toBe("17|5");
	});

	test("an operator replaces it, and − after it starts a negative number", () => {
		type("17⊘−3");
		expect(line()).toBe("17⊘−3|");
		press("C");
		type("17+⊘");
		expect(line()).toBe("17⊘|");
	});

	test("a click inside \"mod\" puts the caret after it", () => {
		expect(shownToCaret("17 mo")).toBe(3);
		expect(shownToCaret("17 mod 5")).toBe(4);
	});
});
