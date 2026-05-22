use std::collections::HashMap;
use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{ipc::Channel, State};

pub mod discovery;
pub mod spawn;

#[derive(Default)]
pub struct AgentShellState {
    pub next_id: Mutex<u32>,
    pub sessions: Mutex<HashMap<u32, spawn::AgentSession>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedAgent {
    pub id: String,
    pub name: String,
    pub path: String,
    pub version: Option<String>,
    pub source: String,
}

#[tauri::command]
pub async fn agent_discover(
    workspace: crate::modules::workspace::WorkspaceEnv,
) -> Result<Vec<DetectedAgent>, String> {
    discovery::discover_agents(workspace).await
}

#[tauri::command]
pub async fn agent_pty_open(
    state: State<'_, AgentShellState>,
    command: String,
    args: Vec<String>,
    env: HashMap<String, String>,
    cwd: Option<String>,
    workspace: crate::modules::workspace::WorkspaceEnv,
    cols: u16,
    rows: u16,
    on_data: Channel<Vec<u8>>,
    on_exit: Channel<i32>,
) -> Result<u32, String> {
    spawn::open_agent_pty(
        state, command, args, env, cwd, workspace, cols, rows, on_data, on_exit,
    )
    .await
}

#[tauri::command]
pub async fn agent_pty_write(
    state: State<'_, AgentShellState>,
    id: u32,
    data: String,
) -> Result<(), String> {
    let writer = {
        let sessions = state.sessions.lock().map_err(|e| e.to_string())?;
        let session = sessions.get(&id).ok_or("no such agent session")?;
        session.writer.clone()
    };
    let mut writer = writer.lock().map_err(|e| e.to_string())?;
    writer
        .write_all(data.as_bytes())
        .map_err(|e| e.to_string())?;
    writer.flush().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn agent_pty_resize(
    state: State<'_, AgentShellState>,
    id: u32,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let closed = {
        let sessions = state.sessions.lock().map_err(|e| e.to_string())?;
        let session = sessions.get(&id).ok_or("no such agent session")?;
        session.closed.clone()
    };
    if closed.load(std::sync::atomic::Ordering::SeqCst) {
        return Err("session closed".to_string());
    }
    // PTY resize placeholder — Phase 4 implementation
    let _ = (cols, rows);
    Ok(())
}

#[tauri::command]
pub async fn agent_pty_close(
    state: State<'_, AgentShellState>,
    id: u32,
) -> Result<(), String> {
    let session = {
        let mut sessions = state.sessions.lock().map_err(|e| e.to_string())?;
        sessions.remove(&id)
    };
    if let Some(session) = session {
        let _ = session.close().await;
    }
    Ok(())
}
