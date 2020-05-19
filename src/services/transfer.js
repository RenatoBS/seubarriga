const ValidationError = require('../errors/validationError')

module.exports = (app) => {
    const find = (filter = {}) => {
        return app.db('transfers')
            .where(filter)
            .select()
    }

    const findOne = (id) => {
        return app.db('transfers')
            .where(id)
            .first()
    }

    const validate = async (transfer) => {
        if (!transfer.descriptions) throw new ValidationError('Descricao é um atributo obrigatorio')
        if (!transfer.amount) throw new ValidationError('Valor é um atributo obrigatorio')
        if (!transfer.date) throw new ValidationError('Data é um atributo obrigatorio')
        if (!transfer.acc_ori_id) throw new ValidationError('Conta origem é um atributo obrigatorio')
        if (!transfer.acc_dest_id) throw new ValidationError('Conta destino é um atributo obrigatorio')
        if (transfer.acc_ori_id === transfer.acc_dest_id) throw new ValidationError('Conta origem e destino não podem ser a mesma')

        const accounts = await app.db('accounts').whereIn('id', [transfer.acc_ori_id, transfer.acc_dest_id])
        accounts.forEach(acc => {
            if (acc.user_id !== parseInt(transfer.user_id, 10)) throw new ValidationError(`Conta #${acc.id} nao pertence ao usuario`)
        });
    }

    const save = async (transfer) => {

        const result = await app.db('transfers').insert(transfer, '*')
        const transferId = result[0].id

        const transactions = [
            { description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, amount: transfer.amount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: transferId },
            { description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, amount: transfer.amount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: transferId },
        ];
        await app.db('transactions').insert(transactions)
        return result
    }

    const update = async (id, transfer) => {

        const result = await app.db('transfers')
            .where({ id }).
            update(transfer, '*')

        const transactions = [
            { description: `Transfer to acc #${transfer.acc_dest_id}`, date: transfer.date, amount: transfer.amount * -1, type: 'O', acc_id: transfer.acc_ori_id, transfer_id: id },
            { description: `Transfer from acc #${transfer.acc_ori_id}`, date: transfer.date, amount: transfer.amount, type: 'I', acc_id: transfer.acc_dest_id, transfer_id: id },
        ];
        await app.db('transactions').where({ transfer_id: id }).del()
        await app.db('transactions').insert(transactions)
        return result
    }

    const remove = async (id) => {
        await app.db('transactions').where({transfer_id: id}).del()
        return  app.db('transfers').where({id}).del()
    }
    return { find, save, findOne, update, validate, remove }
}