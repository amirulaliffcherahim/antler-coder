use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::command;

#[derive(Default)]
pub struct ShellState {
    next_bg_id: AtomicU32,
    bg_processes: Mutex<HashMap<u32, BackgroundProcess>>,
}

pub struct BackgroundProcess {
    #[allow(dead_code)]
    pub command: String,
    #[allow(dead_code)]
    pub child: std::process::Child,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackgroundProcInfo {
    pub handle: u32,
    pub command: String,
    pub running: bool,
}

#[command]
pub async fn shell_bg_spawn(
    state: tauri::State<'_, ShellState>,
    command: String,
) -> Result<u32, String> {
    let mut child = std::process::Command::new("sh")
        .arg("-c")
        .arg(&command)
        .stdin(std::process::Stdio::null())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let id = state.next_bg_id.fetch_add(1, Ordering::SeqCst);
    let process = BackgroundProcess {
        command: command.clone(),
        child,
    };

    {
        let mut processes = state.bg_processes.lock().map_err(|e| e.to_string())?;
        processes.insert(id, process);
    }

    Ok(id)
}

#[command]
pub async fn shell_bg_kill(state: tauri::State<'_, ShellState>, handle: u32) -> Result<(), String> {
    let process = {
        let mut processes = state.bg_processes.lock().map_err(|e| e.to_string())?;
        processes.remove(&handle)
    };
    if let Some(mut process) = process {
        let _ = process.child.kill();
    }
    Ok(())
}

#[command]
pub async fn shell_bg_list(state: tauri::State<'_, ShellState>) -> Result<Vec<BackgroundProcInfo>, String> {
    let mut processes = state.bg_processes.lock().map_err(|e| e.to_string())?;
    let mut list = Vec::new();
    for (id, process) in processes.iter_mut() {
        let running = process.child.try_wait().map_err(|e| e.to_string())?.is_none();
        list.push(BackgroundProcInfo {
            handle: *id,
            command: process.command.clone(),
            running,
        });
    }
    Ok(list)
}

#[command]
pub async fn shell_bg_logs(_handle: u32) -> Result<String, String> {
    // Phase 0: stub — proper ring buffer in later phase
    Ok("".to_string())
}
