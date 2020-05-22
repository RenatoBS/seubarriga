const moment = require('moment')

exports.seed = (knex) => {
  return knex('users').insert([
    { id: 10100, name: 'User #3', mail: 'user3@mail.com', password: '$2a$10$avrBKSuZNaJhXVek03biV.oWrqOL8ezmeeh0XwUg.f5S7c/zadUjW' },
    { id: 10101, name: 'User #4', mail: 'user4@mail.com', password: '$2a$10$avrBKSuZNaJhXVek03biV.oWrqOL8ezmeeh0XwUg.f5S7c/zadUjW' },
    { id: 10102, name: 'User #5', mail: 'user5@mail.com', password: '$2a$10$avrBKSuZNaJhXVek03biV.oWrqOL8ezmeeh0XwUg.f5S7c/zadUjW' },
  ])
    .then(() => knex('accounts').insert([
      { id: 10100, name: 'Acc Saldo Principal', user_id: 10100 },
      { id: 10101, name: 'Acc Saldo Secundario', user_id: 10100 },
      { id: 10102, name: 'Acc Alternativa 1 ', user_id: 10101 },
      { id: 10103, name: 'Acc Alternativa 2 ', user_id: 10101 },
      { id: 10104, name: 'Acc Geral Principal', user_id: 10102 },
      { id: 10105, name: 'Acc Geral Secundario', user_id: 10102 },
    ]))
    .then(() => knex('transfers').insert([
      { id: 10100, descriptions: 'transfer #1', user_id: 10102, acc_ori_id: 10105, acc_dest_id: 10104, amount: 256, date: moment() },
      { id: 10101, descriptions: 'transfer #2', user_id: 10101, acc_ori_id: 10103, acc_dest_id: 10102, amount: 512, date: moment() },
    ]))
    .then(() => knex('transactions').insert([
      //transação positiva | saldo = 2
      { description: '2', date: moment(), amount: 2, type: 'I', acc_id: 10104, status: true },
      //transação usuario errado | saldo = 2 
      { description: '2', date: moment(), amount: 4, type: 'I', acc_id: 10002, status: true },
      //transação outra conta | saldo = 2  | Saldo = 8
      { description: '2', date: moment(), amount: 8, type: 'I', acc_id: 10105, status: true },
      //transação pendente | saldo = 2  | Saldo = 8
      { description: '2', date: moment(), amount: 16, type: 'I', acc_id: 10104, status: false },
      //transação passada | saldo = 34  | Saldo = 8
      { description: '2', date: moment().subtract({days: 5}), amount: 32, type: 'I', acc_id: 10104, status: true },
      //transação futura | saldo = 34  | Saldo = 8
      { description: '2', date: moment().add({days: 5}), amount: 64, type: 'I', acc_id: 10104, status: true },
      //transação negativa | saldo = -94  | Saldo = 8
      { description: '2', date: moment(), amount: -128, type: 'O', acc_id: 10104, status: true },
      //tranferencia | saldo = -162  | Saldo = -248
      { description: '2', date: moment(), amount: 256, type: 'I', acc_id: 10104, status: true },
      { description: '2', date: moment(), amount: -256, type: 'O', acc_id: 10105, status: true },
      //tranferencia | saldo = -162  | Saldo = -248
      { description: '2', date: moment(), amount: 512, type: 'I', acc_id: 10103, status: true },
      { description: '2', date: moment(), amount: -512, type: 'O', acc_id: 10102, status: true },
      
    ]));
};
