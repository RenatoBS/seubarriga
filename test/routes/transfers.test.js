const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/v1/transfers'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAsIm5hbWUiOiJVc2VyICMxIiwibWFpbCI6InVzZXIxQG1haWwuY29tIn0.QMgvo_lPe0Rdxpx7cay_hIkDAbjCK_--VD2fP0NTTqk'

beforeAll(async () => {
    await app.db.migrate.rollback()
    await app.db.migrate.latest()
    await app.db.seed.run()
})

test('Deve listar apenas as tranferencias do usuario', () => {
    return request(app).get(`${MAIN_ROUTE}`)
        .set('authorization', `bearer ${token}`)
        .then(res => {
            expect(res.status).toBe(200)
            expect(res.body).toHaveLength(1)
            expect(res.body[0].descriptions).toBe('transfer #1')
        })
})

test('Devo inserir uma transferencia com sucesso', () => {
    return request(app).post(`${MAIN_ROUTE}`)
        .set('authorization', `bearer ${token}`)
        .send({
            descriptions: 'Regular transfer',
            user_id: 10000,
            acc_ori_id: 10000,
            acc_dest_id: 10001,
            amount: 100,
            date: new Date()
        })
        .then(async (res) => {
            expect(res.status).toBe(201)
            expect(res.body.descriptions).toBe('Regular transfer')
            const transactions = await app.db('transactions').where({ transfer_id: res.body.id })
            expect(transactions).toHaveLength(2)
            expect(transactions[0].description).toBe('Transfer to acc #10001')
            expect(transactions[1].description).toBe('Transfer from acc #10000')
            expect(transactions[0].amount).toBe('-100.00')
            expect(transactions[1].amount).toBe('100.00')
            expect(transactions[0].acc_id).toBe(10000)
            expect(transactions[1].acc_id).toBe(10001)
        })
})

describe('Ao salvar uma tranferencia valida...', () => {
    let transferId
    let outcome
    let income

    test('Deve retornar o status 201 e os dados da transferencia', () => {
        return request(app).post(`${MAIN_ROUTE}`)
            .set('authorization', `bearer ${token}`)
            .send({
                descriptions: 'Regular transfer',
                user_id: 10000,
                acc_ori_id: 10000,
                acc_dest_id: 10001,
                amount: 100,
                date: new Date()
            })
            .then(async (res) => {
                expect(res.status).toBe(201)
                expect(res.body.descriptions).toBe('Regular transfer')
                transferId = res.body.id
            })
    })
    test('As transações equivalentes devem ter sido geradas', async () => {
        const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('amount');
        expect(transactions).toHaveLength(2);
        [outcome, income] = transactions
    })

    test('A transação de saida deve ser negativa', async () => {
        expect(outcome.description).toBe('Transfer to acc #10001')
        expect(outcome.amount).toBe('-100.00')
        expect(outcome.acc_id).toBe(10000)
        expect(outcome.type).toBe('O')
    })

    test('A transação de entrada deve ser negativa', async () => {
        expect(income.description).toBe('Transfer from acc #10000')
        expect(income.amount).toBe('100.00')
        expect(income.acc_id).toBe(10001)
        expect(income.type).toBe('I')
    })

    test('Ambas devem referenciar a transferencia que a originou', () => {
        expect(income.transfer_id).toBe(transferId)
        expect(outcome.transfer_id).toBe(transferId)
    })

    test('Ambas devem estar com o status de realizada', () => {
        expect(income.status).toBe(true)
        expect(outcome.status).toBe(true)
    })
})

describe('Ao tentar salvar uma transferencia invalida...', () => {

    const payload = {
        descriptions: 'Regular transfer',
        user_id: 10000,
        acc_ori_id: 10000,
        acc_dest_id: 10001,
        amount: 100,
        date: new Date()
    }
    const templateTest = (chagedPayload, message) => {
        return request(app).post(`${MAIN_ROUTE}`)
            .set('authorization', `bearer ${token}`)
            .send(chagedPayload)
            .then(async (res) => {
                expect(res.status).toBe(400)
                expect(res.body.error).toBe(message)
            })
    }

    test('Não deve inserir sem descrição', () => {
        return templateTest({ ...payload, descriptions: null }, 'Descricao é um atributo obrigatorio')
    })
    test('Não deve inserir sem valor', () => {
        return templateTest({ ...payload, amount: null }, 'Valor é um atributo obrigatorio')
    })
    test('Não deve inserir sem data', () => {
        return templateTest({ ...payload, date: null }, 'Data é um atributo obrigatorio')
    })
    test('Não deve inserir sem conta de origem', () => {
        return templateTest({ ...payload, acc_ori_id: null }, 'Conta origem é um atributo obrigatorio')
    })
    test('Não deve inserir sem conta de destino', () => {
        return templateTest({ ...payload, acc_dest_id: null }, 'Conta destino é um atributo obrigatorio')
    })
    test('Não deve inserir se as contas de origem e destino forem as mesmas', () => {
        return templateTest({ ...payload, acc_dest_id: 10000, acc_ori_id: 10000 }, 'Conta origem e destino não podem ser a mesma')
    })
    test('Não deve inserir se as constas pertencerem a outro usuario', () => {
        return templateTest({ ...payload, acc_ori_id: 10002 }, 'Conta #10002 nao pertence ao usuario')
    })
})

test('Deve retornar transferencia por id', () => {
    return request(app).get(`${MAIN_ROUTE}/10000`)
        .set('authorization', `bearer ${token}`)
        .then(res => {
            expect(res.status).toBe(200)
            expect(res.body.descriptions).toBe('transfer #1')
        })
})


describe('Ao alterar uma tranferencia valida...', () => {
    let transferId
    let outcome
    let income

    test('Deve retornar o status 200 e os dados da transferencia', () => {
        return request(app).put(`${MAIN_ROUTE}/10000`)
            .set('authorization', `bearer ${token}`)
            .send({
                descriptions: 'transfer updated',
                user_id: 10000,
                acc_ori_id: 10000,
                acc_dest_id: 10001,
                amount: 500,
                date: new Date()
            })
            .then(async (res) => {
                expect(res.status).toBe(200)
                expect(res.body.descriptions).toBe('transfer updated')
                expect(res.body.amount).toBe('500.00')
                transferId = res.body.id
            })
    })
    test('As transações equivalentes devem ter sido geradas', async () => {
        const transactions = await app.db('transactions').where({ transfer_id: transferId }).orderBy('amount');
        expect(transactions).toHaveLength(2);
        [outcome, income] = transactions
    })

    test('A transação de saida deve ser negativa', async () => {
        expect(outcome.description).toBe('Transfer to acc #10001')
        expect(outcome.amount).toBe('-500.00')
        expect(outcome.acc_id).toBe(10000)
        expect(outcome.type).toBe('O')
    })

    test('A transação de entrada deve ser negativa', async () => {
        expect(income.description).toBe('Transfer from acc #10000')
        expect(income.amount).toBe('500.00')
        expect(income.acc_id).toBe(10001)
        expect(income.type).toBe('I')
    })

    test('Ambas devem referenciar a transferencia que a originou', () => {
        expect(income.transfer_id).toBe(transferId)
        expect(outcome.transfer_id).toBe(transferId)
    })
})

describe('Ao tentar alterar uma transferencia invalida...', () => {

    const payload = {
        descriptions: 'Regular transfer',
        user_id: 10000,
        acc_ori_id: 10000,
        acc_dest_id: 10001,
        amount: 100,
        date: new Date()
    }
    const templateTest = (chagedPayload, message) => {
        return request(app).put(`${MAIN_ROUTE}/10000`)
            .set('authorization', `bearer ${token}`)
            .send(chagedPayload)
            .then(async (res) => {
                expect(res.status).toBe(400)
                expect(res.body.error).toBe(message)
            })
    }

    test('Não deve inserir sem descrição', () => {
        return templateTest({ ...payload, descriptions: null }, 'Descricao é um atributo obrigatorio')
    })
    test('Não deve inserir sem valor', () => {
        return templateTest({ ...payload, amount: null }, 'Valor é um atributo obrigatorio')
    })
    test('Não deve inserir sem data', () => {
        return templateTest({ ...payload, date: null }, 'Data é um atributo obrigatorio')
    })
    test('Não deve inserir sem conta de origem', () => {
        return templateTest({ ...payload, acc_ori_id: null }, 'Conta origem é um atributo obrigatorio')
    })
    test('Não deve inserir sem conta de destino', () => {
        return templateTest({ ...payload, acc_dest_id: null }, 'Conta destino é um atributo obrigatorio')
    })
    test('Não deve inserir se as contas de origem e destino forem as mesmas', () => {
        return templateTest({ ...payload, acc_dest_id: 10000, acc_ori_id: 10000 }, 'Conta origem e destino não podem ser a mesma')
    })
    test('Não deve inserir se as constas pertencerem a outro usuario', () => {
        return templateTest({ ...payload, acc_ori_id: 10002 }, 'Conta #10002 nao pertence ao usuario')
    })
})

describe('Ao remover uma tranferencia', () => {
    test('Deve retornar o status 204', () => {
        return request(app).delete(`${MAIN_ROUTE}/10000`)
            .set('authorization', `bearer ${token}`)
            .then(res => {
                expect(res.status).toBe(204)
            })
    })
    test('O registro deve ser apagado do banco', () => {
        return app.db('transfers').where({ id: '10000' })
            .then(result => {
                expect(result).toHaveLength(0)
            })
    })
    test('As transações assoiadas devem ter sido removidas', () => {
        return app.db('transactions').where({ transfer_id: '10000' })
            .then(result => {
                expect(result).toHaveLength(0)
            })
    })
})

test('Não deve retornar transferencia de outro usuario', () => {
    return request(app).get(`${MAIN_ROUTE}/10001`)
        .set('authorization', `bearer ${token}`)
        .then(res => {
            expect(res.status).toBe(403)
            expect(res.body.error).toBe('Esse recurso não pertence ao usuario')
        })
})