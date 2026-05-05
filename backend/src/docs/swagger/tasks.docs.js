module.exports = {
  paths: {
    '/api/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              examples: {
                default: {
                  value: {
                    title: 'Create landing page',
                    description: 'Need a responsive landing page for a small business',
                    budget: 500,
                    deadline: '2026-06-01',
                    categoryId: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Task created', content: { 'application/json': { schema: { type: 'object', properties: { task: { $ref: '#/components/schemas/Task' } } } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'status', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] } },
          { in: 'query', name: 'categoryId', schema: { type: 'integer' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          { in: 'query', name: 'offset', schema: { type: 'integer', default: 0 } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Tasks list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
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
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Task details', content: { 'application/json': { schema: { type: 'object', properties: { task: { $ref: '#/components/schemas/Task' } } } } } },
          404: { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Update task',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              examples: {
                default: {
                  value: {
                    title: 'Updated landing page',
                    budget: 650,
                    deadline: '2026-06-10',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Task updated', content: { 'application/json': { schema: { type: 'object', properties: { task: { $ref: '#/components/schemas/Task' } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          204: { description: 'Task deleted' },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Task not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

