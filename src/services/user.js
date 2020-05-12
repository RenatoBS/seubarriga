const validationError = require('../errors/validationError')

// eslint-disable-next-line no-undef
module.exports = (app) => {
    const findAll = (filter = {}) => {
        return app.db('users').where(filter).select()
    }

    const save = async (user) => {
        if (!user.name) throw new validationError('Nome é um atributo obrigatorio')
        if (!user.mail) throw new validationError('Mail é um atributo obrigatorio')
        if (!user.password) throw new validationError( 'Senha é um atributo obrigatorio')

        const userDB = await findAll({ mail: user.mail })
        if (userDB && userDB.length > 0) throw new validationError('Já existe um usuario com esse email')

        return app.db('users').insert(user, '*')
    }
    return { findAll, save }
}