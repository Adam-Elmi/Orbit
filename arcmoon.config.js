// ###################
// ArcMoon config for Orbit
// ###################
export default {
	importAliases: { "@": "./src" },   // [import = X: "@/components/X.arcm" !]
	outDir: "./dist",                  // "npm run build" writes here; Tauri shows it
	bundle: ["mathjs"]                 // npm packages runtime code may import
};
