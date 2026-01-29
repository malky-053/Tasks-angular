import { Routes } from '@angular/router';
import { ProjectsList } from './projects-list/projects-list';

export const projectsRoutes: Routes = [
    {
        path: '',
        component: ProjectsList
    }
];