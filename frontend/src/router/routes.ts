import AppLayout from '@/layout/AppLayout.vue'
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
      {
        path: '/message',
        name: 'message',
        component: () => import('@/views/pages/message/MessageView.vue')
      },
      {
        path: '/attachment',
        name: 'attachment',
        component: () => import('@/views/pages/attachment/AttachmentView.vue')
      },
      {
        path: '/campaign',
        name: 'campaign',
        component: () => import('@/views/pages/campaign/CampaignView.vue')
      },
      {
        path: '/documentation',
        name: 'documentation',
        component: () => import('@/views/pages/documentation/DocumentationView.vue')
      }
    ]
  }
]

export { routes }
