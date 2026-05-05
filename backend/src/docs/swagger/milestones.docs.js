module.exports = {
  paths: {
    '/api/contracts/{contractId}/milestones': {
      get: {
        tags: ['Milestones'],
        summary: 'List milestones by contract',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'contractId', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Milestones list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    milestones: { type: 'array', items: { $ref: '#/components/schemas/Milestone' } },
                  },
                },
              },
            },
          },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Contract not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      post: {
        tags: ['Milestones'],
        summary: 'Create milestone',
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
                    title: 'Design phase',
                    description: 'Create page layout and visual design',
                    amount: 300,
                    dueDate: '2026-06-01',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Milestone created', content: { 'application/json': { schema: { type: 'object', properties: { milestone: { $ref: '#/components/schemas/Milestone' } } } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/milestones/{id}/submit': {
      patch: {
        tags: ['Milestones'],
        summary: 'Submit milestone for review',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Milestone submitted', content: { 'application/json': { schema: { type: 'object', properties: { milestone: { $ref: '#/components/schemas/Milestone' } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Milestone not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/milestones/{id}/approve': {
      patch: {
        tags: ['Milestones'],
        summary: 'Approve milestone',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Milestone approved', content: { 'application/json': { schema: { type: 'object', properties: { milestone: { $ref: '#/components/schemas/Milestone' }, contractSummary: { $ref: '#/components/schemas/Contract' } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Milestone not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/milestones/{id}/reject': {
      patch: {
        tags: ['Milestones'],
        summary: 'Reject milestone',
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
                    reason: 'Please fix layout issues',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Milestone rejected', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, reason: { type: 'string' }, milestone: { $ref: '#/components/schemas/Milestone' } } } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { description: 'Milestone not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

