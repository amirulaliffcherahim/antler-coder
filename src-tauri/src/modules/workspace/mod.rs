use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WorkspaceEnv {
    Local,
    #[cfg(windows)]
    Wsl { distro: String },
    #[cfg(not(windows))]
    #[serde(skip)]
    Wsl { distro: String },
}

impl Default for WorkspaceEnv {
    fn default() -> Self {
        WorkspaceEnv::Local
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WslDistro {
    pub name: String,
    #[serde(rename = "default")]
    pub is_default: bool,
    pub running: bool,
}

#[cfg(windows)]
pub fn validate_wsl_distro_name(distro: &str) -> Result<(), String> {
    if distro.is_empty() || distro.len() > 255 {
        return Err("invalid WSL distro name length".to_string());
    }
    if distro.contains("..") || distro.contains('/') || distro.contains('\\') {
        return Err("unsafe WSL distro name".to_string());
    }
    Ok(())
}

#[cfg(not(windows))]
pub fn validate_wsl_distro_name(_distro: &str) -> Result<(), String> {
    Err("WSL is only supported on Windows".to_string())
}

#[cfg(windows)]
pub fn wsl_exec_capture(
    distro: &str,
    program: &str,
    args: &[&str],
) -> Result<String, String> {
    use std::process::Command;
    validate_wsl_distro_name(distro)?;

    let mut cmd = Command::new("wsl.exe");
    cmd.arg("-d").arg(distro);
    cmd.arg("--exec").arg(program);
    cmd.args(args);

    let output = cmd.output().map_err(|e| e.to_string())?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let err = String::from_utf8_lossy(&output.stderr);
        Err(format!("wsl exec failed: {}", err))
    }
}

#[cfg(not(windows))]
pub fn wsl_exec_capture(
    _distro: &str,
    _program: &str,
    _args: &[&str],
) -> Result<String, String> {
    Err("WSL is only supported on Windows".to_string())
}

#[command]
pub async fn wsl_list_distros() -> Result<Vec<WslDistro>, String> {
    #[cfg(windows)]
    {
        let output = tokio::process::Command::new("wsl.exe")
            .arg("--list")
            .arg("--verbose")
            .output()
            .await
            .map_err(|e| e.to_string())?;

        let text = String::from_utf8_lossy(&output.stdout);
        let mut distros = Vec::new();

        for line in text.lines().skip(1) {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                let name = parts[0].trim_matches('\0').to_string();
                let state = parts.get(2).unwrap_or(&"Stopped");
                let running = *state == "Running";
                distros.push(WslDistro {
                    name,
                    is_default: false,
                    running,
                });
            }
        }

        if let Some(first) = distros.first_mut() {
            first.is_default = true;
        }

        Ok(distros)
    }
    #[cfg(not(windows))]
    {
        Ok(vec![])
    }
}

#[command]
pub async fn wsl_default_distro() -> Result<Option<String>, String> {
    #[cfg(windows)]
    {
        let output = tokio::process::Command::new("wsl.exe")
            .arg("--list")
            .arg("--quiet")
            .output()
            .await
            .map_err(|e| e.to_string())?;

        let text = String::from_utf8_lossy(&output.stdout);
        Ok(text.lines().next().map(|s| s.trim().to_string()))
    }
    #[cfg(not(windows))]
    {
        Ok(None)
    }
}

#[command]
pub async fn wsl_home(distro: String) -> Result<String, String> {
    #[cfg(windows)]
    {
        let output = wsl_exec_capture(&distro, "sh", &["-c", "echo ~"])?;
        Ok(output.trim().to_string())
    }
    #[cfg(not(windows))]
    {
        let _ = distro;
        Err("WSL is only supported on Windows".to_string())
    }
}
