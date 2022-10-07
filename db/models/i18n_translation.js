'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class i18n_translation extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.belongsTo(models.i18n_language, {
                foreignKey: 'i18n_language_id',
            })
            this.belongsTo(models.i18n_key, {
                foreignKey: 'i18n_key_id',
            })
        }
    }

    i18n_translation.init({
        i18n_language_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: "i18n_language",
                key: 'id'
            }
        },
        i18n_key_id: {
            type: DataTypes.INTEGER,
            reference: {
                model: "i18n_key",
                key: 'id'
            }
        },
        value: DataTypes.TEXT,
    }, {
        sequelize,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        modelName: 'i18n_translation',
        tableName: 'i18n_translation',
    });
    return i18n_translation;
};