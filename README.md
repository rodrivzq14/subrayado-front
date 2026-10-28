# Subrayado - Front

Aplicación web de **Subrayado**, una red social para lectores donde se publican reseñas de libros. Trabajo Práctico #2 de Programación IV (UTN Avellaneda, Tecnicatura Universitaria en Programación).

- **Back:** https://github.com/rodrivzq14/subrayado-back
- **App desplegada:** _proximamente_
- **API desplegada:** _proximamente_

## Tecnologías

- Angular (componentes standalone, signals y formularios reactivos)
- Angular Router
- HttpClient
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
```

Si el back corre en local, no hay que configurar nada: el front apunta a `http://localhost:3000`. Para usar otro back, cambiá la constante `API` en `src/app/services/auth.ts`.

## Scripts

| Comando | Descripción |
|---|---|
| `ng serve -o` | Servidor de desarrollo en `http://localhost:4200` |
| `ng build` | Build de producción en `dist/` |

## Pantallas (Sprint 1)

| Ruta | Pantalla | Descripción |
|---|---|---|
| `/registro` | Registro | Formulario con validaciones, foto de perfil y repetir contraseña |
| `/login` | Login | Ingreso con correo o nombre de usuario |
| `/publicaciones` | Reseñas | Se completa en el Sprint 2 |
| `/mi-perfil` | Mi estantería | Datos y foto del usuario logueado |

## Características

- Validaciones con mensajes por campo. La contraseña requiere 8 caracteres, una mayúscula y un número.
- Modales en lugar de `alert()`, mediante un servicio central (`ModalService`).
- Sesión guardada en `localStorage`, con botón de cerrar sesión en la barra de navegación.
- Favicon propio y paleta de colores uniforme en toda la aplicación.

## Estructura

```
src/app/
├── components/modal/    modal reutilizable
├── pages/               registro, login, publicaciones, mi-perfil
└── services/            auth y modal
```

## Identidad visual

| Uso | Color |
|---|---|
| Fondo | `#F5EFE6` |
| Texto | `#3B2A20` |
| Principal | `#2F5D50` |
| Acento | `#C8963E` |
| Errores | `#7A2E3A` |

Tipografías: Playfair Display (títulos) e Inter (texto).

## Deploy (Netlify)

- **Build command:** `ng build`
- **Carpeta de publicación:** `dist/subrayado-front/browser` (verificar el nombre exacto tras el build)
- Para que las rutas funcionen al recargar, agregar `public/_redirects` con:

```
/* /index.html 200
```

Antes de desplegar, cambiar `API` en `src/app/services/auth.ts` por la URL del back en Render.

## Autor

Rodrigo Vazquez - Programación IV, 4º cuatrimestre.
