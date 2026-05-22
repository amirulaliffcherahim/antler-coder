use portable_pty::{native_pty_system, CommandBuilder, PtySize};
use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::ipc::Channel;

use crate::modules::workspace::WorkspaceEnv;

use super::AgentShellState;

pub struct AgentSession {
    pub id: u32,
    pub writer: Arc<Mutex<Box<dyn Write + Send>>>,
    pub closed: Arc<AtomicBool>,
}

impl AgentSession {
    pub async fn write(&self, data: String) -> Result<(), String> {
        let mut writer = self.writer.lock().map_err(|e| e.to_string())?;
        writer
            .write_all(data.as_bytes())
            .map_err(|e| e.to_string())?;
        writer.flush().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub async fn resize(&self, _cols: u16, _rows: u16) -> Result<(), String> {
        // PTY resize is tricky with portable-pty; for now, we'll implement it in a later phase
        Ok(())
    }

    pub async fn close(&self) -> Result<(), String> {
        self.closed.store(true, Ordering::SeqCst);
        Ok(())
    }
}

pub async fn open_agent_pty(
    state: tauri::State<'_, AgentShellState>,
    command: String,
    args: Vec<String>,
    env: HashMap<String, String>,
    cwd: Option<String>,
    workspace: WorkspaceEnv,
    cols: u16,
    rows: u16,
    on_data: Channel<Vec<u8>>,
    _on_exit: Channel<i32>,
) -> Result<u32, String> {
    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| e.to_string())?;

    let cmd = build_agent_command(&command, &args, &workspace, cwd.as_deref())?;

    // Set env vars
    let mut cmd = cmd;
    for (k, v) in env {
        cmd.env(k, v);
    }

    let _child = pair
        .slave
        .spawn_command(cmd)
        .map_err(|e| e.to_string())?;

    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;
    let writer = Arc::new(Mutex::new(
        pair.master.take_writer().map_err(|e| e.to_string())?,
    ));
    let closed = Arc::new(AtomicBool::new(false));
    let closed_clone = closed.clone();

    // Spawn read thread
    thread::spawn(move || {
        let mut buf = [0u8; 8192];
        loop {
            if closed_clone.load(Ordering::SeqCst) {
                break;
            }
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let data = buf[..n].to_vec();
                    let _ = on_data.send(data);
                }
                Err(_) => break,
            }
        }
    });

    // Spawn wait thread for exit
    // (simplified for Phase 0 — proper exit notification in Phase 4)

    let id = {
        let mut next = state.next_id.lock().map_err(|e| e.to_string())?;
        let id = *next;
        *next += 1;
        id
    };

    let session = AgentSession {
        id,
        writer,
        closed,
    };

    {
        let mut sessions = state.sessions.lock().map_err(|e| e.to_string())?;
        sessions.insert(id, session);
    }

    Ok(id)
}

fn build_agent_command(
    binary: &str,
    args: &[String],
    workspace: &WorkspaceEnv,
    cwd: Option<&str>,
) -> Result<CommandBuilder, String> {
    match workspace {
        WorkspaceEnv::Local => {
            let mut cmd = CommandBuilder::new(binary);
            cmd.args(args.iter().map(|s| s.as_str()));
            if let Some(cwd) = cwd {
                cmd.cwd(cwd);
            }
            Ok(cmd)
        }
        #[cfg(windows)]
        WorkspaceEnv::Wsl { distro } => {
            use crate::modules::workspace::validate_wsl_distro_name;
            validate_wsl_distro_name(distro)?;
            let mut cmd = CommandBuilder::new("wsl.exe");
            cmd.arg("-d").arg(distro);
            if let Some(cwd) = cwd {
                cmd.arg("--cd").arg(cwd);
            }
            cmd.arg("--exec").arg(binary);
            cmd.args(args.iter().map(|s| s.as_str()));
            Ok(cmd)
        }
        #[cfg(not(windows))]
        WorkspaceEnv::Wsl { .. } => {
            Err("WSL is only supported on Windows".to_string())
        }
    }
}
