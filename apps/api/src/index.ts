import 'dotenv/config'
import fastify from "fastify"
import { neon } from '@neondatabase/serverless';
import cors from "@fastify/cors";
import { protect, unprotect } from "@repo/crypto"

const app = fastify()

await app.register(cors, {
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
});

const sql =  neon(process.env.DATABASE_URL!)
console.log(process.env.DATABASE_URL!)
// Create table on startup
await sql`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    partyId TEXT,
    createdAt TEXT,
    payload_nonce TEXT,
    payload_ct TEXT,
    payload_tag TEXT,
    dek_wrap_nonce TEXT,
    dek_wrapped TEXT,
    dek_wrap_tag TEXT,
    alg TEXT,
    mk_version INTEGER
  )
`;

app.post('/tx/encrypt', async (req, res) => {
  const { partyId, payload } = req.body as any;
  const data = JSON.parse(payload)
  const record = protect(data, partyId, process.env.MASTER_KEY!);

  await sql`
    INSERT INTO transactions (
      id, partyId, createdAt, payload_nonce, payload_ct, payload_tag, 
      dek_wrap_nonce, dek_wrapped, dek_wrap_tag, alg, mk_version
    ) VALUES (
      ${record.id}, ${record.partyId}, ${record.createdAt}, 
      ${record.payload_nonce}, ${record.payload_ct}, ${record.payload_tag},
      ${record.dek_wrap_nonce}, ${record.dek_wrapped}, ${record.dek_wrap_tag},
      ${record.alg}, ${record.mk_version}
    )
  `;

  return { success: true, id: record.id };
});

app.get('/tx/:id/decrypt', async (req, res) => {
  const { id } = req.params as any;

  const result = await sql`SELECT * FROM transactions WHERE id = ${id}`;
  const record = result[0] as any;
  
  if (!record) return res.status(404).send({ error: "Record not found" });

  try {
    const originalPayload = unprotect(record as any, process.env.MASTER_KEY!);
    return { data: originalPayload };
  } catch (err) {
    return res.status(400).send({ error: "Decryption failed: Integrity check failed." });
  }
});

app.get('/tx/:id', async (req, res) => {
  const { id } = req.params as any;
  
  const result = await sql`SELECT * FROM transactions WHERE id = ${id}`;
  const record = result[0];

  if (!record) return res.status(404).send({ message: "Record not found" });

  return { data: record };
});

const port = process.env.PORT || 8080;
app.listen({ port: +port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
});