const express = require('express')
const errorHandler = require('./middleware/errorHandler')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/', require('./routers/index'))

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})