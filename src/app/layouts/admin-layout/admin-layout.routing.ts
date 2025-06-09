import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { MapsComponent } from '../../pages/maps/maps.component';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { TablesComponent } from '../../pages/tables/tables.component';
import { AuthenticatedGuard } from 'src/app/guardians/authenticated.guard';
import { ManageComponent } from 'src/app/pages/profile/manage/manage.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'user-profile',   component: UserProfileComponent },
    { path: 'tables',         component: TablesComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'maps',           component: MapsComponent },
    {
        path: 'theaters',
        canActivate: [AuthenticatedGuard], // Permite que solo se vea esta pagina si esta autenticado
        children: [
            {
                path: '',
                loadChildren: () => import('src/app/pages/theaters/theaters.module').then(m => m.TheatersModule)
            }
        ]
    },
    {
        path: 'users',
        canActivate: [AuthenticatedGuard], // Toca poner autenticación
        children: [
            {
                path: '',
                loadChildren: () => import('src/app/pages/users/users.module').then(m => m.UsersModule)
            }
        ]
    },
    {
        path:'users/:userId/profile',
        canActivate: [AuthenticatedGuard],
        component: ManageComponent
    },
    {
        path: 'roles',
        canActivate: [AuthenticatedGuard], // Toca poner autenticación
        children: [
            {
                path: '',
                loadChildren: () => import('src/app/pages/roles/roles.module').then(m => m.RolesModule)
            }
        ]
    },
    {
        path: 'user-roles',
        canActivate: [AuthenticatedGuard],
        children: [
            {
                path: '',
                loadChildren: () => import('src/app/pages/user-roles/user-roles.module').then(m => m.UserRolesModule)
            }
        ]
    },
    {
        path: 'address', // Esta es la ruta base para todo el módulo Address
        loadChildren: () => import('src/app/pages/address/address.module').then(m => m.AddressModule)
    }

];
