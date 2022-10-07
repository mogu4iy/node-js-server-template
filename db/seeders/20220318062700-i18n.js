'use strict';
const moment = require("moment");
module.exports = {
    async up(queryInterface, Sequelize) {
        const languageObj = {
            EN: {
                name: "English",
                key: "en",
                is_default: true,
            },
            RU: {
                name: "Russian",
                key: "ru",
                is_default: false,
            },
            UA: {
                name: "Ukrainian",
                key: "ua",
                is_default: false,
            }
        }
        const languageExistList = await queryInterface.rawSelect('i18n_language', {
            plain: false
        }, [])
        for (let language of Object.values(languageObj)) {
            let languageExist = languageExistList.filter(lang => lang.key === language.key)
            languageExist = languageExist.length > 0 ? languageExist[0] : null
            if (!languageExist) {
                languageExist = (await queryInterface.bulkInsert('i18n_language', [{
                    ...language,
                    created_at: moment().toDate(),
                    updated_at: moment().toDate(),
                }], {returning: true}))[0]
            }
            language["id"] = languageExist["id"]
        }
        const translationKeyObj = {
            LANG_UA: {
                key: "lang_ua"
            },
            LANG_RU: {
                key: "lang_ru"
            },
            LANG_EN: {
                key: "lang_en"
            },
        }
        const translationKeyExistList = await queryInterface.rawSelect('i18n_key', {
            plain: false
        }, [])
        for (let translationKey of Object.values(translationKeyObj)) {
            let keyExist = translationKeyExistList.filter(transKey => transKey.key === translationKey.key)
            keyExist = keyExist.length > 0 ? keyExist[0] : null
            if (!keyExist) {
                keyExist = (await queryInterface.bulkInsert('i18n_key', [{
                    ...translationKey,
                    created_at: moment().toDate(),
                    updated_at: moment().toDate(),
                }], {returning: true}))[0]
            }
            translationKey["id"] = keyExist["id"]
        }
        const translationList = [{
            i18n_language_id: languageObj.RU["id"],
            i18n_key_id: translationKeyObj.LANG_RU["id"],
            value: "Русский",
        }, {
            i18n_language_id: languageObj.EN["id"],
            i18n_key_id: translationKeyObj.LANG_RU["id"],
            value: "Русский",
        }, {
            i18n_language_id: languageObj.UA["id"],
            i18n_key_id: translationKeyObj.LANG_RU["id"],
            value: "Русский",
        }, {
            i18n_language_id: languageObj.RU["id"],
            i18n_key_id: translationKeyObj.LANG_EN["id"],
            value: "English",
        }, {
            i18n_language_id: languageObj.EN["id"],
            i18n_key_id: translationKeyObj.LANG_EN["id"],
            value: "English",
        }, {
            i18n_language_id: languageObj.UA["id"],
            i18n_key_id: translationKeyObj.LANG_EN["id"],
            value: "English",
        }, {
            i18n_language_id: languageObj.RU["id"],
            i18n_key_id: translationKeyObj.LANG_UA["id"],
            value: "Українська",
        }, {
            i18n_language_id: languageObj.EN["id"],
            i18n_key_id: translationKeyObj.LANG_UA["id"],
            value: "Українська",
        }, {
            i18n_language_id: languageObj.UA["id"],
            i18n_key_id: translationKeyObj.LANG_UA["id"],
            value: "Українська",
        },
        ]
        const translationExistList = await queryInterface.rawSelect('i18n_translation', {
            plain: false
        }, [])
        for (let translation of translationList) {
            let translationExist = translationExistList.filter(trans => {
                return trans.value === translation.value &&
                    trans.i18n_language_id === translation.i18n_language_id &&
                    trans.i18n_key_id === translation.i18n_key_id
            })
            translationExist = translationExist.length > 0 ? translationExist[0] : null
            if (!translationExist) {
                translationExist = (await queryInterface.bulkInsert('i18n_translation', [{
                    ...translation,
                    created_at: moment().toDate(),
                    updated_at: moment().toDate(),
                }], {returning: true}))[0]
            }
            translation["id"] = translationExist["id"]
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('i18n_language', null, {});
        await queryInterface.bulkDelete('i18n_key', null, {});
        await queryInterface.bulkDelete('i18n_translation', null, {});
    }
};
