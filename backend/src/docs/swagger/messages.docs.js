module.exports = {
  paths: {
    '/api/contracts/{contractId}/messages': {
      get: {
        tags: ['Messages'],
        summary: 'List contract messages',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'contractId', required: true, schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'Messages list', content: { 'application/json': { schema: { type: 'object', properties: { messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } }, count: { type: 'integer' }, limit: { type: 'integer' }, offset: { type: 'integer' } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Contract not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      post: {
        tags: ['Messages'],
        summary: 'Create contract message',
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
                    text: 'Hello, I have uploaded the first version.',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Message created', content: { 'application/json': { schema: { type: 'object', properties: { message: { $ref: '#/components/schemas/Message' } } } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Contract not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

