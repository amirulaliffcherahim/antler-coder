use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub path: String,
    pub line: u32,
    pub column: u32,
    pub text: String,
}

#[command]
pub async fn search_ripgrep(
    query: String,
    path: String,
    regex: bool,
    case_sensitive: bool,
) -> Result<Vec<SearchResult>, String> {
    let mut cmd = tokio::process::Command::new("rg");
    cmd.arg("--json")
        .arg("--line-number")
        .arg("--column")
        .arg("--max-columns=200")
        .arg("--max-columns-preview")
        .arg("--smart-case")
        .arg(&query)
        .current_dir(&path);

    if !case_sensitive {
        cmd.arg("--ignore-case");
    }
    if !regex {
        cmd.arg("--fixed-strings");
    }

    let output = cmd.output().await.map_err(|e| e.to_string())?;
    let text = String::from_utf8_lossy(&output.stdout);

    let mut results = Vec::new();
    for line in text.lines() {
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(line) {
            if json.get("type").and_then(|t| t.as_str()) == Some("match") {
                if let Some(data) = json.get("data") {
                    let path = data
                        .get("path")
                        .and_then(|p| p.get("text"))
                        .and_then(|t| t.as_str())
                        .unwrap_or("")
                        .to_string();
                    let line_num = data
                        .get("line_number")
                        .and_then(|n| n.as_u64())
                        .unwrap_or(0) as u32;
                    let col = data
                        .get("submatches")
                        .and_then(|s| s.as_array())
                        .and_then(|a| a.first())
                        .and_then(|m| m.get("start"))
                        .and_then(|s| s.as_u64())
                        .unwrap_or(0) as u32;
                    let text = data
                        .get("lines")
                        .and_then(|l| l.get("text"))
                        .and_then(|t| t.as_str())
                        .unwrap_or("")
                        .trim_end()
                        .to_string();

                    results.push(SearchResult {
                        path,
                        line: line_num,
                        column: col,
                        text,
                    });
                }
            }
        }
    }

    Ok(results)
}
