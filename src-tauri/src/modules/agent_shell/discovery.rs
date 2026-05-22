use crate::modules::workspace::WorkspaceEnv;

use super::DetectedAgent;

const KNOWN_AGENTS: &[&str] = &[
    "claude",
    "gemini",
    "aider",
    "opencode",
    "pi",
    "codex",
    "goose",
    "continue",
    "supermaven",
    "hermes",
];

pub async fn discover_agents(
    workspace: WorkspaceEnv,
) -> Result<Vec<DetectedAgent>, String> {
    match workspace {
        WorkspaceEnv::Local => discover_local().await,
        #[cfg(windows)]
        WorkspaceEnv::Wsl { distro } => discover_wsl(&distro).await,
        #[cfg(not(windows))]
        WorkspaceEnv::Wsl { .. } => Ok(vec![]),
    }
}

async fn discover_local() -> Result<Vec<DetectedAgent>, String> {
    let mut agents = Vec::new();
    for name in KNOWN_AGENTS {
        if let Ok(path) = which::which(name) {
            let version = get_version(name).await.ok();
            agents.push(DetectedAgent {
                id: name.to_string(),
                name: pretty_name(name),
                path: path.to_string_lossy().to_string(),
                version,
                source: "local".to_string(),
            });
        }
    }
    Ok(agents)
}

#[cfg(windows)]
async fn discover_wsl(distro: &str) -> Result<Vec<DetectedAgent>, String> {
    use crate::modules::workspace::wsl_exec_capture;
    use crate::modules::workspace::validate_wsl_distro_name;

    validate_wsl_distro_name(distro)?;

    let script = build_discovery_script();
    let output = wsl_exec_capture(distro, "sh", &["-c", &script])?;

    let mut agents = Vec::new();
    for line in output.lines() {
        let parts: Vec<&str> = line.splitn(2, ':').collect();
        if parts.len() == 2 {
            let name = parts[0].trim().to_string();
            let path = parts[1].trim().to_string();
            let version = get_version_wsl(distro, &name).await.ok();
            agents.push(DetectedAgent {
                id: name.clone(),
                name: pretty_name(&name),
                path,
                version,
                source: format!("wsl:{distro}"),
            });
        }
    }
    Ok(agents)
}

fn build_discovery_script() -> String {
    let names = KNOWN_AGENTS.join(" ");
    format!(
        r#"for cmd in {names}; do
    if path=$(command -v "$cmd" 2>/dev/null); then
        echo "$cmd:$path"
    fi
done"#
    )
}

async fn get_version(binary: &str) -> Result<String, String> {
    // Try common version flags
    let output = tokio::process::Command::new(binary)
        .arg("--version")
        .output()
        .await
        .map_err(|e| e.to_string())?;

    if output.status.success() {
        let text = String::from_utf8_lossy(&output.stdout);
        Ok(text.trim().to_string())
    } else {
        Err("version check failed".to_string())
    }
}

#[cfg(windows)]
async fn get_version_wsl(distro: &str, binary: &str) -> Result<String, String> {
    use crate::modules::workspace::wsl_exec_capture;

    let output = wsl_exec_capture(
        distro,
        "sh",
        &["-c", &format!("{} --version 2>/dev/null || echo 'unknown'", binary)],
    )?;
    Ok(output.trim().to_string())
}

fn pretty_name(binary: &str) -> String {
    match binary {
        "claude" => "Claude Code",
        "gemini" => "Gemini CLI",
        "aider" => "Aider",
        "opencode" => "OpenCode",
        "pi" => "Pi",
        "codex" => "Codex CLI",
        "goose" => "Goose",
        "continue" => "Continue",
        "supermaven" => "Supermaven",
        "hermes" => "Hermes",
        _ => binary,
    }
    .to_string()
}
