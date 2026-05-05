module.exports = {
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user',
        description: 'Registers a CLIENT or FREELANCER user and returns JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/RegisterClientRequest' },
                  { $ref: '#/components/schemas/RegisterFreelancerRequest' },
                ],
              },
              examples: {
                client: {
                  value: {
                    email: 'client@test.com',
                    password: '12345678',
                    role: 'CLIENT',
                    companyName: 'Test Company',
                    description: 'Test client',
                  },
                },
                freelancer: {
                  value: {
                    email: 'freelancer@test.com',
                    password: '12345678',
                    role: 'FREELANCER',
                    firstName: 'Ivan',
                    lastName: 'Ivanov',
                    bio: 'Node.js developer',
                    hourlyRate: 20,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              examples: {
                default: {
                  value: {
                    email: 'client@test.com',
                    password: '12345678',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'User blocked', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/UserPublic' },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
  },
};

