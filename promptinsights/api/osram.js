export default function handler(req, res) {
  const auth = req.headers['authorization']

  if (auth) {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString()
    const [user, pass] = credentials.split(':')
    if (user === 'osram' && pass === 'CheilOsram2026!2tw#') {
      res.setHeader('Content-Type', 'text/html')
      return res.send('<h1>Osram</h1>') // später ersetzen wir das durch die echte Seite
    }
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Protected Area"')
  res.status(401).send('Unauthorized')
}