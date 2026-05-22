use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitStatusEntry {
    pub path: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GitBranch {
    pub name: String,
    pub current: bool,
}

#[command]
pub async fn git_status(_path: String) -> Result<Vec<GitStatusEntry>, String> {
    // Phase 0: stub — full implementation in Phase 6
    Ok(vec![])
}

#[command]
pub async fn git_diff(path: String, staged: bool) -> Result<String, String> {
    let mut cmd = tokio::process::Command::new("git");
    cmd.arg("diff");
    if staged {
        cmd.arg("--staged");
    }
    cmd.arg("--").arg(&path);

    let output = cmd.output().await.map_err(|e| e.to_string())?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
pub async fn git_branch(path: String) -> Result<Vec<GitBranch>, String> {
    let output = tokio::process::Command::new("git")
        .arg("branch")
        .arg("-a")
        .current_dir(&path)
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let text = String::from_utf8_lossy(&output.stdout);
    let mut branches = Vec::new();
    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        let current = trimmed.starts_with("* ");
        let name = if current {
            &trimmed[2..]
        } else {
            trimmed
        };
        branches.push(GitBranch {
            name: name.to_string(),
            current,
        });
    }
    Ok(branches)
}
