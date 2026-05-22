use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use notify::Watcher;
use tauri::Emitter;

#[derive(Default)]
pub struct WatcherState {
    pub watchers: Mutex<HashMap<String, notify::RecommendedWatcher>>,
}

#[tauri::command]
pub async fn watcher_start(
    state: tauri::State<'_, WatcherState>,
    window: tauri::WebviewWindow,
    path: String,
) -> Result<(), String> {
    let watch_path = PathBuf::from(&path);
    let window_id = window.label().to_string();

    let mut watchers = state.watchers.lock().map_err(|e| e.to_string())?;

    // Stop existing watcher for this window if any
    let _ = watchers.remove(&window_id);

    let window_clone = window.clone();
    let mut watcher = notify::recommended_watcher(move |res: Result<notify::Event, notify::Error>| {
        if let Ok(event) = res {
            let paths: Vec<String> = event.paths.iter()
                .filter_map(|p| p.to_str().map(|s| s.to_string()))
                .collect();
            if !paths.is_empty() {
                let _ = window_clone.emit("fs:changed", serde_json::json!({
                    "paths": paths,
                    "kind": format!("{:?}", event.kind),
                }));
            }
        }
    })
    .map_err(|e| e.to_string())?;

    watcher.watch(&watch_path, notify::RecursiveMode::Recursive)
        .map_err(|e| e.to_string())?;

    watchers.insert(window_id, watcher);
    Ok(())
}

#[tauri::command]
pub async fn watcher_stop(
    state: tauri::State<'_, WatcherState>,
    window: tauri::WebviewWindow,
) -> Result<(), String> {
    let mut watchers = state.watchers.lock().map_err(|e| e.to_string())?;
    let _ = watchers.remove(window.label());
    Ok(())
}
