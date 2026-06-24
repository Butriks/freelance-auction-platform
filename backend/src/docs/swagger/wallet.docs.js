const { errorResponse } = require('./swagger.helpers');

module.exports = {
  paths: {
    '/api/wallet/me': {
      get: {
        tags: ['Wallet'],
        summary: 'Get current user wallet',
        description: 'Returns current user wallet. Mock wallet uses USD only.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current wallet',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    wallet: { $ref: '#/components/schemas/Wallet' },
                  },
                },
              },
            },
          },
          401: errorResponse,
        },
      },
    },
    '/api/wallet/transactions': {
      get: {
        tags: ['Wallet'],
        summary: 'Get current user wallet transactions',
        description: 'Returns only wallet transactions of the authenticated user. Currency is always USD.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['MOCK_TOP_UP', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'ADMIN_ADJUSTMENT'],
            },
          },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: {
            description: 'Wallet transactions',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    transactions: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/WalletTransaction' },
                    },
                    count: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 20 },
                    offset: { type: 'integer', example: 0 },
                  },
                },
              },
            },
          },
          401: errorResponse,
        },
      },
    },
    '/api/wallet/mock-top-up': {
      post: {
        tags: ['Wallet'],
        summary: 'Mock top up current user wallet',
        description: 'Adds mock USD funds to the authenticated user wallet. This is not a real payment integration.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount'],
                properties: {
                  amount: { type: 'number', minimum: 0.01, maximum: 100000, example: 2000 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Wallet topped up',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    wallet: { $ref: '#/components/schemas/Wallet' },
                    transaction: { $ref: '#/components/schemas/WalletTransaction' },
                  },
                },
              },
            },
          },
          400: errorResponse,
          401: errorResponse,
          403: errorResponse,
        },
      },
    },
  },
};
