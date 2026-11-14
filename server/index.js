// Long-running server (local dev, Render, Railway, VPS). On Vercel the API runs from api/index.js instead.
import app, { ready } from './app.js'

const PORT = process.env.PORT || 4000
ready.then(() => app.listen(PORT, () => console.log(`ENDO EXPERT running on http://localhost:${PORT}`))).catch(() => process.exit(1))
