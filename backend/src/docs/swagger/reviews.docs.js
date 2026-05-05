module.exports = {
  paths: {
    '/api/contracts/{contractId}/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Create review',
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
                    rating: 5,
                    comment: 'Great work, everything was completed on time.',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Review created', content: { 'application/json': { schema: { type: 'object', properties: { review: { $ref: '#/components/schemas/Review' }, updatedRating: { type: 'number', format: 'float' } } } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Review already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      get: {
        tags: ['Reviews'],
        summary: 'List contract reviews',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'contractId', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Contract reviews', content: { 'application/json': { schema: { type: 'object', properties: { reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Contract not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/users/{userId}/reviews': {
      get: {
        tags: ['Reviews'],
        summary: 'List user reviews',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'userId', required: true, schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'User reviews', content: { 'application/json': { schema: { type: 'object', properties: { reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } }, count: { type: 'integer' }, limit: { type: 'integer' }, offset: { type: 'integer' } } } } } },
          404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

