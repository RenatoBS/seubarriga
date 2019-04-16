test('devo conhecer as principais assertivas do jest', () => {
    let number = null
    expect(number).toBeNull()
    number = 10
    expect(number).not.toBeNull()
    expect(number).toBe(10)
    expect(number).toEqual(10)
    expect(number).toBeGreaterThan(9)
    expect(number).toBeLessThan(11)
})

test('devo saber trabalhar com objetos', () => {
    const obj = { name: 'John', email: 'john@mail.com' }
    expect(obj).toHaveProperty('name')
    expect(obj).toHaveProperty('name', 'John')
    expect(obj.name).toBe('John')

    const obj2 = { name: 'John', email: 'john@mail.com' }
    expect(obj).toBe(obj)
    expect(obj).toEqual(obj2)

})