module.exports = {
  paths: {
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List current user notifications',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'isRead', schema: { type: 'boolean' } },
          { in: 'query', name: 'type', schema: { type: 'string', enum: ['NEW_BID', 'BID_ACCEPTED', 'CONTRACT_CREATED', 'MILESTONE_SUBMITTED', 'MILESTONE_APPROVED', 'MILESTONE_REJECTED', 'CONTRACT_COMPLETED', 'NEW_MESSAGE', 'REVIEW_CREATED', 'SYSTEM'] } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'Notifications list', content: { 'application/json': { schema: { type: 'object', properties: { notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } }, count: { type: 'integer' }, limit: { type: 'integer' }, offset: { type: 'integer' } } } } } },
        },
      },
    },
    '/api/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notifications count',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Unread count', content: { 'application/json': { schema: { type: 'object', properties: { unreadCount: { type: 'integer', example: 3 } } } } } },
        },
      },
    },
    '/api/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Notification updated', content: { 'application/json': { schema: { type: 'object', properties: { notification: { $ref: '#/components/schemas/Notification' } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Notification not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Notifications updated', content: { 'application/json': { schema: { type: 'object', properties: { updatedCount: { type: 'integer', example: 5 } } } } } },
        },
      },
    },
  },
};

