# Oración con amigos

Aplicación de escritorio hecha en **Rust** (`tao` + `wry`) con interfaz **Material 3 Expressive** para guiar tiempos de oración en videollamadas (Google Meet, Zoom, etc.).

## Características
- **Aplicación de escritorio nativa** (sin servidor local ni ventana de terminal).
- **Escenarios visuales por punto**: 6 paletas Material Expressive (*Índigo Sereno*, *Amanecer Cálido*, *Bosque de Paz*, *Lavanda Suave*, *Océano Claro* y *Ámbar Dorado*) que cambian suavemente al pasar de segmento.
- **Animación sutil en el fondo y cronómetro**: Orbes ambientales suaves y anillo circular continuo con campana sintetizada opcional.
- **Persistencia automática**: Tu último programa de puntos se guarda en `%APPDATA%\OracionConAmigos\oracion_config.json`.
- **Ocultar controles (`H`)**: Limpia la ventana al instante para compartirla en videollamadas.
- **Diseño responsive**: Se adapta a ventanas grandes, medias o compactas.

## Descarga e instalación (Windows)
1. Descarga `OracionConAmigos-Setup.exe` (instalador) o `OracionConAmigos-Portable-win64.zip` desde la sección **Releases**.
2. Ejecuta `OracionConAmigos-Setup.exe` para instalar y crear accesos directos en el Escritorio y Menú Inicio.

## Compilar desde el código fuente
```powershell
cargo build --release
cargo build --manifest-path installer/Cargo.toml --release
```
