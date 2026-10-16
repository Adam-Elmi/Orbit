// ###################
// sessions.js: saved sessions come back as they were; broken data starts fresh
// ###################

import { describe, expect, test } from "vitest";
import { restore, store, fresh, MAX_LINES } from "../src/lib/sessions.js";

const state = {
	sessions: [
		{ input: "220", lines: [{ line: "200+10%", result: "220" }], done: true },
		{ input: "", lines: [], done: false }
	],
	current: 1
};

describe("round trip", () => {
	test("what is stored comes back", () => expect(restore(store(state))).toEqual(state));

	test("long histories keep only the newest lines", () => {
		const lines = Array.from({ length: MAX_LINES + 50 }, (_, i) => ({ line: `${i}`, result: `${i}` }));
		const back = restore(store({ sessions: [{ input: "", lines }], current: 0 }));
		expect(back.sessions[0].lines).toHaveLength(MAX_LINES);
		expect(back.sessions[0].lines[0].line).toBe("50");
	});

	test("extra fields are dropped", () => {
		const text = JSON.stringify({ version: 1, current: 0, sessions: [{ input: "1", lines: [{ line: "1", result: "1", x: 1 }], y: 2 }] });
		expect(restore(text)).toEqual({ sessions: [{ input: "1", lines: [{ line: "1", result: "1" }], done: false }], current: 0 });
	});
});

describe("broken data starts fresh", () => {
	const ok = { version: 1, sessions: [{ input: "", lines: [] }], current: 0 };
	const broken = {
		"nothing saved": null,
		"empty text": "",
		"not JSON": "{oops",
		"cut short": store(state).slice(0, 30),
		"another version": JSON.stringify({ ...ok, version: 2 }),
		"no sessions": JSON.stringify({ ...ok, sessions: [] }),
		"too many sessions": JSON.stringify({ ...ok, sessions: Array(10).fill({ input: "", lines: [] }) }),
		"current too big": JSON.stringify({ ...ok, current: 1 }),
		"current not a number": JSON.stringify({ ...ok, current: "0" }),
		"input not text": JSON.stringify({ ...ok, sessions: [{ input: 5, lines: [] }] }),
		"lines not a list": JSON.stringify({ ...ok, sessions: [{ input: "", lines: {} }] }),
		"a line without result": JSON.stringify({ ...ok, sessions: [{ input: "", lines: [{ line: "1" }] }] }),
		"a null session": JSON.stringify({ ...ok, sessions: [null] }),
		"done not a boolean": JSON.stringify({ ...ok, sessions: [{ input: "", lines: [], done: "yes" }] }),
		"text far too long": JSON.stringify({ ...ok, sessions: [{ input: "1".repeat(5000), lines: [] }] }),
		"a list, not an object": "[]",
		"just a number": "42"
	};
	test.each(Object.entries(broken))("%s", (_, text) => expect(restore(text)).toEqual(fresh()));
});
