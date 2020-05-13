const bcrypt = require('bcrypt-nodejs')
const ValidationError = require('../errors/validationError')

// eslint-disable-next-line no-undef
module.exports = (app) => {
    const findAll = () => {
        return app.db('users').select(['id', 'name', 'mail'])
    }

    const findOne = (filter) => {
        return app.db('users').where(filter).first()
    }


    const getPasswdHash = (password) => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }
    const save = async (user) => {
        if (!user.name) throw new ValidationError('Nome é um atributo obrigatorio')
        if (!user.mail) throw new ValidationError('Mail é um atributo obrigatorio')
        if (!user.password) throw new ValidationError('Senha é um atributo obrigatorio')

        const userDB = await findOne({ mail: user.mail })
        if (userDB) throw new ValidationError('Já existe um usuario com esse email')

        const newUser = { ...user }
        newUser.password = getPasswdHash(user.password)
        return app.db('users').insert(newUser, ['id', 'name', 'mail'])
    }
    return { findAll, findOne, save }
}