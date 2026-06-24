const swaggerJsdoc = require('swagger-jsdoc');

const authDocs = require('../docs/swagger/auth.docs');
const tasksDocs = require('../docs/swagger/tasks.docs');
const bidsDocs = require('../docs/swagger/bids.docs');
const contractsDocs = require('../docs/swagger/contracts.docs');
const milestonesDocs = require('../docs/swagger/milestones.docs');
const reviewsDocs = require('../docs/swagger/reviews.docs');
const messagesDocs = require('../docs/swagger/messages.docs');
const notificationsDocs = require('../docs/swagger/notifications.docs');
const walletDocs = require('../docs/swagger/wallet.docs');
const disputesDocs = require('../docs/swagger/disputes.docs');
const adminDocs = require('../docs/swagger/admin.docs');

const mergePaths = (...groups) => groups.reduce(
  (acc, group) => ({ ...acc, ...group.paths }),
  {},
);

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Freelance Auction Platform API',
      version: '1.0.0',
      description: 'API for freelance platform with task auctions, contracts, milestones, mock escrow, reviews, chat, notifications and admin analytics.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    tags: [
      { name: 'Auth' },
      { name: 'Tasks' },
      { name: 'Bids' },
      { name: 'Contracts' },
      { name: 'Milestones' },
      { name: 'Reviews' },
      { name: 'Messages' },
      { name: 'Notifications' },
      { name: 'Wallet' },
      { name: 'Disputes' },
      { name: 'Admin' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        UserPublic: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@test.com' },
            role: { type: 'string', enum: ['CLIENT', 'FREELANCER', 'ADMIN'], example: 'CLIENT' },
            status: { type: 'string', enum: ['ACTIVE', 'BLOCKED'], example: 'ACTIVE' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Web Development' },
            description: { type: 'string', nullable: true, example: 'Websites and backend services.' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ClientProfile: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            companyName: { type: 'string', nullable: true, example: 'Test Company' },
            description: { type: 'string', nullable: true, example: 'Client profile description' },
            rating: { type: 'number', format: 'float', example: 4.5 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              $ref: '#/components/schemas/UserPublic',
            },
          },
        },
        FreelancerProfile: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 2 },
            userId: { type: 'integer', example: 2 },
            firstName: { type: 'string', nullable: true, example: 'Ivan' },
            lastName: { type: 'string', nullable: true, example: 'Ivanov' },
            bio: { type: 'string', nullable: true, example: 'Node.js developer' },
            hourlyRate: { type: 'number', format: 'float', nullable: true, example: 20 },
            rating: { type: 'number', format: 'float', example: 4.8 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              $ref: '#/components/schemas/UserPublic',
            },
          },
        },
        RegisterClientRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: { type: 'string', format: 'email', example: 'client@test.com' },
            password: { type: 'string', minLength: 8, example: '12345678' },
            role: { type: 'string', enum: ['CLIENT'], example: 'CLIENT' },
            companyName: { type: 'string', example: 'Test Company' },
            description: { type: 'string', example: 'Test client' },
          },
        },
        RegisterFreelancerRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: { type: 'string', format: 'email', example: 'freelancer@test.com' },
            password: { type: 'string', minLength: 8, example: '12345678' },
            role: { type: 'string', enum: ['FREELANCER'], example: 'FREELANCER' },
            firstName: { type: 'string', example: 'Ivan' },
            lastName: { type: 'string', example: 'Ivanov' },
            bio: { type: 'string', example: 'Node.js developer' },
            hourlyRate: { type: 'number', example: 20 },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'client@test.com' },
            password: { type: 'string', example: '12345678' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: {
              $ref: '#/components/schemas/UserPublic',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            clientId: { type: 'integer', example: 1 },
            categoryId: { type: 'integer', nullable: true, example: 1 },
            title: { type: 'string', example: 'Create landing page' },
            description: { type: 'string', example: 'Need a responsive landing page for a small business' },
            budget: { type: 'number', format: 'float', example: 500 },
            deadline: { type: 'string', format: 'date', example: '2026-06-01' },
            status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], example: 'OPEN' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            category: { $ref: '#/components/schemas/Category' },
            client: { $ref: '#/components/schemas/ClientProfile' },
          },
        },
        Bid: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            taskId: { type: 'integer', example: 1 },
            freelancerId: { type: 'integer', example: 2 },
            price: { type: 'number', format: 'float', example: 450 },
            deliveryDays: { type: 'integer', example: 7 },
            comment: { type: 'string', nullable: true, example: 'I can complete this task with responsive design and clean code.' },
            status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'], example: 'PENDING' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            freelancer: { $ref: '#/components/schemas/FreelancerProfile' },
          },
        },
        Escrow: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            contractId: { type: 'integer', example: 1 },
            amount: { type: 'number', format: 'float', example: 450 },
            releasedAmount: { type: 'number', format: 'float', example: 0 },
            status: { type: 'string', enum: ['HELD', 'PARTIALLY_RELEASED', 'RELEASED', 'REFUNDED'], example: 'HELD' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            contractId: { type: 'integer', example: 1 },
            fromUserId: { type: 'integer', example: 1 },
            toUserId: { type: 'integer', example: 2 },
            amount: { type: 'number', format: 'float', example: 450 },
            type: { type: 'string', enum: ['DEPOSIT', 'RELEASE', 'REFUND'], example: 'DEPOSIT' },
            status: { type: 'string', enum: ['MOCK_SUCCESS', 'MOCK_FAILED'], example: 'MOCK_SUCCESS' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Milestone: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            contractId: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Initial milestone' },
            description: { type: 'string', nullable: true, example: 'Default milestone created with contract' },
            amount: { type: 'number', format: 'float', example: 450 },
            status: { type: 'string', enum: ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'], example: 'PENDING' },
            dueDate: { type: 'string', format: 'date', nullable: true, example: '2026-06-01' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Contract: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            taskId: { type: 'integer', example: 1 },
            clientId: { type: 'integer', example: 1 },
            freelancerId: { type: 'integer', example: 2 },
            acceptedBidId: { type: 'integer', example: 1 },
            totalAmount: { type: 'number', format: 'float', example: 450 },
            status: { type: 'string', enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'], example: 'ACTIVE' },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            task: { $ref: '#/components/schemas/Task' },
            acceptedBid: { $ref: '#/components/schemas/Bid' },
            client: { $ref: '#/components/schemas/ClientProfile' },
            freelancer: { $ref: '#/components/schemas/FreelancerProfile' },
            milestones: {
              type: 'array',
              items: { $ref: '#/components/schemas/Milestone' },
            },
            escrow: { $ref: '#/components/schemas/Escrow' },
            payments: {
              type: 'array',
              items: { $ref: '#/components/schemas/Payment' },
            },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            contractId: { type: 'integer', example: 1 },
            fromUserId: { type: 'integer', example: 1 },
            toUserId: { type: 'integer', example: 2 },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', nullable: true, example: 'Great work, everything was completed on time.' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            fromUser: { $ref: '#/components/schemas/UserPublic' },
            toUser: { $ref: '#/components/schemas/UserPublic' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            contractId: { type: 'integer', example: 1 },
            senderId: { type: 'integer', example: 2 },
            text: { type: 'string', example: 'Hello, I have uploaded the first version.' },
            createdAt: { type: 'string', format: 'date-time' },
            sender: {
              $ref: '#/components/schemas/UserPublic',
            },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 2 },
            title: { type: 'string', example: 'New message' },
            message: { type: 'string', example: 'You received a new message in contract chat.' },
            type: {
              type: 'string',
              enum: ['NEW_BID', 'BID_ACCEPTED', 'CONTRACT_CREATED', 'MILESTONE_SUBMITTED', 'MILESTONE_APPROVED', 'MILESTONE_REJECTED', 'CONTRACT_COMPLETED', 'NEW_MESSAGE', 'REVIEW_CREATED', 'SYSTEM'],
              example: 'NEW_MESSAGE',
            },
            isRead: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 2 },
            balance: { type: 'string', example: '1500.00' },
            currency: { type: 'string', example: 'USD' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        WalletTransaction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            walletId: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 2 },
            type: {
              type: 'string',
              enum: ['MOCK_TOP_UP', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'ADMIN_ADJUSTMENT'],
              example: 'MOCK_TOP_UP',
            },
            direction: { type: 'string', enum: ['CREDIT', 'DEBIT'], example: 'CREDIT' },
            amount: { type: 'string', example: '2000.00' },
            balanceBefore: { type: 'string', example: '0.00' },
            balanceAfter: { type: 'string', example: '2000.00' },
            currency: { type: 'string', example: 'USD' },
            status: { type: 'string', enum: ['SUCCESS', 'FAILED'], example: 'SUCCESS' },
            contractId: { type: 'integer', nullable: true, example: 1 },
            milestoneId: { type: 'integer', nullable: true, example: 1 },
            paymentId: { type: 'integer', nullable: true, example: 1 },
            metadata: { type: 'object', nullable: true, additionalProperties: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Dispute: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            contractId: { type: 'integer', example: 1 },
            openedByUserId: { type: 'integer', example: 1 },
            reason: { type: 'string', example: 'The work result does not match the agreed requirements.' },
            status: { type: 'string', enum: ['OPEN', 'RESOLVED', 'REJECTED'], example: 'OPEN' },
            adminComment: { type: 'string', nullable: true, example: 'The dispute was resolved in favor of the client.' },
            resolvedByAdminId: { type: 'integer', nullable: true, example: 3 },
            resolvedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            contract: { $ref: '#/components/schemas/Contract' },
            openedByUser: { $ref: '#/components/schemas/UserPublic' },
            resolvedByAdmin: { $ref: '#/components/schemas/UserPublic' },
          },
        },
        Log: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', nullable: true, example: 1 },
            action: { type: 'string', example: 'TASK_CREATED' },
            entityType: { type: 'string', example: 'Task' },
            entityId: { type: 'integer', nullable: true, example: 1 },
            metadata: { type: 'object', nullable: true, additionalProperties: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: { $ref: '#/components/schemas/UserPublic' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: '"email" must be a valid email' },
                },
              },
            },
          },
        },
      },
    },
    paths: mergePaths(
      authDocs,
      tasksDocs,
      bidsDocs,
      contractsDocs,
      milestonesDocs,
      reviewsDocs,
      messagesDocs,
      notificationsDocs,
      walletDocs,
      disputesDocs,
      adminDocs,
    ),
  },
  apis: [],
};

module.exports = swaggerJsdoc(options);
