#![windows_subsystem = "windows"]

use std::env;
use std::fs;
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::Command;

const APP_EXE: &[u8] = include_bytes!("../../dist/portable/OracionConAmigos.exe");
const WEBVIEW_DLL: &[u8] = include_bytes!("../../dist/portable/WebView2Loader.dll");
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[link(name = "user32")]
extern "system" {
    fn MessageBoxW(hwnd: isize, text: *const u16, caption: *const u16, utype: u32) -> i32;
}

fn to_wide(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

fn msg_box(title: &str, body: &str, flags: u32) -> i32 {
    let t = to_wide(title);
    let b = to_wide(body);
    unsafe { MessageBoxW(0, b.as_ptr(), t.as_ptr(), flags) }
}

fn create_shortcut(target_exe: &Path, shortcut_path: &Path) {
    let ps_script = format!(
        "$s=(New-Object -COM WScript.Shell).CreateShortcut('{}');$s.TargetPath='{}';$s.WorkingDirectory='{}';$s.Description='Oración con amigos';$s.Save()",
        shortcut_path.display().to_string().replace('\'', "''"),
        target_exe.display().to_string().replace('\'', "''"),
        target_exe.parent().unwrap_or(Path::new(".")).display().to_string().replace('\'', "''")
    );
    let _ = Command::new("powershell")
        .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &ps_script])
        .creation_flags(CREATE_NO_WINDOW)
        .output();
}

fn main() {
    let local_appdata = env::var("LOCALAPPDATA").unwrap_or_else(|_| ".".to_string());
    let install_dir = PathBuf::from(&local_appdata)
        .join("Programs")
        .join("OracionConAmigos");

    if let Err(e) = fs::create_dir_all(&install_dir) {
        msg_box(
            "Error de instalación",
            &format!("No se pudo crear la carpeta de instalación:\n{}", e),
            0x10,
        );
        return;
    }

    let exe_path = install_dir.join("OracionConAmigos.exe");
    let dll_path = install_dir.join("WebView2Loader.dll");

    if let Err(e) = fs::write(&exe_path, APP_EXE).and_then(|_| fs::write(&dll_path, WEBVIEW_DLL)) {
        msg_box(
            "Error de instalación",
            &format!(
                "No se pudieron copiar los archivos (cierra la app si está abierta):\n{}",
                e
            ),
            0x10,
        );
        return;
    }

    if let Ok(appdata) = env::var("APPDATA") {
        let start_menu = PathBuf::from(appdata)
            .join("Microsoft\\Windows\\Start Menu\\Programs\\Oración con amigos.lnk");
        create_shortcut(&exe_path, &start_menu);
    }

    if let Ok(userprofile) = env::var("USERPROFILE") {
        let desktop = PathBuf::from(userprofile).join("Desktop\\Oración con amigos.lnk");
        create_shortcut(&exe_path, &desktop);
    }

    // MB_YESNO (0x04) | MB_ICONINFORMATION (0x40) -> IDYES = 6
    let res = msg_box(
        "Instalación completada",
        &format!(
            "Oración con amigos se instaló correctamente en:\n{}\n\nSe crearon accesos directos en el Escritorio y Menú Inicio.\n\n¿Deseas abrir la aplicación ahora?",
            install_dir.display()
        ),
        0x04 | 0x40,
    );

    if res == 6 {
        let _ = Command::new(&exe_path).spawn();
    }
}
