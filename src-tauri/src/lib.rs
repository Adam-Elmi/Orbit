// The window, plus the opener plugin so the repository link opens in the browser;
// everything else is the ArcMoon page in ../dist
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .run(tauri::generate_context!())
    .expect("error while running Orbit");
}
