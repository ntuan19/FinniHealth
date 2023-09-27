// assets
import { IconDashboard, IconDeviceAnalytics } from '@tabler/icons';
import { IconUser } from '@tabler/icons';

// constant
const icons = {
    IconDashboard: IconDashboard,
    IconPatient: IconUser
};

//-----------------------|| DASHBOARD MENU ITEMS ||-----------------------//

export const dashboard = {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    children: [
        {
            id: 'patients',
            title: 'Patients Information',
            type: 'item',
            url: '/dashboard/patients',
            icon: icons['IconPatient'],
            breadcrumbs: false
        },
        {
            id: 'default',
            title: 'Analytics',
            type: 'item',
            url: '/dashboard/default',
            icon: icons['IconDashboard'],
            breadcrumbs: false
        },
        
    ]
};
