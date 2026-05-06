export const navigationItems = [
  { to: '/', label: 'Dashboard', icon: 'D', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/tasks', label: 'Tasks', icon: 'T', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/tasks/create', label: 'Create Task', icon: '+', roles: ['CLIENT'] },
  { to: '/contracts', label: 'Contracts', icon: 'C', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/notifications', label: 'Notifications', icon: 'N', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/profile', label: 'Profile', icon: 'P', roles: ['CLIENT', 'FREELANCER', 'ADMIN'] },
  { to: '/admin/users', label: 'Admin Users', icon: 'U', roles: ['ADMIN'] },
  { to: '/admin/analytics', label: 'Admin Analytics', icon: 'A', roles: ['ADMIN'] },
  { to: '/admin/disputes', label: 'Admin Disputes', icon: 'D', roles: ['ADMIN'] },
  { to: '/admin/logs', label: 'Admin Logs', icon: 'L', roles: ['ADMIN'] },
];
