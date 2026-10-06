import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import helmet from 'helmet'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db, now, randomUUID } from './db.js'

const app = express()
const port = Number(process.env.PORT || 3001)
const jwtSecret = process.env.JWT_SECRET || 'nurseflow-development-secret-change-me'
const allowDevHeader = process.env.ALLOW_DEV_NURSE_HEADER === 'true'

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

const nurseSelect = `SELECT id, name, email, role, service, badge, initials, tone, is_active AS isActive,
  created_at AS createdAt, updated_at AS updatedAt FROM nurses`

function signToken(nurse) {
  return jwt.sign({ sub: nurse.id, role: nurse.role, service: nurse.service }, jwtSecret, { expiresIn: '12h' })
}

function auth(req, res, next) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), jwtSecret)
      const nurse = db.prepare(`${nurseSelect} WHERE id = ? AND is_active = 1`).get(payload.sub)
      if (!nurse) return res.status(401).json({ error: 'Compte soignant inactif ou introuvable.' })
      req.nurse = nurse
      return next()
    } catch {
      return res.status(401).json({ error: 'Session expirée ou invalide.' })
    }
  }
  if (allowDevHeader && req.headers['x-nurse-id']) {
    const nurse = db.prepare(`${nurseSelect} WHERE id = ? AND is_active = 1`).get(req.headers['x-nurse-id'])
    if (nurse) {
      req.nurse = nurse
      return next()
    }
  }
  return res.status(401).json({ error: 'Authentification requise.' })
}

function audit(req, data) {
  db.prepare(`INSERT INTO audit_logs
    (id, nurse_id, action, type, entity, entity_id, target, details_json, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(
      randomUUID(), req.nurse?.id || null, data.action, data.type, data.entity,
      data.entityId ? String(data.entityId) : null, data.target || '',
      JSON.stringify(data.details || {}), req.ip, now(),
    )
}

function parseJson(value, fallback = []) {
  try { return JSON.parse(value) } catch { return fallback }
}

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) })
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'nurseflow-api', time: now() }))

app.post('/api/auth/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Email ou mot de passe invalide.' })
  const nurse = db.prepare('SELECT * FROM nurses WHERE email = ? AND is_active = 1').get(parsed.data.email.toLowerCase())
  if (!nurse || !bcrypt.compareSync(parsed.data.password, nurse.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects.' })
  }
  const safeNurse = db.prepare(`${nurseSelect} WHERE id = ?`).get(nurse.id)
  const token = signToken(safeNurse)
  audit({ nurse: safeNurse, ip: req.ip }, { action: 'Connexion au dossier de soins', type: 'auth', entity: 'session', entityId: safeNurse.id, target: safeNurse.name })
  res.json({ token, nurse: safeNurse })
})

app.post('/api/auth/register', (req, res) => {
  const schema = z.object({
    name: z.string().trim().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.string().trim().min(2).default('Infirmier(e) DE'),
    service: z.string().trim().min(2).default('Service Médecine 2'),
    badge: z.string().trim().min(2),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Les informations d’inscription sont invalides.' })
  const count = db.prepare('SELECT COUNT(*) AS count FROM nurses').get().count
  const id = `NF-${String(count + 1).padStart(3, '0')}`
  const timestamp = now()
  const initials = parsed.data.name.split(/\s+/).map((part) => part[0] || '').join('').slice(0, 2).toUpperCase()
  try {
    db.prepare(`INSERT INTO nurses (id, name, email, password_hash, role, service, badge, initials, tone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, parsed.data.name, parsed.data.email.toLowerCase(), bcrypt.hashSync(parsed.data.password, 12), parsed.data.role, parsed.data.service, parsed.data.badge, initials, 'blue', timestamp, timestamp)
    const nurse = db.prepare(`${nurseSelect} WHERE id = ?`).get(id)
    const token = signToken(nurse)
    audit({ nurse, ip: req.ip }, { action: 'Compte infirmier créé', type: 'auth', entity: 'nurse', entityId: id, target: nurse.name })
    res.status(201).json({ token, nurse })
  } catch {
    res.status(409).json({ error: 'Cet email ou ce matricule est déjà utilisé.' })
  }
})

app.post('/api/auth/shift', (req, res) => {
  const schema = z.object({ nurseId: z.string().min(1) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Infirmier invalide.' })
  const nurse = db.prepare(`${nurseSelect} WHERE id = ? AND is_active = 1`).get(parsed.data.nurseId)
  if (!nurse) return res.status(404).json({ error: 'Infirmier introuvable.' })
  const token = signToken(nurse)
  audit({ nurse, ip: req.ip }, { action: 'Prise de poste enregistrée', type: 'session', entity: 'session', entityId: nurse.id, target: `${nurse.name} · ${nurse.service}` })
  res.json({ token, nurse })
})

app.get('/api/me', auth, (req, res) => res.json({ nurse: req.nurse }))

app.get('/api/nurses', auth, (_req, res) => {
  res.json({ nurses: db.prepare(`${nurseSelect} WHERE is_active = 1 ORDER BY name`).all() })
})

app.post('/api/nurses', auth, (req, res) => {
  const schema = z.object({ name: z.string().trim().min(2), role: z.string().trim().min(2), service: z.string().trim().min(2), badge: z.string().trim().min(2), email: z.string().email().optional() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Données du soignant invalides.', details: parsed.error.flatten() })
  const id = `NF-${String((db.prepare('SELECT COUNT(*) AS count FROM nurses').get().count || 0) + 1).padStart(3, '0')}`
  const createdAt = now()
  const name = parsed.data.name
  const initials = name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  try {
    db.prepare(`INSERT INTO nurses (id, name, email, password_hash, role, service, badge, initials, tone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, name, parsed.data.email || null, bcrypt.hashSync(process.env.SEED_NURSE_PASSWORD || 'NurseFlow-ChangeMe!2026', 12), parsed.data.role, parsed.data.service, parsed.data.badge, initials, 'blue', createdAt, createdAt)
    const nurse = db.prepare(`${nurseSelect} WHERE id = ?`).get(id)
    audit(req, { action: 'Soignant ajouté à l’équipe', type: 'staff', entity: 'nurse', entityId: id, target: `${name} · ${parsed.data.service}` })
    res.status(201).json({ nurse })
  } catch (error) { res.status(409).json({ error: 'Ce soignant existe déjà ou les données sont incompatibles.' }) }
})

app.patch('/api/nurses/:id', auth, (req, res) => {
  const schema = z.object({ name: z.string().trim().min(2), role: z.string().trim().min(2), service: z.string().trim().min(2), badge: z.string().trim().min(2) })
  const parsed = schema.safeParse(req.body)
  const before = db.prepare(`${nurseSelect} WHERE id = ?`).get(req.params.id)
  if (!before) return res.status(404).json({ error: 'Soignant introuvable.' })
  if (!parsed.success) return res.status(400).json({ error: 'Données du soignant invalides.' })
  const updatedAt = now()
  const initials = parsed.data.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  db.prepare('UPDATE nurses SET name = ?, role = ?, service = ?, badge = ?, initials = ?, updated_at = ? WHERE id = ?')
    .run(parsed.data.name, parsed.data.role, parsed.data.service, parsed.data.badge, initials, updatedAt, req.params.id)
  const nurse = db.prepare(`${nurseSelect} WHERE id = ?`).get(req.params.id)
  audit(req, { action: 'Profil soignant modifié', type: 'staff', entity: 'nurse', entityId: nurse.id, target: nurse.name, details: { before, after: nurse } })
  res.json({ nurse })
})

app.delete('/api/nurses/:id', auth, (req, res) => {
  if (req.params.id === req.nurse.id) return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre session.' })
  const nurse = db.prepare(`${nurseSelect} WHERE id = ?`).get(req.params.id)
  if (!nurse) return res.status(404).json({ error: 'Soignant introuvable.' })
  db.prepare('UPDATE nurses SET is_active = 0, updated_at = ? WHERE id = ?').run(now(), req.params.id)
  audit(req, { action: 'Soignant retiré de l’équipe', type: 'staff', entity: 'nurse', entityId: nurse.id, target: nurse.name })
  res.status(204).end()
})

app.get('/api/patients', auth, (_req, res) => {
  const patients = db.prepare(`SELECT id, first_name AS firstName, last_name AS lastName, birth_date AS birthDate,
    sex, blood_group AS bloodGroup, allergies, room, bed, service, status, created_at AS createdAt, updated_at AS updatedAt
    FROM patients ORDER BY last_name, first_name`).all()
  res.json({ patients })
})

app.get('/api/patients/:id', auth, (req, res) => {
  const patient = db.prepare(`SELECT id, first_name AS firstName, last_name AS lastName, birth_date AS birthDate,
    sex, blood_group AS bloodGroup, allergies, room, bed, service, status, created_at AS createdAt, updated_at AS updatedAt
    FROM patients WHERE id = ?`).get(req.params.id)
  if (!patient) return res.status(404).json({ error: 'Dossier patient introuvable.' })
  res.json({ patient })
})

app.post('/api/patients', auth, (req, res) => {
  const schema = z.object({ id: z.string().trim().min(3).optional(), firstName: z.string().trim().min(1), lastName: z.string().trim().min(1), birthDate: z.string().optional().default(''), sex: z.string().optional().default(''), bloodGroup: z.string().optional().default(''), allergies: z.string().optional().default(''), room: z.string().optional().default(''), bed: z.string().optional().default(''), service: z.string().optional().default(''), status: z.string().optional().default('Stable') })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Dossier patient invalide.' })
  const id = parsed.data.id || `DEM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
  const timestamp = now()
  try {
    db.prepare(`INSERT INTO patients (id, first_name, last_name, birth_date, sex, blood_group, allergies, room, bed, service, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, parsed.data.firstName, parsed.data.lastName, parsed.data.birthDate, parsed.data.sex, parsed.data.bloodGroup, parsed.data.allergies, parsed.data.room, parsed.data.bed, parsed.data.service, parsed.data.status, timestamp, timestamp)
    audit(req, { action: 'Dossier patient créé', type: 'patient', entity: 'patient', entityId: id, target: `${parsed.data.firstName} ${parsed.data.lastName}` })
    res.status(201).json({ id })
  } catch { res.status(409).json({ error: 'Un dossier patient avec cet identifiant existe déjà.' }) }
})

app.patch('/api/patients/:id', auth, (req, res) => {
  const schema = z.object({ firstName: z.string().trim().min(1), lastName: z.string().trim().min(1), birthDate: z.string().optional().default(''), sex: z.string().optional().default(''), bloodGroup: z.string().optional().default(''), allergies: z.string().optional().default(''), room: z.string().optional().default(''), bed: z.string().optional().default(''), service: z.string().optional().default(''), status: z.string().optional().default('Stable') })
  const parsed = schema.safeParse(req.body)
  const before = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id)
  if (!before) return res.status(404).json({ error: 'Dossier patient introuvable.' })
  if (!parsed.success) return res.status(400).json({ error: 'Dossier patient invalide.' })
  db.prepare(`UPDATE patients SET first_name=?, last_name=?, birth_date=?, sex=?, blood_group=?, allergies=?, room=?, bed=?, service=?, status=?, updated_at=? WHERE id=?`)
    .run(parsed.data.firstName, parsed.data.lastName, parsed.data.birthDate, parsed.data.sex, parsed.data.bloodGroup, parsed.data.allergies, parsed.data.room, parsed.data.bed, parsed.data.service, parsed.data.status, now(), req.params.id)
  audit(req, { action: 'Dossier patient modifié', type: 'patient', entity: 'patient', entityId: req.params.id, target: `${parsed.data.firstName} ${parsed.data.lastName}`, details: { before, after: parsed.data } })
  res.json({ ok: true })
})

app.get('/api/activity', auth, (req, res) => {
  const limit = Math.min(Number(req.query.limit || 100), 500)
  const onlyMine = req.query.mine === 'true'
  const rows = db.prepare(`SELECT a.id, a.nurse_id AS nurseId, n.name AS nurseName, a.action, a.type, a.entity,
    a.entity_id AS entityId, a.target, a.details_json AS details, a.ip_address AS ipAddress, a.created_at AS timestamp
    FROM audit_logs a LEFT JOIN nurses n ON n.id = a.nurse_id
    ${onlyMine ? 'WHERE a.nurse_id = ?' : ''} ORDER BY a.created_at DESC LIMIT ?`)
    .all(...(onlyMine ? [req.nurse.id, limit] : [limit]))
  res.json({ activities: rows.map((row) => ({ ...row, details: parseJson(row.details, {}) })) })
})

app.post('/api/activity/manual', auth, (req, res) => {
  const schema = z.object({
    action: z.string().trim().min(2),
    type: z.string().trim().min(2),
    entity: z.string().trim().min(2).default('clinical_record'),
    entityId: z.union([z.string(), z.number()]).optional(),
    target: z.string().optional().default(''),
    details: z.record(z.string(), z.any()).optional().default({}),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Événement d’audit invalide.' })
  const id = randomUUID()
  db.prepare(`INSERT INTO audit_logs (id, nurse_id, action, type, entity, entity_id, target, details_json, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.nurse.id, parsed.data.action, parsed.data.type, parsed.data.entity, parsed.data.entityId ? String(parsed.data.entityId) : null, parsed.data.target, JSON.stringify(parsed.data.details), req.ip, now())
  res.status(201).json({ id })
})

app.post('/api/feedback', auth, (req, res) => {
  const schema = z.object({ rating: z.number().int().min(1).max(5), category: z.string().trim().min(2), message: z.string().trim().min(3), page: z.string().optional().default('') })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Feedback incomplet ou invalide.' })
  const id = randomUUID()
  db.prepare('INSERT INTO feedbacks (id, nurse_id, rating, category, message, page, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.nurse.id, parsed.data.rating, parsed.data.category, parsed.data.message, parsed.data.page, now())
  audit(req, { action: 'Feedback utilisateur envoyé', type: 'feedback', entity: 'feedback', entityId: id, target: `${parsed.data.category} · ${parsed.data.rating}/5` })
  res.status(201).json({ id })
})

app.get('/api/feedback', auth, (_req, res) => {
  const feedbacks = db.prepare(`SELECT f.id, f.nurse_id AS nurseId, n.name AS nurseName, f.rating, f.category,
    f.message, f.page, f.status, f.created_at AS createdAt FROM feedbacks f JOIN nurses n ON n.id = f.nurse_id ORDER BY f.created_at DESC`).all()
  res.json({ feedbacks })
})

app.get('/api/treatments', auth, (req, res) => {
  const treatments = db.prepare(`SELECT t.id, t.patient_id AS patientId, t.name, t.dosage, t.route,
    t.scheduled_json AS scheduled, t.created_by AS createdBy, t.created_at AS createdAt, t.updated_at AS updatedAt
    FROM treatments t WHERE t.patient_id = ? ORDER BY t.id`).all(req.query.patientId || 'DEM-2026-001')
  const administrations = db.prepare(`SELECT id, treatment_id AS treatmentId, hour, status, nurse_id AS nurseId, note, administered_at AS at FROM administrations WHERE treatment_id IN (SELECT id FROM treatments WHERE patient_id = ?)`).all(req.query.patientId || 'DEM-2026-001')
  const byTreatment = administrations.reduce((all, item) => { (all[item.treatmentId] ||= {})[item.hour] = item; return all }, {})
  res.json({ treatments: treatments.map((t) => ({ ...t, scheduled: parseJson(t.scheduled, []), administrations: byTreatment[t.id] || {} })) })
})

app.post('/api/treatments', auth, (req, res) => {
  const schema = z.object({ patientId: z.string().default('DEM-2026-001'), name: z.string().trim().min(1), dosage: z.string().trim().min(1), route: z.string().trim().min(1), scheduled: z.array(z.string()).default([]) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Traitement invalide.' })
  const createdAt = now()
  const result = db.prepare(`INSERT INTO treatments (patient_id, name, dosage, route, scheduled_json, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(parsed.data.patientId, parsed.data.name, parsed.data.dosage, parsed.data.route, JSON.stringify(parsed.data.scheduled), req.nurse.id, createdAt, createdAt)
  const id = result.lastInsertRowid
  audit(req, { action: 'Traitement ajouté au planning', type: 'treatment', entity: 'treatment', entityId: id, target: `${parsed.data.name} ${parsed.data.dosage} · ${parsed.data.route}`, details: { scheduled: parsed.data.scheduled } })
  res.status(201).json({ id })
})

app.patch('/api/treatments/:id', auth, (req, res) => {
  const schema = z.object({ name: z.string().trim().min(1), dosage: z.string().trim().min(1), route: z.string().trim().min(1), scheduled: z.array(z.string()).default([]) })
  const parsed = schema.safeParse(req.body)
  const before = db.prepare('SELECT * FROM treatments WHERE id = ?').get(req.params.id)
  if (!before) return res.status(404).json({ error: 'Traitement introuvable.' })
  if (!parsed.success) return res.status(400).json({ error: 'Traitement invalide.' })
  db.prepare('UPDATE treatments SET name = ?, dosage = ?, route = ?, scheduled_json = ?, updated_at = ? WHERE id = ?')
    .run(parsed.data.name, parsed.data.dosage, parsed.data.route, JSON.stringify(parsed.data.scheduled), now(), req.params.id)
  audit(req, { action: 'Traitement modifié', type: 'treatment', entity: 'treatment', entityId: req.params.id, target: `${parsed.data.name} ${parsed.data.dosage} · ${parsed.data.route}`, details: { before, after: parsed.data } })
  res.json({ ok: true })
})

app.delete('/api/treatments/:id', auth, (req, res) => {
  const treatment = db.prepare('SELECT * FROM treatments WHERE id = ?').get(req.params.id)
  if (!treatment) return res.status(404).json({ error: 'Traitement introuvable.' })
  db.prepare('DELETE FROM treatments WHERE id = ?').run(req.params.id)
  audit(req, { action: 'Traitement supprimé du planning', type: 'treatment', entity: 'treatment', entityId: req.params.id, target: `${treatment.name} ${treatment.dosage} · ${treatment.route}` })
  res.status(204).end()
})

app.put('/api/treatments/:id/administrations/:hour', auth, (req, res) => {
  const schema = z.object({ status: z.enum(['done', 'skipped', 'cancelled', 'refused']).nullable(), note: z.string().default('') })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Statut d’administration invalide.' })
  const treatment = db.prepare('SELECT * FROM treatments WHERE id = ?').get(req.params.id)
  if (!treatment) return res.status(404).json({ error: 'Traitement introuvable.' })
  if (parsed.data.status === null) {
    db.prepare('DELETE FROM administrations WHERE treatment_id = ? AND hour = ?').run(req.params.id, req.params.hour)
  } else {
    db.prepare(`INSERT INTO administrations (treatment_id, hour, status, nurse_id, note, administered_at) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(treatment_id, hour) DO UPDATE SET status = excluded.status, nurse_id = excluded.nurse_id, note = excluded.note, administered_at = excluded.administered_at`)
      .run(req.params.id, req.params.hour, parsed.data.status, req.nurse.id, parsed.data.note, now())
  }
  audit(req, { action: parsed.data.status === null ? 'Prise effacée / réinitialisée' : `Statut : ${parsed.data.status}`, type: 'treatment', entity: 'administration', entityId: `${req.params.id}:${req.params.hour}`, target: `${treatment.name} (${req.params.hour}h)` })
  res.status(204).end()
})

app.get('/api/diagnostics', auth, (req, res) => {
  const rows = db.prepare(`SELECT id, patient_id AS patientId, code, problem AS probleme, etiology AS etiologie, symptoms AS symptomes,
    antecedents, constants AS constantes, observations, domain, priority, status, interventions_json AS interventions,
    outcomes, validation_note AS validationNote, nurse_id AS nurseId, created_at AS createdAt, updated_at AS updatedAt
    FROM diagnostics WHERE patient_id = ? ORDER BY created_at DESC`).all(req.query.patientId || 'DEM-2026-001')
  res.json({ diagnostics: rows.map((row) => ({ ...row, interventions: parseJson(row.interventions, []) })) })
})

app.post('/api/diagnostics', auth, (req, res) => {
  const schema = z.object({ id: z.string().optional(), patientId: z.string().default('DEM-2026-001'), code: z.string().default('NANDA-XXXXX'), probleme: z.string().trim().min(1), etiologie: z.string().default(''), symptomes: z.string().default(''), antecedents: z.string().default(''), constantes: z.string().default(''), observations: z.string().default(''), domain: z.string().default('Non classé'), priority: z.enum(['haute', 'moyenne', 'basse']).default('moyenne'), interventions: z.array(z.string()).default([]), outcomes: z.string().default(''), validationNote: z.string().default('') })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Diagnostic invalide.' })
  const id = parsed.data.id || randomUUID()
  const createdAt = now()
  db.prepare(`INSERT INTO diagnostics (id, patient_id, code, problem, etiology, symptoms, antecedents, constants, observations, domain, priority, status, interventions_json, outcomes, validation_note, nurse_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'actif', ?, ?, ?, ?, ?, ?)`)
    .run(id, parsed.data.patientId, parsed.data.code, parsed.data.probleme, parsed.data.etiologie, parsed.data.symptomes, parsed.data.antecedents, parsed.data.constantes, parsed.data.observations, parsed.data.domain, parsed.data.priority, JSON.stringify(parsed.data.interventions), parsed.data.outcomes, parsed.data.validationNote, req.nurse.id, createdAt, createdAt)
  audit(req, { action: 'Diagnostic infirmier posé', type: 'diagnostic', entity: 'diagnostic', entityId: id, target: `${parsed.data.probleme} (${parsed.data.code})` })
  res.status(201).json({ id })
})

app.patch('/api/diagnostics/:id', auth, (req, res) => {
  const schema = z.object({ probleme: z.string().trim().min(1), code: z.string(), etiologie: z.string().default(''), symptomes: z.string().default(''), antecedents: z.string().default(''), constantes: z.string().default(''), observations: z.string().default(''), domain: z.string(), priority: z.enum(['haute', 'moyenne', 'basse']), interventions: z.array(z.string()).default([]), outcomes: z.string().default(''), validationNote: z.string().default(''), status: z.enum(['actif', 'surveillance', 'résolu']).default('actif') })
  const parsed = schema.safeParse(req.body)
  const before = db.prepare('SELECT * FROM diagnostics WHERE id = ?').get(req.params.id)
  if (!before) return res.status(404).json({ error: 'Diagnostic introuvable.' })
  if (!parsed.success) return res.status(400).json({ error: 'Diagnostic invalide.' })
  db.prepare(`UPDATE diagnostics SET code=?, problem=?, etiology=?, symptoms=?, antecedents=?, constants=?, observations=?, domain=?, priority=?, status=?, interventions_json=?, outcomes=?, validation_note=?, nurse_id=?, updated_at=? WHERE id=?`)
    .run(parsed.data.code, parsed.data.probleme, parsed.data.etiologie, parsed.data.symptomes, parsed.data.antecedents, parsed.data.constantes, parsed.data.observations, parsed.data.domain, parsed.data.priority, parsed.data.status, JSON.stringify(parsed.data.interventions), parsed.data.outcomes, parsed.data.validationNote, req.nurse.id, now(), req.params.id)
  audit(req, { action: parsed.data.status === 'résolu' ? 'Diagnostic résolu' : 'Diagnostic modifié', type: 'diagnostic', entity: 'diagnostic', entityId: req.params.id, target: `${parsed.data.probleme} (${parsed.data.code})`, details: { before, after: parsed.data } })
  res.json({ ok: true })
})

app.delete('/api/diagnostics/:id', auth, (req, res) => {
  const diagnostic = db.prepare('SELECT * FROM diagnostics WHERE id = ?').get(req.params.id)
  if (!diagnostic) return res.status(404).json({ error: 'Diagnostic introuvable.' })
  db.prepare('DELETE FROM diagnostics WHERE id = ?').run(req.params.id)
  audit(req, { action: 'Diagnostic supprimé', type: 'diagnostic', entity: 'diagnostic', entityId: req.params.id, target: `${diagnostic.problem} (${diagnostic.code})` })
  res.status(204).end()
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Erreur interne du serveur.' })
})

export { app }

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`NurseFlow API listening on http://0.0.0.0:${port}`)
  })
}
