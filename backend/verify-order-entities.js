const { AppDataSource } = require('./dist/config/database');

async function verifyOrderEntities() {
  try {
    console.log('🔍 Verifying order entities...');
    
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const entities = AppDataSource.entityMetadatas;
    console.log('\n📋 Available entities:');
    
    const entityNames = entities.map(entity => entity.name).sort();
    entityNames.forEach(name => {
      console.log(`  ✓ ${name}`);
    });

    // Check for our new entities
    const requiredEntities = ['Order', 'OrderItem', 'Address'];
    const missingEntities = requiredEntities.filter(name => 
      !entityNames.includes(name)
    );

    if (missingEntities.length > 0) {
      console.log('\n❌ Missing entities:');
      missingEntities.forEach(name => {
        console.log(`  ✗ ${name}`);
      });
      process.exit(1);
    }

    console.log('\n✅ All order entities are properly configured!');
    
    // Check relationships
    const orderEntity = entities.find(e => e.name === 'Order');
    const orderItemEntity = entities.find(e => e.name === 'OrderItem');
    const addressEntity = entities.find(e => e.name === 'Address');
    const userEntity = entities.find(e => e.name === 'User');

    console.log('\n🔗 Checking relationships:');
    
    if (orderEntity) {
      const orderRelations = orderEntity.relations.map(r => `${r.propertyName} -> ${r.type.name || r.type}`);
      console.log(`  Order relations: ${orderRelations.join(', ')}`);
    }

    if (orderItemEntity) {
      const orderItemRelations = orderItemEntity.relations.map(r => `${r.propertyName} -> ${r.type.name || r.type}`);
      console.log(`  OrderItem relations: ${orderItemRelations.join(', ')}`);
    }

    if (addressEntity) {
      const addressRelations = addressEntity.relations.map(r => `${r.propertyName} -> ${r.type.name || r.type}`);
      console.log(`  Address relations: ${addressRelations.join(', ')}`);
    }

    if (userEntity) {
      const userRelations = userEntity.relations.map(r => `${r.propertyName} -> ${r.type.name || r.type}`);
      console.log(`  User relations: ${userRelations.join(', ')}`);
    }

    console.log('\n✅ Entity verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Entity verification failed:', error.message);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

verifyOrderEntities();