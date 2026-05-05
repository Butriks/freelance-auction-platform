module.exports = {
  paths: {
    '/api/contracts/{contractId}/disputes': {
      post: {
        tags: ['Disputes'],
        summary: 'Create dispute',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'contractId', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              examples: {
                default: {
                  value: {
                    reason: 'The work result does not match the agreed requirements.',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Dispute created', content: { 'application/json': { schema: { type: 'object', properties: { dispute: { $ref: '#/components/schemas/Dispute' } } } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Contract not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Open dispute already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/disputes/my': {
      get: {
        tags: ['Disputes'],
        summary: 'List current user disputes',
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
  },
};

