/**
 * Promove um e-mail a administrador do Claricash.
 *
 * Uso:
 *   node scripts/promover-admin.js seuemail@dominio.com
 *
 * Ou defina ADMIN_EMAILS no Railway (lista separada por vírgula) —
 * o backend promove automaticamente no startup.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../config.env') });
require('dotenv').config();

const pool = require('../src/database/connection');
const userRepository = require('../src/database/userRepository');

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Informe o e-mail: node scripts/promover-admin.js email@dominio.com');
    process.exit(1);
  }

  await userRepository.ensureAdminSchema();

  let result;
  try {
    result = await pool.query(
      `UPDATE "Usuario" SET "Usuario_Tipo" = 'admin' WHERE LOWER("Usuario_Email") = $1 RETURNING "Usuario_Id", "Usuario_Email", "Usuario_Tipo"`,
      [email]
    );
  } catch {
    result = await pool.query(
      `UPDATE usuario SET usuario_tipo = 'admin' WHERE LOWER(usuario_email) = $1 RETURNING usuario_id, usuario_email, usuario_tipo`,
      [email]
    );
  }

  if (!result.rows.length) {
    console.error(`Usuário não encontrado: ${email}`);
    process.exit(1);
  }

  console.log('✅ Usuário promovido a admin:', result.rows[0]);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
