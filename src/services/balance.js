const moment = require('moment')

module.exports = (app) => {
    const getSaldo = (userId) => {
        return app.db('transactions as t').sum('amount')
            .join('accounts as acc', 'acc.id', '=', 't.acc_id')
            .where({ user_id: userId, status: true })
            .where('date', '<=', moment())
            .select('acc.id')
            .groupBy('acc.id')
            .orderBy('acc.id')
    }

    return { getSaldo }
}