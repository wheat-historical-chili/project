/* === CONFIG .ENV FILE === */
require('dotenv').config()

/* === MODULES === */
const express    = require('express')
const cmd        = require('node-cmd')
const crypto     = require('crypto')
const bodyparser = require('body-parser')

// ✔ [ create server & middelware ]
const server = express()
server.use( bodyparser.urlencoded( { extended : false } ) )
server.use( bodyparser.json() )

// ✔ [ git push post update ]
server.post('/git' , (req, res, next) => {
  const payload  = JSON.stringify(req.body)
  const hmac     = crypto.createHmac('sha1', process.env.GITHUB_SECRET)
  const digest   = 'sha1=' + hmac.update(payload).digest('hex')
  const checksum = req.headers['x-hub-signature']
  if (!checksum || !digest || checksum !== digest) { return res.status(403).send('auth failed') }
  return next()
} , (req, res) => {
  if (req.headers['x-github-event'] == 'push') {
    cmd.get('bash git.sh', (err, data) => { if (err) return console.log(err); console.log(data); return res.status(200).send(data) } )
  } else if (req.headers['x-github-event'] == 'ping') {
    return res.status(200).send('PONG')
  } else {
    return res.status(200).send('Unsuported Github event. Nothing done.')
  }
} )

// ☐ [ ]

// ✔ [ listen server at the port ]
const PORT = process.env.PORT || 5000
server.listen( PORT , () => { console.log(`Server is listening on port ${PORT}` ) } )