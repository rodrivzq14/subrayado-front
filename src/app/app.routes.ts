import { Routes } from '@angular/router';
import { authGuard, invitadoGuard } from './guards';
import { Cargando } from './pages/cargando/cargando';
import { Login } from './pages/login/login';
import { MiPerfil } from './pages/mi-perfil/mi-perfil';
import { Publicacion } from './pages/publicacion/publicacion';
import { Publicaciones } from './pages/publicaciones/publicaciones';
import { Registro } from './pages/registro/registro';

export const routes: Routes = [
  { path: 'cargando', component: Cargando },
  { path: 'login', component: Login, canActivate: [invitadoGuard] },
  { path: 'registro', component: Registro, canActivate: [invitadoGuard] },
  { path: 'publicaciones', component: Publicaciones, canActivate: [authGuard] },
  { path: 'publicaciones/:id', component: Publicacion, canActivate: [authGuard] },
  { path: 'mi-perfil', component: MiPerfil, canActivate: [authGuard] },
  { path: '', redirectTo: 'cargando', pathMatch: 'full' },
  { path: '**', redirectTo: 'cargando' },
];