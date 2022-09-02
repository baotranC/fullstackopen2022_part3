const mongoose = require('mongoose')

/// Manage arguments
const ADD_ENTRY = 1
const DISPLAY_ALL_ENTRIES = 2
let opt = 999

if (process.argv.length == 5) {
    opt = ADD_ENTRY
} else if (process.argv.length == 3) {
    opt = DISPLAY_ALL_ENTRIES
} else {
    console.log('ERROR: To add an entry to the phonebook: node mongo.js <password> <name> <phone>\nTo display all entries in the phonebook: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

/// Add Database connection and add schema for phonebook
const url = `mongodb+srv://admin:${password}@cluster0.nm41joh.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})
const Person = mongoose.model('Person', personSchema)

/// Functions
const addPerson = (url) => {
    mongoose
        .connect(url)
        .then((result) => {
            console.log('connected')

            const person = new Person({
                name: name,
                number: number
            })

            return person.save()
        })
        .then(() => {
            console.log('added ', name, ' number ', number, ' to phonebook')
            return mongoose.connection.close()
        })
        .catch((err) => console.log(err))
}

const displayPhonebook = (url) => {
    mongoose
        .connect(url)
        .then((result) => {
            console.log('connected')

            Person.find({}).then(result => {
                result.forEach(person => {
                    console.log(person)
                })
                mongoose.connection.close()
            })
        })
        .catch((err) => console.log(err))
}

/// Main
switch (opt) {
    case ADD_ENTRY:
        addPerson(url)
        break;
    case DISPLAY_ALL_ENTRIES:
        displayPhonebook(url)
        break;
    default:
        break;
}

