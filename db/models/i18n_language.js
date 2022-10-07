'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class i18n_language extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.hasMany(models.i18n_translation, {
                foreignKey: 'i18n_language_id',
            })
        }
    }

    i18n_language.init({
        name: DataTypes.STRING,
        key: DataTypes.STRING,
        is_default: DataTypes.BOOLEAN,
    }, {
        sequelize,
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
        modelName: 'i18n_language',
        tableName: 'i18n_language',
    });
    return i18n_language;
};