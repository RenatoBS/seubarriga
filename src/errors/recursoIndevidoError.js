module.exports = function RecursoIndevidoError(message = 'Esse recurso não pertence ao usuario') {
    this.name = 'RecursoIndevidoError'
    this.message = message
}