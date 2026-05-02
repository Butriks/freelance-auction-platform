'use strict';

const { Op } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('Categories', [
      {
        name: 'Web Development',
        description: 'Websites, web applications, and backend services.',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Design',
        description: 'UI, UX, branding, and visual design.',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Copywriting',
        description: 'Texts, articles, landing page copy, and editing.',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Data Analysis',
        description: 'Reports, dashboards, analytics, and datasets.',
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Mobile Development',
        description: 'Mobile applications and cross-platform development.',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Categories', {
      name: {
        [Op.in]: [
          'Web Development',
          'Design',
          'Copywriting',
          'Data Analysis',
          'Mobile Development',
        ],
      },
    });
  },
};
