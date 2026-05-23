mod modules;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        // updater plugin needs tauri.conf.json plugins.updater config — see Phase 7
        .manage(modules::agent_shell::AgentShellState::default())
        .manage(modules::watcher::WatcherState::default())
        .invoke_handler(tauri::generate_handler![
            // Agent Shell
            modules::agent_shell::agent_discover,
            modules::agent_shell::agent_pty_open,
            modules::agent_shell::agent_pty_write,
            modules::agent_shell::agent_pty_resize,
            modules::agent_shell::agent_pty_close,
            // File System
            modules::fs::fs_read_file,
            modules::fs::fs_write_file,
            modules::fs::fs_list_dir,
            // Search
            modules::search::search_ripgrep,
            // Watcher
            modules::watcher::watcher_start,
            modules::watcher::watcher_stop,
            // Secrets
            modules::secrets::secret_get,
            modules::secrets::secret_set,
            modules::secrets::secret_delete,
            // Workspace
            modules::workspace::wsl_list_distros,
            modules::workspace::wsl_default_distro,
            modules::workspace::wsl_home,
            // Shell
            modules::shell::shell_bg_spawn,
            modules::shell::shell_bg_kill,
            modules::shell::shell_bg_list,
            modules::shell::shell_bg_logs,
            // Git
            modules::git::git_status,
            modules::git::git_diff,
            modules::git::git_branch,
            modules::git::git_show,
            // Updater
            modules::updater::check_update,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.handle().get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
