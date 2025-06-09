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
        path: 'users/:user_id/sessions',
        canActivate: [AuthenticatedGuard],
        loadChildren: () => import('src/app/pages/sessions/sessions.module').then(m => m.SessionsModule)
    },
    {
        path: 'users/:userId/passwords', // Ruta para acceder a las contraseñas de un usuario específico
        canActivate: [AuthenticatedGuard],
        loadChildren: () => import('src/app/pages/password/password.module').then(m => m.PasswordModule)
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
        path: 'permissions',
        canActivate: [AuthenticatedGuard],
        loadChildren: () => import('src/app/pages/permissions/permissions.module').then(m => m.PermissionsModule)
    },
   
    {
        path: 'address', // Esta es la ruta base para todo el módulo Address
        canActivate: [AuthenticatedGuard],
        loadChildren: () => import('src/app/pages/address/address.module').then(m => m.AddressModule)
    }

];
