
const db = require('./db');

async function test() {
  try {
    const result = await db.query('SELECT NOW();');
    console.log('Connected successfully:', result.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    process.exit();
  }
}

test();
