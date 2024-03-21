import AppLayout from '@/layout/AppLayout.vue';
const routes = [
    {
        path: '/',
        component: AppLayout,
        children: [
            {
                path: '/',
                name: 'dashboard',
                component: () => import('@/views/Dashbaord.vue')
            },
            {
                path: '/group',
                name: 'group',
                component: () => import('@/views/pages/group/GroupView.vue')
            },
            {
                path: '/contact',
                name: 'contact',
                component: () => import('@/views/pages/contact/ContactView.vue')
            },
        ]
    }

 
  ]

export { routes };