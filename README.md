# Landing page con placeholders

Landing page en español, con fondo blanco, bordes negros y nombres técnicos en lugar de contenido real. El sitio contiene un único encabezado, navegación horizontal, hero, acerca de, módulos, banner, preguntas frecuentes, contacto y pie de página. El menú se despliega en móvil. No tiene interfaz de previsualización, leyendas ni explicaciones.

## Abrir la página

Necesita Node.js 24 o superior. El archivo `.nvmrc` y la comprobación automática utilizan Node.js 24. No requiere instalar dependencias ni compilar.

```powershell
npm run dev
```

Abrir [http://localhost:4180](http://localhost:4180). El servidor rechaza expresamente el puerto 4173 para preservar el otro proyecto.

Si 4180 está ocupado, seleccionar otro puerto en PowerShell:

```powershell
$env:PORT = '4181'
npm run dev
```

## Archivos

- `index.html`: estructura y etiquetas en español.
- `styles.css`: apariencia, adaptación a móvil y estilos de impresión.
- `app.js`: menú móvil, navegación, efectos del hero, transición entre secciones y estado del formulario.
- `hero-background.css` y `hero-background.js`: tres fondos de ejemplo y su selector.
- `server.mjs`: servidor local sin dependencias.

Los enlaces internos, los efectos al pasar el cursor y los acordeones funcionan. El formulario muestra «Mensaje de confirmación» al enviarlo, sin transmitir ni guardar datos. Los nombres de redes sociales son placeholders sin destinos externos.

Los botones Hover, Microanimación y Efecto de texto se activan de forma independiente y afectan a los textos y botones del hero. Efecto de texto aplica un barrido de color. Transición reproduce al activarse la salida de Bienvenida y la entrada a Acerca de, y mantiene el efecto durante el desplazamiento; al desactivarse restaura la vista normal. El movimiento se puede interrumpir desplazándose manualmente o pulsando Escape.

Fondo permite elegir Grid 1 (estático), Grid 2 (animado) o Grid 3 (animado y sensible al puntero). Sin fondo, o pulsar de nuevo el fondo seleccionado, restaura el blanco. Los controles activos son verdes y los efectos empiezan desactivados. Las animaciones respetan la preferencia de movimiento reducido.

## Comprobación de sintaxis

```powershell
npm run check
```

Comprueba la sintaxis de los tres archivos JavaScript. GitHub Actions ejecuta la misma comprobación en cada push y pull request; también se puede lanzar manualmente. Esta comprobación no sustituye la revisión visual en el navegador.

## Subir a GitHub

Crear un repositorio vacío en GitHub, con la visibilidad deseada, sin añadir README, licencia ni `.gitignore`. Desde esta carpeta, sustituir `USUARIO` y `REPOSITORIO` por los datos del repositorio creado:

```powershell
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

El proyecto no necesita claves, variables de entorno ni servicios externos. `.gitignore` excluye las capturas y archivos del servidor en `.preview/`, los logs, las dependencias locales y los archivos `.env`.

## Publicación estática opcional

Los archivos HTML, CSS, JavaScript y SVG pueden servirse directamente, también desde una subcarpeta. Para GitHub Pages, seleccionar la rama `main` y la carpeta raíz (`/`) como origen de publicación en la configuración de Pages del repositorio, si está disponible para su visibilidad y plan. No hay proceso de compilación. `server.mjs` se utiliza solo para la vista previa local.

El formulario seguirá siendo una demostración sin envío de mensajes. La disponibilidad y la URL de la publicación se comprueban en GitHub tras activar Pages.

## Licencia

No se ha asignado una licencia de distribución al proyecto. `UNLICENSED` y `private` evitan declarar una licencia de código abierto o publicar el paquete en npm; la visibilidad en GitHub se elige al crear el repositorio.
