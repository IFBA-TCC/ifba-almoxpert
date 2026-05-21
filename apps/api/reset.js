const b = require('bcrypt');
const mysql = require('mysql2/promise');

async function reset() {
  const hash = await b.hash('admin123', 10);
  console.log('Hash gerado:', hash);

  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'almoxpert',
    password: 'almoxpert',
    database: 'almoxpert'
  });

  await conn.execute(
    'UPDATE users SET password_hash = ? WHERE email = ?',
    [hash, 'admin@ifba.edu.br']
  );

  console.log('Senha atualizada!');
  await conn.end();
}

reset().catch(console.error);