import { app } from '../server/index.js'

export default function handler(req, res) {
  // Vercel retire le préfixe /api avant d’appeler une fonction catch-all.
  // Express attend les routes /api/... définies dans server/index.js.
  if (!req.url.startsWith('/api')) req.url = `/api${req.url}`
  return app(req, res)
}
