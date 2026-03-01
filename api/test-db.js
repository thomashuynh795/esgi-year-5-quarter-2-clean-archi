const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://parking:parking@localhost:5432/parking?schema=public' });

async function run() {
  await client.connect();
  const res = await client.query('SELECT email FROM "User" LIMIT 5;');
  console.log(res.rows);
  await client.end();
}
run();
