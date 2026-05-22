use keyring::Entry;
use tauri::command;

const SERVICE_NAME: &str = "com.antler.coder";

fn key(key: &str) -> String {
    format!("{}", key)
}

#[command]
pub async fn secret_get(key_name: String) -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE_NAME, &key(&key_name)).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(value) => Ok(Some(value)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub async fn secret_set(key_name: String, value: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, &key(&key_name)).map_err(|e| e.to_string())?;
    entry.set_password(&value).map_err(|e| e.to_string())
}

#[command]
pub async fn secret_delete(key_name: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE_NAME, &key(&key_name)).map_err(|e| e.to_string())?;
    entry.delete_credential().map_err(|e| e.to_string())
}
