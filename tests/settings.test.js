// ###################
// settings.js: saved settings come back; bad fields fall back one by one
// ###################

import { expect, test } from "vitest";
import { restoreSettings, defaults } from "../src/lib/settings.js";

test("saved settings come back", () => {
	expect(restoreSettings(JSON.stringify({ decimals: 2, indicator: "numbers", theme: "light", splash: false }))).toEqual({ decimals: 2, indicator: "numbers", theme: "light", splash: false });
});

test("a bad field falls back, the good one stays", () => {
	expect(restoreSettings(JSON.stringify({ decimals: 3, indicator: "numbers" }))).toEqual({ decimals: "auto", indicator: "numbers", theme: "system", splash: true });
	expect(restoreSettings(JSON.stringify({ decimals: 4, indicator: "stars" }))).toEqual({ decimals: 4, indicator: "dots", theme: "system", splash: true });
	expect(restoreSettings(JSON.stringify({ theme: "blue" }))).toEqual(defaults());
});

test("0 decimals (removed: it hid that 2.5 became 3) falls back to auto", () => {
	expect(restoreSettings(JSON.stringify({ decimals: 0, indicator: "numbers" }))).toEqual({ decimals: "auto", indicator: "numbers", theme: "system", splash: true });
});

test.each([[null], [""], ["{oops"], ["[]"], ["42"], [JSON.stringify({ decimals: "2" })]])("%j gives the defaults", (text) => {
	expect(restoreSettings(text)).toEqual(defaults());
});

test("splash must be true or false", () => {
	expect(restoreSettings(JSON.stringify({ splash: "no" })).splash).toBe(true);
	expect(restoreSettings(JSON.stringify({ splash: false })).splash).toBe(false);
});
