// Este script debe ejecutarse desde el servidor o usando la API de Supabase Admin
// No incluir en el build de producción

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const sampleUsers = [
  { name: 'Juan Pérez', email: 'juan.perez@empresa.com' },
  { name: 'María García', email: 'maria.garcia@empresa.com' },
  { name: 'Carlos López', email: 'carlos.lopez@empresa.com' },
  { name: 'Ana Martínez', email: 'ana.martinez@empresa.com' },
  { name: 'Luis Rodríguez', email: 'luis.rodriguez@empresa.com' },
  { name: 'Carmen Fernández', email: 'carmen.fernandez@empresa.com' },
  { name: 'José González', email: 'jose.gonzalez@empresa.com' },
  { name: 'Laura Sánchez', email: 'laura.sanchez@empresa.com' },
  { name: 'Miguel Torres', email: 'miguel.torres@empresa.com' },
  { name: 'Isabel Ruiz', email: 'isabel.ruiz@empresa.com' }
]

function generatePassword(fullName: string): string {
  const nameParts = fullName.trim().split(' ')
  if (nameParts.length < 2) return ''
  
  const firstName = nameParts[0]
  const lastName = nameParts[nameParts.length - 1]
  
  return (firstName.charAt(0) + lastName).toUpperCase()
}

async function createSampleUsers() {
  console.log('Creating sample users...')
  
  for (const user of sampleUsers) {
    try {
      const password = generatePassword(user.name)
      
      const { error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: password,
        user_metadata: {
          full_name: user.name
        },
        email_confirm: true
      })
      
      if (error) {
        console.error(`Error creating user ${user.name}:`, error.message)
      } else {
        console.log(`✅ Created user: ${user.name} (${user.email}) - Password: ${password}`)
      }
    } catch (error) {
      console.error(`Error creating user ${user.name}:`, error)
    }
  }
  
  console.log('Finished creating sample users')
}

// Uncomment to run
// createSampleUsers()

export { createSampleUsers, sampleUsers, generatePassword }
