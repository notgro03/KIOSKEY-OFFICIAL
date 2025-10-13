// db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ebezqrsgednjwhajddqu',
  password: 'pQNzoy48T6YNMsik',
  ssl: { rejectUnauthorized: false },
  // Configuraciones adicionales recomendadas para Transaction Pooler
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 2000, // timeout de conexión 2s
});

// Manejo de errores del pool
pool.on('error', (err, client) => {
  console.error('Error inesperado en el cliente del pool', err);
});

// Helper para queries con mejor manejo de errores
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Error en query:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Helper adicional para transacciones (opcional pero útil)
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en transacción:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Función para cerrar el pool (útil para testing o shutdown)
async function end() {
  await pool.end();
}

module.exports = { query, transaction, end };

// === EJEMPLO DE USO ===

// uso-ejemplo.js
const db = require('./db');

// Query simple
async function getUsers() {
  try {
    const result = await db.query('SELECT * FROM users LIMIT 10');
    return result.rows;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error;
  }
}

// Query con parámetros (SIEMPRE usa esto para prevenir SQL injection)
async function getUserById(id) {
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    throw error;
  }
}

// Insert con parámetros
async function createUser(name, email) {
  try {
    const result = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
}

// Uso de transacciones
async function transferMoney(fromId, toId, amount) {
  try {
    return await db.transaction(async (client) => {
      await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [amount, fromId]
      );
      await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [amount, toId]
      );
      return { success: true };
    });
  } catch (error) {
    console.error('Error en transferencia:', error);
    throw error;
  }
}

// Ejemplo en Express
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = await createUser(name, email);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Cerrando pool de conexiones...');
  await db.end();
  process.exit(0);
});

// app.listen(3000, () => console.log('Server running on port 3000'));