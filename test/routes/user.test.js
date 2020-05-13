const request = require("supertest")
const jwt = require('jwt-simple')

const app = require('../../src/app')

const MAIN_ROUTE = '/v1/users';
const mail = `${Date.now()}@mail.com`
let user;

beforeAll(async () => {
    const res = await app.services.user.save({
        name: 'User Account', mail: `${Date.now()}@mail.com`, password: '123456'
    })
    user = { ...res[0] };
    user.token = jwt.encode(user, 'Segredo!')
})

test('Deve listar todos os usuarios', () => {
    return request(app).get(MAIN_ROUTE)
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
            expect(res.status).toBe(200)
            expect(res.body.length).toBeGreaterThan(0)
        })
})

test('Deve inserir usuario com sucesso', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', mail, password: '123456' })
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
            expect(res.status).toBe(201)
            expect(res.body.name).toBe('Walter Mitty')
            expect(res.body).not.toHaveProperty('password')
        })
})

test('Deve armazenar senha criptografada', async () => {
    const res = await request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', mail: `${Date.now()}@mail.com`, password: '123456' })
        .set('authorization', `bearer ${user.token}`)
    expect(res.status).toBe(201)

    const { id } = res.body
    const userDB = await app.services.user.findOne({ id })
    expect(userDB.password).not.toBeUndefined()
    expect(userDB.password).not.toBe('123456')

})

test('Não deve inserir usuario sem nome', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ mail, password: '123456' })
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Nome é um atributo obrigatorio')
        })
})
test('Não deve inserir usuario sem mail', async () => {
    const result = await request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', password: '123456' })
        .set('authorization', `bearer ${user.token}`)
    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Mail é um atributo obrigatorio')
})
test('Não deve inserir usuario sem senha', (done) => {
    request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', mail: 'walter@mail.com' })
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Senha é um atributo obrigatorio')
            done()
        })
        .catch(err => done.fail(err))
})
test('Não deve inserir usuario com email existete', () => {
    return request(app).post(MAIN_ROUTE)
        .send({ name: 'Walter Mitty', mail, password: '123456' })
        .set('authorization', `bearer ${user.token}`)
        .then(res => {
            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Já existe um usuario com esse email')
        })
})