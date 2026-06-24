module.exports = {
  paths: {
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'role', schema: { type: 'string', enum: ['CLIENT', 'FREELANCER', 'ADMIN'] } },
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['ACTIVE', 'BLOCKED'] } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'Users list', content: { 'application/json': { schema: { type: 'object', properties: { users: { type: 'array', items: { $ref: '#/components/schemas/UserPublic' } }, count: { type: 'integer' }, limit: { type: 'integer' }, offset: { type: 'integer' } } } } } },
        },
      },
    },
    '/api/admin/users/{id}/block': {
      patch: {
        tags: ['Admin'],
        summary: 'Block user',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'User blocked', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/UserPublic' } } } } } },
          400: { description: 'Cannot block yourself', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/admin/users/{id}/unblock': {
      patch: {
        tags: ['Admin'],
        summary: 'Unblock user',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'User unblocked', content: { 'application/json': { schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/UserPublic' } } } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/admin/tasks': {
      get: {
        tags: ['Admin'],
        summary: 'List tasks for admin',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] } },
          { in: 'query', name: 'categoryId', schema: { type: 'integer' } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'Tasks list', content: { 'application/json': { schema: { type: 'object', properties: { tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } }, count: { type: 'integer' }, limit: { type: 'integer' }, offset: { type: 'integer' } } } } } },
        },
      },
    },
    '/api/admin/contracts': {
      get: {
        tags: ['Admin'],
        summary: 'List contracts for admin',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'] } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'Contracts list', content: { 'application/json': { schema: { type: 'object', properties: { contracts: { type: 'array', items: { $ref: '#/components/schemas/Contract' } }, count: { type: 'integer' }, limit: { type: 'integer' }, offset: { type: 'integer' } } } } } },
        },
      },
    },
    '/api/admin/disputes': {
      get: {
        tags: ['Admin'],
        summary: 'List disputes for admin',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['OPEN', 'RESOLVED', 'REJECTED'] } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'Disputes list', content: { 'application/json': { schema: { type: 'object', properties: { disputes: { type: 'array', items: { $ref: '#/components/schemas/Dispute' } }, count: { type: 'integer' }, limit: { type: 'integer' }, offset: { type: 'integer' } } } } } },
        },
      },
    },
    '/api/admin/disputes/{id}/resolve': {
      patch: {
        tags: ['Admin'],
        summary: 'Resolve or reject dispute',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              examples: {
                resolved: {
                  value: {
                    status: 'RESOLVED',
                    adminComment: 'The dispute was resolved in favor of the client.',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Dispute updated', content: { 'application/json': { schema: { type: 'object', properties: { dispute: { $ref: '#/components/schemas/Dispute' } } } } } },
          404: { description: 'Dispute not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/admin/logs': {
      get: {
        tags: ['Admin'],
        summary: 'List logs',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'action', schema: { type: 'string' } },
          { in: 'query', name: 'entityType', schema: { type: 'string' } },
          { in: 'query', name: 'userId', schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'Logs list', content: { 'application/json': { schema: { type: 'object', properties: { logs: { type: 'array', items: { $ref: '#/components/schemas/Log' } }, count: { type: 'integer' }, limit: { type: 'integer' }, offset: { type: 'integer' } } } } } },
        },
      },
    },
    '/api/admin/analytics': {
      get: {
        tags: ['Admin'],
        summary: 'Get analytics summary',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Analytics summary',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: { type: 'object' },
                    tasks: { type: 'object' },
                    contracts: { type: 'object' },
                    bids: { type: 'object' },
                    payments: { type: 'object' },
                    reviews: { type: 'object' },
                    disputes: { type: 'object' },
                    wallet: {
                      type: 'object',
                      properties: {
                        walletBalancesTotalUsd: { type: 'number', example: 5000 },
                        walletTransactionsTotal: { type: 'integer', example: 3 },
                        totalEscrowHeldUsd: { type: 'number', example: 450 },
                        totalEscrowReleasedUsd: { type: 'number', example: 300 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
