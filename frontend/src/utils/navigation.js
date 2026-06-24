export const navigationItems = [
  { to: '/', labelKey: 'navigation.dashboard', icon: 'D', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/tasks', labelKey: 'navigation.tasks', icon: 'T', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/tasks/create', labelKey: 'navigation.createTask', icon: '+', roles: ['CLIENT'] },
  { to: '/contracts', labelKey: 'navigation.contracts', icon: 'C', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/disputes/my', labelKey: 'navigation.myDisputes', icon: 'M', roles: ['CLIENT', 'FREELANCER'] },
  { to: '/notifications', labelKey: 'navigation.notifications', icon: 'N', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/profile', labelKey: 'navigation.profile', icon: 'P', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/admin/users', labelKey: 'navigation.adminUsers', icon: 'U', roles: ['ADMIN'] },
  { to: '/admin/analytics', labelKey: 'navigation.adminAnalytics', icon: 'A', roles: ['ADMIN'] },
  { to: '/admin/disputes', labelKey: 'navigation.adminDisputes', icon: 'D', roles: ['ADMIN'] },
  { to: '/admin/logs', labelKey: 'navigation.adminLogs', icon: 'L', roles: ['ADMIN'] },
];
