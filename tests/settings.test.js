// ###################
// settings.js: saved settings come back; bad fields fall back one by one
// ###################

import { expect, test } from "vitest";
import { restoreSettings, defaults } from "../src/lib/settings.js";

test("saved settings come back", () => {
	expect(restoreSettings(JSON.stringify({ decimals: 2, indicator: "numbers" }))).toEqual({ decimals: 2, indicator: "numbers" });
});

test("a bad field falls back, the good one stays", () => {
	expect(restoreSettings(JSON.stringify({ decimals: 3, indicator: "numbers" }))).toEqual({ decimals: "auto", indicator: "numbers" });
	expect(restoreSettings(JSON.stringify({ decimals: 4, indicator: "stars" }))).toEqual({ decimals: 4, indicator: "dots" });
});

test("0 decimals (removed: it hid that 2.5 became 3) falls back to auto", () => {
	expect(restoreSettings(JSON.stringify({ decimals: 0, indicator: "numbers" }))).toEqual({ decimals: "auto", indicator: "numbers" });
});

test.each([[null], [""], ["{oops"], ["[]"], ["42"], [JSON.stringify({ decimals: "2" })]])("%j gives the defaults", (text) => {
	expect(restoreSettings(text)).toEqual(defaults());
});
