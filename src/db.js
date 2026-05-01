const Database = require("better-sqlite3");
const path = require("path");

const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    tone TEXT NOT NULL,
    short_pitch TEXT NOT NULL,
    pricing_suggestion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
  );
`);

const insertJobStmt = db.prepare(
  `INSERT INTO jobs (user_id, description) VALUES (?, ?)`
);
const insertProposalStmt = db.prepare(
  `INSERT INTO proposals (job_id, content, tone, short_pitch, pricing_suggestion) VALUES (?, ?, ?, ?, ?)`
);

function saveJobAndProposals({ userId = null, description, proposals }) {
  const tx = db.transaction((payload) => {
    const jobResult = insertJobStmt.run(payload.userId, payload.description);
    const jobId = jobResult.lastInsertRowid;

    for (const proposal of payload.proposals) {
      insertProposalStmt.run(
        jobId,
        proposal.proposal,
        proposal.tone,
        proposal.short_pitch,
        proposal.pricing_suggestion || null
      );
    }

    return jobId;
  });

  return tx({ userId, description, proposals });
}

module.exports = {
  saveJobAndProposals,
};
