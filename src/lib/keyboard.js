// ###################
// The keyboard: calculator keys, the caret (← → Home End), Esc, and Ctrl shortcuts (1–9 go to a session, ← → move,
// T opens, W closes, C copies, V pastes, Q quits). Imported once by the page
// ###################

import { press, move, moveTo, input, go, open, close, quit, copy, paste, current, aboutOpen, closeAbout, panelOpen, closePanel } from "./state.js";

const KEYBOARD = { "-": "−", "*": "×", x: "×", "/": "÷", ",": ".", Enter: "=", Backspace: "⌫", Escape: "C", Delete: "Del" };

const ctrlAction = (k) =>
	/^[1-9]$/.test(k) ? () => go(Number(k) - 1)
	: k === "arrowleft" ? () => go(current() - 1)
	: k === "arrowright" ? () => go(current() + 1)
	: k === "t" ? open
	: k === "w" ? close
	: k === "q" ? quit
	: k === "c" ? copy
	: null;

// ###################
// Ctrl+V: the browser's paste event carries the text without asking permission. If it doesn't
// come (some webviews only send it to text fields), read the clipboard instead
// ###################
let pasted = false;
window.addEventListener("paste", (e) => {
	e.preventDefault();
	pasted = true;
	paste(e.clipboardData?.getData("text/plain"));
});
const pasteFallback = () => {
	pasted = false;
	setTimeout(async () => {
		if (pasted) return;
		try {
			paste(await navigator.clipboard.readText());
		} catch {}
	}, 80);
};

window.addEventListener("keydown", (e) => {
	if (e.altKey || e.metaKey) return;
	if (e.ctrlKey) {
		// Ctrl+V: let the paste event happen (no preventDefault), with a fallback
		if (e.key.toLowerCase() === "v") return pasteFallback();
		// Ctrl+A would select every button's text: Orbit has nothing to select
		if (e.key.toLowerCase() === "a") return e.preventDefault();
		const act = ctrlAction(e.key.toLowerCase());
		if (act) {
			e.preventDefault();
			act();
		}
		return;
	}
	// Esc closes what's open first: the about card, then a panel or settings
	if (e.key === "Escape" && aboutOpen()) {
		e.preventDefault();
		return closeAbout();
	}
	if (e.key === "Escape" && panelOpen()) {
		e.preventDefault();
		return closePanel();
	}
	// the caret: ← → one character, Home / End to the ends
	const caret = { ArrowLeft: () => move(-1), ArrowRight: () => move(1), Home: () => moveTo(0), End: () => moveTo(input().length) }[e.key];
	if (caret && !e.shiftKey) {
		e.preventDefault();
		return caret();
	}
	const key = KEYBOARD[e.key] ?? e.key;
	if (!/^([0-9.%()+−×÷^=C⌫]|Del)$/.test(key) || (key === "C" && e.key === "C")) return;
	e.preventDefault();
	press(key);
});
