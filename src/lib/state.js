// ###################
// Orbit's shared state: sessions, settings, which panel is open, and the actions on them
// Every component imports from here; ArcMoon bundles one copy for the page
// ###################

import { signal, computed, effect } from "arcmoon/reactive";
import { calc } from "./calc.js";
import { MAX_SESSIONS, blank, load, save } from "./sessions.js";
import { loadSettings, saveSettings } from "./settings.js";

// ###################
// Settings: decimals and how sessions show (dots or numbers), saved on every change
// ###################
export const settings = signal(loadSettings());
effect(() => saveSettings(settings()));
export const setSetting = (part) => settings({ ...settings(), ...part });

// ###################
// Theme: light or dark on <html data-theme>; "system" follows the desktop, live
// ###################
const prefersLight = globalThis.matchMedia?.("(prefers-color-scheme: light)");
const systemLight = signal(prefersLight?.matches ?? false);
prefersLight?.addEventListener("change", (e) => systemLight(e.matches));
export const isLight = () => settings().theme === "light" || (settings().theme === "system" && systemLight());
effect(() => globalThis.document?.documentElement.setAttribute("data-theme", isLight() ? "light" : "dark"));

// ###################
// Sessions: each has the line being typed (with × ÷ −), and its history [{ line, result }]
// They start as they were saved, and are saved again on every change
// ###################
const saved = load();
export const sessions = signal(saved.sessions);
export const current = signal(saved.current);
effect(() => save({ sessions: sessions(), current: current() }));

export const now = () => sessions()[current()];
export const change = (part) => sessions(sessions().map((s, i) => (i === current() ? { ...s, ...part } : s)));

// ###################
// Moving between sessions. No batch in arcmoon/reactive, and effects run on every set:
// current is set first when it goes down, so it never points past the list
// ###################
export const go = (i) => current(Math.max(0, Math.min(sessions().length - 1, i)));
export const open = () => {
	if (sessions().length >= MAX_SESSIONS) return;
	sessions([...sessions(), blank()]);
	current(sessions().length - 1);
};
export const close = () => {
	if (sessions().length === 1) return sessions([blank()]);   // the last one only clears
	const at = current();
	current(Math.min(at, sessions().length - 2));
	sessions(sessions().filter((_, i) => i !== at));
};
export const clearAll = () => {
	current(0);
	sessions([blank()]);
};

// ###################
// The current line and its result
// ###################
export const input = () => now().input;

// results use the same − as the keypad, so going on from one reads the same
export const work = (line) => calc(line, { decimals: settings().decimals })?.replace(/^-/, "−") ?? null;
export const result = computed(() => work(input()));

// just a number (453, −2.5, 1.5e+21): no result line, and Enter keeps nothing in history
export const isPlain = (line) => /^−?[0-9.]+(e[+-][0-9]+)?$/.test(line);

// 2×−3 reads better with spaces: "2 × −3"
export const show = (line) => line.replace(/([0-9.%)])([+−×÷])/g, "$1 $2 ");

// ###################
// One key, from the keypad or the keyboard
// Enter puts the result in the line (23÷2 → 11.5); a real calculation also goes to history
// After Enter, a digit starts a new line and an operator goes on from the result
// ###################
const OPERATORS = "+−×÷";

export const press = (key) => {
	const last = input().slice(-1);
	if (key === "=") {
		if (!input() || result() === null) return;
		const line = input();
		// a plain number stays as typed (7, not 7.0000 with 4 decimals)
		if (isPlain(line)) return change({ done: true });
		return change({ input: result(), done: true, lines: [...now().lines, { line, result: result() }] });
	}
	if (key === "C") return change({ input: "", done: false });
	if (key === "⌫") return change({ input: input().slice(0, -1), done: false });
	if (now().done && !OPERATORS.includes(key) && key !== "%") return change({ input: key, done: false });
	if (OPERATORS.includes(key)) {
		if (!input()) return key === "−" ? change({ input: key }) : undefined;
		// − after × ÷ ( starts a negative number; any other operator replaces the one before it
		if (key === "−" && "×÷(".includes(last)) return change({ input: input() + key, done: false });
		if (OPERATORS.includes(last)) return change({ input: input().slice(0, -1) + key, done: false });
	}
	change({ input: input() + key, done: false });
};

// ###################
// Copy: the live result, or the line when it's a finished number; − becomes - so it pastes anywhere
// ###################
export const copyValue = (session = now()) => {
	const value = work(session.input);
	if (value !== null && !isPlain(session.input)) return value.replace(/−/g, "-");
	return isPlain(session.input) ? session.input.replace(/−/g, "-") : null;
};

// ###################
// The notice near the bottom ("Copied 48", "Pasted 12 × 3"), for 1.5 s;
// lastNotice keeps the words, so the notice still reads right while it fades out
// ###################
export const notice = signal(null);
export const lastNotice = signal({ label: "", value: "", error: false });
let unnotice = null;
const notify = (label, value = "", error = false) => {
	clearTimeout(unnotice);
	lastNotice({ label, value, error });
	notice(label);
	unnotice = setTimeout(() => notice(null), 1500);
};

// what was just copied, for the copy button's check mark
export const copied = signal(null);
let uncopy = null;

export const copy = async () => {
	const text = copyValue();
	if (text === null) return false;
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		// older webviews: copy through a hidden textarea
		const area = Object.assign(document.createElement("textarea"), { value: text });
		document.body.append(area);
		area.select();
		document.execCommand("copy");
		area.remove();
	}
	clearTimeout(uncopy);
	copied(text);
	uncopy = setTimeout(() => copied(null), 1500);
	notify("Copied", text);
	return true;
};

// ###################
// Paste: a number or calculation, added to the line like typing. Symbols become the keypad's
// (* → ×, / → ÷, - → −); spaces, a trailing = and thousands commas (1,234) are dropped.
// Anything else (letters…) is refused whole, so a paste never leaves half a line
// ###################
export const cleanPaste = (text) => {
	const line = String(text ?? "")
		.trim()
		.replace(/=\s*$/, "")
		.replace(/(\d),(?=\d{3}(\D|$))/g, "$1")
		.replace(/,/g, ".")
		.replace(/\s+/g, "")
		.replace(/[*xX]/g, "×")
		.replace(/\//g, "÷")
		.replace(/[-–]/g, "−");
	return line && line.length <= 200 && /^[0-9.%()+−×÷]+$/.test(line) ? line : null;
};

export const paste = (text) => {
	const line = cleanPaste(text);
	if (line === null) return notify("Can’t paste:", "not a calculation", true);
	// like a typed key: after Enter, a number starts a new line, an operator goes on
	const fresh = now().done && !/^[+−×÷%]/.test(line);
	change({ input: (fresh ? "" : input()) + line, done: false });
	notify("Pasted", show(line));
};

// ###################
// History of the current session: bring a calculation back (25÷5, not 5) to edit or go on, or clear it
// ###################
export const useLine = (i) => change({ input: now().lines[i].line, done: false });
export const clearHistory = () => change({ lines: [] });

// ###################
// What's open: "keys", "history" or "settings" (one at a time), and the about card
// ###################
export const panelOpen = signal(null);
export const togglePanel = (name) => panelOpen(panelOpen() === name ? null : name);
export const closePanel = () => panelOpen(null);

export const aboutOpen = signal(false);
export const openAbout = () => aboutOpen(true);
export const closeAbout = () => aboutOpen(false);

// ###################
// The window (Tauri): minimize and close; in a plain browser there's no window to control
// ###################
const win = globalThis.window?.__TAURI__?.window.getCurrentWindow() ?? null;
export const inTauri = win !== null;
export const minimize = () => win?.minimize();
export const quit = () => win?.close();
