// ###################
// The keyboard: calculator keys, Esc, and Ctrl shortcuts (1–9 go to a session, ← → move,
// T opens, W closes, Q quits). Imported once by the page
// ###################

import { press, go, open, close, quit, current, aboutOpen, closeAbout, panelOpen, closePanel } from "./state.js";

const KEYBOARD = { "-": "−", "*": "×", x: "×", "/": "÷", ",": ".", Enter: "=", Backspace: "⌫", Escape: "C", Delete: "C" };

const ctrlAction = (k) =>
	/^[1-9]$/.test(k) ? () => go(Number(k) - 1)
	: k === "arrowleft" ? () => go(current() - 1)
	: k === "arrowright" ? () => go(current() + 1)
	: k === "t" ? open
	: k === "w" ? close
	: k === "q" ? quit
	: null;

window.addEventListener("keydown", (e) => {
	if (e.altKey || e.metaKey) return;
	if (e.ctrlKey) {
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
	const key = KEYBOARD[e.key] ?? e.key;
	if (!/^[0-9.%()+−×÷=C⌫]$/.test(key) || (key === "C" && e.key === "C")) return;
	e.preventDefault();
	press(key);
});
