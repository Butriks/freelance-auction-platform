module.exports = {
  paths: {
    '/api/tasks/{taskId}/accept-bid/{bidId}': {
      post: {
        tags: ['Contracts'],
        summary: 'Accept bid and create contract',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'taskId', required: true, schema: { type: 'integer' } },
          { in: 'path', name: 'bidId', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          201: { description: 'Contract created', content: { 'application/json': { schema: { type: 'object', properties: { contract: { $ref: '#/components/schemas/Contract' } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Task or bid not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Contract already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/contracts/my': {
      get: {
        tags: ['Contracts'],
        summary: 'List current user contracts',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'] } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: {
            description: 'Contracts list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    contracts: { type: 'array', items: { $ref: '#/components/schemas/Contract' } },
                    count: { type: 'integer' },
                    limit: { type: 'integer' },
                    offset: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/contracts/{id}': {
      get: {
        tags: ['Contracts'],
        summary: 'Get contract by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Contract details', content: { 'application/json': { schema: { type: 'object', properties: { contract: { $ref: '#/components/schemas/Contract' } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Contract not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

