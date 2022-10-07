'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('i18n_translation', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            i18n_key_id: {
                allowNull: false,
                foreignKey: true,
                type: Sequelize.INTEGER
            },
            i18n_language_id: {
                allowNull: false,
                foreignKey: true,
                type: Sequelize.INTEGER
            },
            value: {
                allowNull: false,
                type: Sequelize.TEXT
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
        await queryInterface.dropTable('i18n_translation');
    }
};