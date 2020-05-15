const ValidationError = require('../errors/validationError')

module.exports = (app) => {
    const find = (userId, filter = {}) => {
        return app.db('transactions')
            .join('accounts', 'accounts.id', 'acc_id')
            .where(filter)
            .andWhere('accounts.user_id', '=', userId)
            .select()
    }

    const findOne = (filter) => {
        return app.db('transactions')
            .where(filter)
            .first()
    }

    const save = (transaction) => {

        if(!transaction.description) throw new ValidationError('Descricao é um atributo obrigatorio')
        if(!transaction.amount) throw new ValidationError('Valor é um atributo obrigatorio')
        if(!transaction.date) throw new ValidationError('Data é um atributo obrigatorio')
        if(!transaction.acc_id) throw new ValidationError('Conta é um atributo obrigatorio')
        if(!transaction.type) throw new ValidationError('Tipo é um atributo obrigatorio')
        if(!(transaction.type === 'I' || transaction.type === 'O')) throw new ValidationError('Tipo invalido')

        const newTransaction = { ...transaction }
        if ((transaction.type === 'I' && transaction.amount < 0)
            || (transaction.type === 'O' && transaction.amount > 0)) {
                newTransaction.amount *= -1
        }

        return app.db('transactions')
            .insert(newTransaction, '*')
    }

    const update = (id, transaction) => {
        return app.db('transactions')
            .where({ id })
            .update(transaction, '*')
    }

    const remove = (id) => {
        return app.db('transactions')
            .where({ id })
            .del()
    }
    return { find, findOne, save, update, remove }
}