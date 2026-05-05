module.exports = {
  paths: {
    '/api/tasks/{taskId}/bids': {
      post: {
        tags: ['Bids'],
        summary: 'Create bid',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'taskId', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              examples: {
                default: {
                  value: {
                    price: 450,
                    deliveryDays: 7,
                    comment: 'I can complete this task with responsive design and clean code.',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Bid created', content: { 'application/json': { schema: { type: 'object', properties: { bid: { $ref: '#/components/schemas/Bid' } } } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Bid already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      get: {
        tags: ['Bids'],
        summary: 'List bids by task',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'taskId', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Bids list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    bids: { type: 'array', items: { $ref: '#/components/schemas/Bid' } },
                  },
                },
              },
            },
          },
          404: { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

