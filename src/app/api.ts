import { isDevMode } from '@angular/core';

export const API = isDevMode() ? 'http://localhost:3000' : 'https://subrayado-back.onrender.com';