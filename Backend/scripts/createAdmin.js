// Run from the Backend folder:
//   node scripts/createAdmin.js admin@weru.co.ke "YourStrongPassword"
require('dotenv').config()
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
// Same model your register route uses
const User = require('../models/register')

// Set to false if your User model already hashes the password in a pre-save hook
// (otherwise it would be hashed twice and login would fail)
const HASH_IN_SCRIPT = true // your register route hashes in the route, so hash here too

async function main() {
  const [email, password] = process.argv.slice(2)
  if (!email || !password) {
    console.log('Usage: node scripts/createAdmin.js <email> <password>')
    process.exit(1)
  }
  if (password.length < 8) {
    console.log('Use a password of at least 8 characters.')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)

  const existing = await User.findOne({ email })
  if (existing) {
    console.log('A user with that email already exists.')
    process.exit(1)
  }

  await User.create({
    firstName: 'Weru',
    lastName: 'Admin',
    email,
    password: HASH_IN_SCRIPT ? await bcrypt.hash(password, 10) : password,
    role: 'admin',
    status: 'approved',
    // Placeholders: your schema requires these, admins don't really use them
    phoneno: '0700000000',
    regno: 'ADMIN-001',
    course: 'Administration',
  })

  console.log(`Admin created: ${email}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})