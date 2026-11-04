# Subrayado - Front

Aplicación web de **Subrayado**, una red social para lectores donde se publican reseñas de libros. Trabajo Práctico #2 de Programación IV (UTN Avellaneda, Tecnicatura Universitaria en Programación).

- **Back:** https://github.com/rodrivzq14/subrayado-back
- **App desplegada:** https://subrayado-vazquez.netlify.app
- **API desplegada:** https://subrayado-back.onrender.com

> La API está en el plan gratuito de Render, que duerme el servicio tras un rato sin uso. La primera petición puede tardar hasta un minuto.

## Tecnologías

- Angular (componentes standalone, signals y formularios reactivos)
- Angular Router
- HttpClient con un interceptor que envía el token
- CSS propio, sin librerías de UI

## Requisitos

- Node.js 20 o superior
- Angular CLI (`npm i -g @angular/cli`)
- El back corriendo (local o desplegado)

## Instalación

```bash
git clone https://github.com/rodrivzq14/subrayado-front.git
cd subrayado-front
npm install
ng serve -o
```

La URL de la API se define en `src/app/api.ts`: con `ng serve` (modo desarrollo) apunta a `http://localhost:3000`, y en el build de producción apunta al back desplegado en Render. Para probar en local hay que tener el back corriendo.

## Scripts

| Comando | Descripción |
|---|---|
| `ng serve -o` | Servidor de desarrollo en `http://localhost:4200` |
| `ng build` | Build de producción en `dist/` |

## Pantallas

| Ruta | Pantalla | Descripción |
|---|---|---|
| `/cargando` | Pantalla de carga | Spinner mientras se valida la sesión con el back |
| `/registro` | Registro | Formulario con validaciones, foto de perfil con vista previa y repetir contraseña |
| `/login` | Login | Ingreso con correo o nombre de usuario |
| `/publicaciones` | Reseñas | Listado con orden, paginación, me gusta y alta de reseñas |
| `/publicaciones/:id` | Reseña | La reseña en grande con sus notas al margen |
| `/mi-perfil` | Mi estantería | Datos y foto del usuario, y sus últimas 3 reseñas con sus notas |

## Funcionalidades

**Reseñas**
- Cada reseña es un componente (`app-resena`) con portada, título, autor, fecha, calificación y texto.
- Se puede ordenar por más recientes o por más recomendadas.
- Paginación de 5 reseñas por página, usando `offset` y `limit` del back.
- Botón Recomendar: da y quita el me gusta, y actualiza el contador al instante.
- Eliminar solo está disponible en las reseñas propias, con un modal de confirmación.
- Nueva reseña en una ventana modal: título, texto, calificación de 1 a 5 estrellas y portada opcional con vista previa.
- Tocando el título se abre la página de la reseña.

**Notas al margen**
- En la página de cada reseña se pueden leer y dejar notas de hasta 500 caracteres. La nota nueva aparece arriba y el contador se actualiza.
- Se muestran de a 5, y "Cargar más notas" suma las siguientes sin perder las anteriores.
- Las notas propias se pueden editar y quedan marcadas como "(editado)" si cambió el texto.

**Sesión y validaciones**
- Validaciones con mensajes por campo. La contraseña requiere 8 caracteres, una mayúscula y un número.
- Token y usuario guardados en `localStorage`, con botón de cerrar sesión en la barra.
- Un interceptor agrega `Authorization: Bearer <token>` a cada petición.
- Al abrir la app y después de cada login, una pantalla de carga valida el token con `autorizar`.
- A los 10 minutos aparece un aviso para extender la sesión, que pide un token nuevo con `refrescar`. Los tiempos se calculan con la duración que trae el token.
- Si el back responde 401, se cierra la sesión, se vuelve al login y se avisa con un modal.
- Guards de rutas: sin sesión no se puede entrar a las pantallas privadas, y con sesión `/login` y `/registro` llevan a Reseñas.

**Interfaz**
- Modales en lugar de `alert()` y `confirm()`, mediante un servicio central (`ModalService`) con tipos éxito, error e información, y confirmación con Cancelar y Aceptar.
- Se cierran con la ×, un clic afuera o la tecla Esc.
- Diseño responsive, favicon propio y paleta uniforme en toda la aplicación.

## Estructura

```
src/app/
├── api.ts                  URL de la API (local o producción)
├── auth.interceptor.ts     agrega el token a las peticiones
├── guards.ts               guards de pantallas privadas y de invitados
├── components/
│   ├── modal/              modal de mensajes y confirmación
│   ├── resena/             tarjeta de una reseña
│   └── nueva-resena/       formulario para publicar
├── pages/                  cargando, registro, login, publicaciones, publicacion, mi-perfil
└── services/               auth, modal y publicaciones
```

## Identidad visual

| Uso | Color |
|---|---|
| Fondo | `#F5EFE6` |
| Texto | `#3B2A20` |
| Principal | `#2F5D50` |
| Acento | `#C8963E` |
| Errores | `#7A2E3A` |

Tipografías: Playfair Display (títulos) e Inter (texto). El subrayado dorado es la firma de la marca: aparece en el logo y en el enlace de la página activa.

## Deploy (Netlify)

- **Build command:** `ng build`
- **Carpeta de publicación:** `dist/<nombre-del-proyecto>/browser` (verificar el nombre exacto tras el build)
- Para que las rutas funcionen al recargar, el sitio redirige todo a `index.html`, con el archivo `public/_redirects`:

```
/* /index.html 200
```

## Autor

Rodrigo Vazquez - Programación IV.