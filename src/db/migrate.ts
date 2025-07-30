import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, client } from './index'
import path from 'path'

async function main() {
  try {
    console.log('🚀 Starting database migration...')
    
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'drizzle')
    })
    
    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
