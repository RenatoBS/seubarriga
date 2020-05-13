const request = require('supertest');
const jwt = require('jwt-simple')

const app = require('../../src/app');

const MAIN_ROUTE = '/v1/accounts';
let user;
let user2;

beforeEach(async () => {
    const res = await app.services.user.save({
        name: 'User Account', mail: `${Date.now()}@mail.com`, password: '123456'
    })
    user = { ...res[0] };
    user.token = jwt.encode(user, 'Segredo!')

    const res2 = await app.services.user.save({
        name: 'User Account #2', mail: `${Date.now()}@mail.com`, password: '123456'
    })
    user2 = { ...res2[0] };
})

test('Deve inserir uma conta com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: 'Acc #1' })
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(201)
            expect(result.body.name).toBe('Acc #1')
        })
})

test('Não deve inserir uma conta sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then((result) => {
            expect(result.status).toBe(400)
            expect(result.body.error).toBe('Nome é um atributo obrigadorio')
        })
})

test('Não deve inserir uma conta de nome duplicado, para o mesmo usuario', () => {
    return app.db('accounts')
        .insert({ name: 'acc duplicada', user_id: user.id })
        .then(() => request(app).post(MAIN_ROUTE)
            .set('authorization', `bearer ${user.token}`)
            .send({ name: 'acc duplicada' }))
        .then(result => {
            expect(result.status).toBe(400)
            expect(result.body.error).toBe('Já existe uma conta com esse nome')
        })
})

// test('Deve listar todas as contas', () => {
//     return app.db('accounts')
//         .insert({ name: 'Acc list', user_id: user.id })
//         .then(() => request(app).get(MAIN_ROUTE)
//             .set('authorization', `bearer ${user.token}`))
//         .then((res) => {
//             expect(res.status).toBe(200)
//             expect(res.body.length).toBeGreaterThan(0)
//         })
// })

test('Deve listar apenas as contas do usuario', () => {
    return app.db('accounts')
        .insert([
            { name: 'acc user #1', user_id: user.id },
            { name: 'acc user #2', user_id: user2.id }
        ]).then(() => request(app).get(MAIN_ROUTE)
            .set('authorization', `bearer ${user.token}`))
        .then(res => {
            expect(res.status).toBe(200)
            expect(res.body.length).toBe(1)
            expect(res.body[0].name).toBe('acc user #1')
        })
})

test('Deve listar por ID', () => {
    return app.db('accounts')
        .insert({ name: 'Acc by Id', user_id: user.id }, ['id'])
        .then((acc) => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`))
        .then(res => {
            expect(res.status).toBe(200)
            expect(res.body.name).toBe('Acc by Id')
            expect(res.body.user_id).toBe(user.id)
        })
})

test('Não deve retornar uma conta de outro usuario', () => {
    return app.db('accounts')
        .insert({ name: 'acc user 2', user_id: user2.id }, ['id'])
        .then(acc => request(app).get(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`))
        .then(res => {
            expect(res.status).toBe(403)
            expect(res.body.error).toBe('Esse recurso não pertence ao usuario')
        })
})


test('Deve alterar uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc To Update', user_id: user.id }, ['id'])
        .then((acc) => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`)
            .send({ name: 'Acc Updated' }))
        .then(res => {
            expect(res.status).toBe(200)
            expect(res.body.name).toBe('Acc Updated')
        })
})

test('Não deve alterar uma conta de outro usuario', () => {
    return app.db('accounts')
        .insert({ name: 'acc user 2', user_id: user2.id }, ['id'])
        .then(acc => request(app).put(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`)
            .send({ name: 'Acc Updated' }))
        .then(res => {
            expect(res.status).toBe(403)
            expect(res.body.error).toBe('Esse recurso não pertence ao usuario')
        })
})


test('Deve remover uma conta', () => {
    return app.db('accounts')
        .insert({ name: 'Acc To Remove', user_id: user.id }, ['id'])
        .then((acc) => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`)
        )
        .then(res => {
            expect(res.status).toBe(204)
        })
})

test('Não deve remover uma conta de outro usuario', () => {
    return app.db('accounts')
        .insert({ name: 'acc user 2', user_id: user2.id }, ['id'])
        .then(acc => request(app).delete(`${MAIN_ROUTE}/${acc[0].id}`)
            .set('authorization', `bearer ${user.token}`)
            .send({ name: 'Acc Updated' }))
        .then(res => {
            expect(res.status).toBe(403)
            expect(res.body.error).toBe('Esse recurso não pertence ao usuario')
        })
})