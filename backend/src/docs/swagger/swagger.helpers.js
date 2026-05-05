const errorResponse = {
  description: 'Error',
  content: {
    'application/json': {
      schema: {
        $ref: '#/components/schemas/ErrorResponse',
      },
    },
  },
};

module.exports = {
  errorResponse,
};

