/// MODULES
require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

/// CONFIGS
const app = express()
app.use(express.json())
app.use(express.static('build'))
app.use(cors())

// Format logs
morgan.token('body', (req, res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body)
  }
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

/// APIs: HTTP METHODS
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const currentDate = new Date()

    response.send(
      `<div>
        <div>Phonebook has info for ${persons.length} people</div>
        <div>${currentDate}</div>
      </div>`)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() // notfound
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => {
  return Math.floor(Math.random() * 10000);
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  if(Person.find({ name: body.name })){
    return response.status(400).json({
      error: 'name is already in the phonebook'
    })
  }

  const person = new Person({
    id: generateId(),
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

/// OTHER MIDDLEWARES
/* Middleware that is used for catching requests 
   made to non-existent routes */
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

/* Middleware that handles the errors 
  => this has to be the last loaded middleware */
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})