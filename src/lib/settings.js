// ###################
// Settings, saved apart from the sessions (clearing sessions keeps them)
// A bad saved field falls back to its default; the others are kept
// ###################

const KEY = "orbit.settings";

export const DECIMALS = ["auto", 2, 4, 6, 10];   // auto: up to 15 digits, no trailing zeros
export const INDICATORS = ["dots", "numbers"];      // how the sessions show under the display
export const THEMES = ["system", "light", "dark"];  // system follows the desktop

export const defaults = () => ({ decimals: "auto", indicator: "dots", theme: "system" });

// saved text → settings
export const restoreSettings = (text) => {
	const settings = defaults();
	try {
		const data = JSON.parse(text);
		if (DECIMALS.includes(data?.decimals)) settings.decimals = data.decimals;
		if (INDICATORS.includes(data?.indicator)) settings.indicator = data.indicator;
		if (THEMES.includes(data?.theme)) settings.theme = data.theme;
	} catch {}
	return settings;
};

// ###################
// localStorage can be missing or full: loading gives the defaults, saving does nothing
// ###################
export const loadSettings = () => {
	try {
		return restoreSettings(localStorage.getItem(KEY));
	} catch {
		return defaults();
	}
};

export const saveSettings = (settings) => {
	try {
		localStorage.setItem(KEY, JSON.stringify(settings));
	} catch {}
};
