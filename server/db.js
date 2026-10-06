import { DatabaseSync } from 'node:sqlite'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

// Vercel interdit l’écriture dans le dossier du projet : /tmp est le seul
// emplacement temporairement accessible dans une fonction serverless.
// Pour une persistance durable, DATA_DIR doit pointer vers une vraie base externe.
const dataDir = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/nurseflow-data' : path.resolve(process.cwd(), 'data'))
fs.mkdirSync(dataDir, { recursive: true })

const db = new DatabaseSync(path.join(dataDir, process.env.DB_FILE || 'nurseflow.sqlite'))
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')

db.exec(`
  CREATE TABLE IF NOT EXISTS nurses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'Infirmier(e) DE',
    service TEXT NOT NULL DEFAULT 'Service Médecine',
    badge TEXT NOT NULL,
    initials TEXT NOT NULL,
    tone TEXT NOT NULL DEFAULT 'blue',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date TEXT,
    sex TEXT,
    blood_group TEXT,
    allergies TEXT,
    room TEXT,
    bed TEXT,
    service TEXT,
    status TEXT NOT NULL DEFAULT 'Stable',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT NOT NULL DEFAULT 'DEM-2026-001',
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    route TEXT NOT NULL,
    scheduled_json TEXT NOT NULL DEFAULT '[]',
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (created_by) REFERENCES nurses(id)
  );

  CREATE TABLE IF NOT EXISTS administrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treatment_id INTEGER NOT NULL,
    hour TEXT NOT NULL,
    status TEXT NOT NULL,
    nurse_id TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    administered_at TEXT NOT NULL,
    UNIQUE (treatment_id, hour),
    FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE,
    FOREIGN KEY (nurse_id) REFERENCES nurses(id)
  );

  CREATE TABLE IF NOT EXISTS diagnostics (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL DEFAULT 'DEM-2026-001',
    code TEXT NOT NULL,
    problem TEXT NOT NULL,
    etiology TEXT NOT NULL DEFAULT '',
    symptoms TEXT NOT NULL DEFAULT '',
    antecedents TEXT NOT NULL DEFAULT '',
    constants TEXT NOT NULL DEFAULT '',
    observations TEXT NOT NULL DEFAULT '',
    domain TEXT NOT NULL DEFAULT 'Non classé',
    priority TEXT NOT NULL DEFAULT 'moyenne',
    status TEXT NOT NULL DEFAULT 'actif',
    interventions_json TEXT NOT NULL DEFAULT '[]',
    outcomes TEXT NOT NULL DEFAULT '',
    validation_note TEXT NOT NULL DEFAULT '',
    nurse_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (nurse_id) REFERENCES nurses(id)
  );

  CREATE TABLE IF NOT EXISTS feedbacks (
    id TEXT PRIMARY KEY,
    nurse_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    page TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'nouveau',
    created_at TEXT NOT NULL,
    FOREIGN KEY (nurse_id) REFERENCES nurses(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    nurse_id TEXT,
    action TEXT NOT NULL,
    type TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    target TEXT NOT NULL DEFAULT '',
    details_json TEXT NOT NULL DEFAULT '{}',
    ip_address TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (nurse_id) REFERENCES nurses(id)
  );

  CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_audit_nurse ON audit_logs(nurse_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedbacks(created_at DESC);
`)

const now = () => new Date().toISOString()
const initialsFor = (name) => name.split(/\s+/).map((part) => part[0] || '').join('').slice(0, 2).toUpperCase()

const defaultNurses = [
  ['NF-042', 'Salima Mansouri', 'salima.mansouri@nurseflow.local', 'Infirmière DE', 'Service Médecine 2', 'BADGE-042', 'blue'],
  ['NF-018', 'Thomas Dubois', 'thomas.dubois@nurseflow.local', 'Infirmier DE', 'Soins continus & Médecine', 'BADGE-018', 'green'],
  ['NF-029', 'Amina Belkacem', 'amina.belkacem@nurseflow.local', 'Infirmière DE (Nuit)', 'Service Médecine 2', 'BADGE-029', 'purple'],
  ['NF-035', 'Karim Benali', 'karim.benali@nurseflow.local', 'Infirmier DE', 'Urgences / Soins intensifs', 'BADGE-035', 'orange'],
  ['NF-007', 'Julie Martin', 'julie.martin@nurseflow.local', 'Cadre de santé', 'Coordination des soins', 'BADGE-007', 'blue'],
]

const nurseCount = db.prepare('SELECT COUNT(*) AS count FROM nurses').get().count
if (nurseCount === 0) {
  const password = process.env.SEED_NURSE_PASSWORD || 'NurseFlow-ChangeMe!2026'
  const passwordHash = bcrypt.hashSync(password, 12)
  const insert = db.prepare(`INSERT INTO nurses
    (id, name, email, password_hash, role, service, badge, initials, tone, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  db.exec('BEGIN')
  try {
    for (const [id, name, email, role, service, badge, tone] of defaultNurses) {
      insert.run(id, name, email, passwordHash, role, service, badge, initialsFor(name), tone, now(), now())
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

const patient = db.prepare('SELECT id FROM patients WHERE id = ?').get('DEM-2026-001')
if (!patient) {
  db.prepare(`INSERT INTO patients
    (id, first_name, last_name, birth_date, sex, blood_group, allergies, room, bed, service, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run('DEM-2026-001', 'Amine', 'Mansouri', '1999-03-14', 'Masculin', 'A+', 'Pénicilline', '12', 'A', 'Service 2 — Médecine', 'À surveiller', now(), now())
}

export { db, now, randomUUID }
