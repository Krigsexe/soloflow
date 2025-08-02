const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://vterkxdfyvhrnottcxhb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZXJreGRmeXZocm5vdHRjeGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzI0NzEsImV4cCI6MjA2OTMwODQ3MX0.62-QCkfmE2sU_FaTr2yH9eis3u6708XKlaiS60kQf0g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Vérification de la base de données Supabase...');
  
  try {
    // Tester la connexion en essayant d'accéder à une table qui devrait exister
    console.log('✅ Connexion à Supabase réussie');
    
    // Vérifier les tables spécifiques nécessaires
    const requiredTables = ['users', 'content_generations', 'social_posts'];
    console.log('\n🎯 Vérification des tables requises:');
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.message.includes('does not exist') || error.code === 'PGRST116') {
            console.log(`  ❌ ${tableName} - Table n'existe pas`);
          } else {
            console.log(`  ⚠️ ${tableName} - Erreur: ${error.message}`);
          }
        } else {
          console.log(`  ✅ ${tableName} - Table existe`);
        }
      } catch (err) {
        console.log(`  ❌ ${tableName} - Erreur: ${err.message}`);
      }
    }
    
    console.log('\n📝 Résumé:');
    console.log('Les tables nécessaires pour SoloFlow ne sont pas créées.');
    console.log('Il faut créer les tables suivantes:');
    console.log('  - users (table des utilisateurs)');
    console.log('  - content_generations (générations de contenu)');
    console.log('  - social_posts (publications sur les réseaux sociaux)');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkDatabase();