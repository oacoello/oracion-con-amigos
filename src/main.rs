#![windows_subsystem = "windows"]

use std::fs;
use std::path::PathBuf;
use tao::dpi::LogicalSize;
use tao::event::{Event, WindowEvent};
use tao::event_loop::{ControlFlow, EventLoop};
use tao::window::WindowBuilder;
use wry::WebViewBuilder;

const INDEX_HTML: &str = include_str!("../static/index.html");
const STYLES_CSS: &str = include_str!("../static/styles.css");
const APP_JS: &str = include_str!("../static/app.js");
const CONFIG_FILE_NAME: &str = "oracion_config.json";

const DEFAULT_CONFIG_JSON: &str = r#"{
  "title": "Oración con amigos",
  "darkMode": false,
  "soundEnabled": true,
  "autoAdvance": true,
  "segments": [
    {
      "id": "seg-1",
      "title": "Alabanza y Acción de Gracias",
      "description": "Agradecemos a Dios por su fidelidad, su amor y las bendiciones de esta semana.",
      "durationSeconds": 180,
      "scene": "serenity"
    },
    {
      "id": "seg-2",
      "title": "Por nuestras familias y seres queridos",
      "description": "Oramos por paz, salud, unidad y fortaleza en cada hogar.",
      "durationSeconds": 240,
      "scene": "dawn"
    },
    {
      "id": "seg-3",
      "title": "Por la iglesia y la comunidad",
      "description": "Pedimos sabiduría para los líderes, unidad en el cuerpo y corazones dispuestos a servir.",
      "durationSeconds": 240,
      "scene": "forest"
    },
    {
      "id": "seg-4",
      "title": "Peticiones personales y sanidad",
      "description": "Presentamos delante de Dios las necesidades específicas, cargas y procesos de sanidad.",
      "durationSeconds": 300,
      "scene": "lavender"
    },
    {
      "id": "seg-5",
      "title": "Cierre y envío",
      "description": "Encomendamos nuestros caminos y proyectos en las manos del Señor.",
      "durationSeconds": 120,
      "scene": "ocean"
    }
  ]
}"#;

fn config_path() -> PathBuf {
    if let Ok(appdata) = std::env::var("APPDATA") {
        let dir = PathBuf::from(appdata).join("OracionConAmigos");
        let _ = fs::create_dir_all(&dir);
        return dir.join(CONFIG_FILE_NAME);
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            return dir.join(CONFIG_FILE_NAME);
        }
    }
    PathBuf::from(CONFIG_FILE_NAME)
}

fn load_config() -> String {
    let path = config_path();
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            let trimmed = content.trim();
            if trimmed.starts_with('{') && trimmed.ends_with('}') {
                return trimmed.to_string();
            }
        }
    }
    DEFAULT_CONFIG_JSON.to_string()
}

fn build_app_html() -> String {
    let initial_config = load_config();
    INDEX_HTML
        .replace("<!--__INLINE_CSS__-->", &format!("<style>{}</style>", STYLES_CSS))
        .replace(
            "<!--__INITIAL_CONFIG__-->",
            &format!("<script>window.__INITIAL_CONFIG__ = {};</script>", initial_config),
        )
        .replace("<!--__INLINE_JS__-->", &format!("<script>{}</script>", APP_JS))
}

fn main() -> wry::Result<()> {
    let event_loop = EventLoop::new();
    let window = WindowBuilder::new()
        .with_title("Oración con amigos")
        .with_inner_size(LogicalSize::new(1080.0, 720.0))
        .with_min_inner_size(LogicalSize::new(420.0, 520.0))
        .build(&event_loop)
        .expect("No se pudo crear la ventana de escritorio");

    let html = build_app_html();

    let _webview = WebViewBuilder::new()
        .with_html(html)
        .with_ipc_handler(|req| {
            let body = req.body().trim();
            if body.starts_with('{') && body.ends_with('}') {
                let _ = fs::write(config_path(), body.as_bytes());
            }
        })
        .build(&window)?;

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        if let Event::WindowEvent {
            event: WindowEvent::CloseRequested,
            ..
        } = event
        {
            *control_flow = ControlFlow::Exit;
        }
    });
}
