use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateCheckResult {
    pub available: bool,
    pub version: Option<String>,
    pub body: Option<String>,
}

#[command]
pub async fn check_update() -> Result<UpdateCheckResult, String> {
    // Phase 0: stub — updater integration in Phase 7
    Ok(UpdateCheckResult {
        available: false,
        version: None,
        body: None,
    })
}
