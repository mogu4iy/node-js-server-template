'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class i18n_key extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.hasMany(models.i18n_translation, {
                foreignKey: 'i18n_key_id',
            })
        }
    }

    i18n_key.init({
        key: DataTypes.STRING,
    }, {
        sequelize,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        modelName: 'i18n_key',
        tableName: 'i18n_key',
    });
    return i18n_key;
};