// eslint-disable-next-line no-undef
module.exports = {
    test: {
        client: 'pg',
        version: '9.6',
        connection: {
            host: 'localhost',
            user: 'postgres',
            password: 'test123',
            database: 'barriga'
        },
        migrations: {
            directory: 'src/migrations'
        }
    }
}