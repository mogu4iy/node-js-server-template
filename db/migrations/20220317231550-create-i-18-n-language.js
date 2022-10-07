'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('i18n_language', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING
            },
            key: {
                allowNull: false,
                type: Sequelize.STRING
            },
            is_default: {
                allowNull: true,
                type: Sequelize.BOOLEAN
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('i18n_language');
    }
};