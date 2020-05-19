// eslint-disable-next-line no-undef
module.exports = {
    test: {
        client: 'pg',
        version: '11',
        connection: {
            host: 'localhost',
            user: 'postgres',
            password: 'abcd@1234',
            database: 'barriga'
        },
        migrations: {
            directory: 'src/migrations'
        },
        seeds: {
            directory: 'src/seeds'
        }

    }
}