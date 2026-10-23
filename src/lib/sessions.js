// ###################
// Saving sessions in localStorage, and reading them back safely
// Saved data can be old, cut short or edited by hand: anything wrong starts one empty session
// ###################

const KEY = "orbit.sessions";
const VERSION = 1;

export const MAX_SESSIONS = 9;     // Ctrl+1 … Ctrl+9
export const MAX_LINES = 200;      // history kept per session (for the history panel); older lines are dropped
const MAX_TEXT = 1000;             // longest line or result kept

// done: the line is a result from Enter, so the next digit starts a new line
// caret (optional): where the next key goes; without it, at the end
export const blank = () => ({ input: "", lines: [], done: false });
export const fresh = () => ({ sessions: [blank()], current: 0 });

// ###################
// Checking: every field must be the right type, or the whole thing is refused
// ###################
const isText = (v) => typeof v === "string" && v.length <= MAX_TEXT;
const isLine = (l) => l !== null && typeof l === "object" && isText(l.line) && isText(l.result);
const isSession = (s) =>
	s !== null && typeof s === "object" && isText(s.input) && Array.isArray(s.lines) && s.lines.every(isLine) && (s.done === undefined || typeof s.done === "boolean");

// saved text → { sessions, current }; anything broken gives fresh()
export const restore = (text) => {
	try {
		const data = JSON.parse(text);
		if (data?.version !== VERSION) return fresh();
		const { sessions, current } = data;
		if (!Array.isArray(sessions) || sessions.length < 1 || sessions.length > MAX_SESSIONS) return fresh();
		if (!sessions.every(isSession)) return fresh();
		if (!Number.isInteger(current) || current < 0 || current >= sessions.length) return fresh();
		// only the known fields, so nothing extra rides along
		return {
			sessions: sessions.map((s) => ({
				input: s.input,
				// a caret outside the line is dropped (the caret goes to the end)
				...(Number.isInteger(s.caret) && s.caret >= 0 && s.caret <= s.input.length ? { caret: s.caret } : {}),
				lines: s.lines.slice(-MAX_LINES).map(({ line, result }) => ({ line, result })),
				done: s.done === true
			})),
			current
		};
	} catch {
		return fresh();
	}
};

// { sessions, current } → saved text
export const store = ({ sessions, current }) =>
	JSON.stringify({ version: VERSION, sessions: sessions.map((s) => ({ ...s, lines: s.lines.slice(-MAX_LINES) })), current });

// ###################
// localStorage can be missing or full (private mode, quota): both just do nothing
// ###################
export const load = () => {
	try {
		return restore(localStorage.getItem(KEY));
	} catch {
		return fresh();
	}
};

export const save = (state) => {
	try {
		localStorage.setItem(KEY, store(state));
	} catch {}
};
