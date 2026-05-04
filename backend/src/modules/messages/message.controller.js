const messageService = require('./message.service');
const {
  contractIdParamSchema,
  createMessageSchema,
  listMessagesQuerySchema,
} = require('./message.validation');
const { emitNewMessage } = require('../../websocket/chatSocket');

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const validationError = new Error('Validation error');
    validationError.statusCode = 400;
    validationError.errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    throw validationError;
  }

  return value;
};

const getContractMessages = async (req, res, next) => {
  try {
    const { contractId } = validate(contractIdParamSchema, req.params);
    const query = validate(listMessagesQuerySchema, req.query);
    const result = await messageService.getContractMessages(req.user, contractId, query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { contractId } = validate(contractIdParamSchema, req.params);
    const data = validate(createMessageSchema, req.body);
    const message = await messageService.createMessage(req.user, contractId, data);
    const io = req.app.get('io');

    emitNewMessage(io, contractId, message);

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContractMessages,
  createMessage,
};

