import { Routes } from '@angular/router';
import { App } from './app';

export const routes: Routes = [
    { path: '', redirectTo: '/drawkard', pathMatch: 'full' },
    { path: 'drawkard', component: App },
    { path: '**', redirectTo: '/drawkard' }
];
