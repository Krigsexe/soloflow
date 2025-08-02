/**
 * Script de configuration automatique de la base de données Supabase
 * Exécute la création des tables nécessaires pour SoloFlow
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Fonction pour charger les variables d'environnement depuis .env.local
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        process.env[key] = value;
      }
    });
    
    console.log('✅ Variables d\'environnement chargées depuis .env.local');
  } catch (error) {
    console.error('❌ Erreur lors du chargement de .env.local:', error.message);
  }
}

// Charger les variables d'environnement
loadEnvFile();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Variables Supabase détectées:');
console.log('   - URL:', supabaseUrl ? '✅' : '❌');
console.log('   - Key:', supabaseServiceKey ? '✅' : '❌');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesDirectly() {
  console.log('🚀 Création directe des tables SoloFlow...');
  
  const tables = {
    users: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        avatar_url VARCHAR(255),
        subscription_plan VARCHAR(50) DEFAULT 'free',
        subscription_expires_at TIMESTAMPTZ,
        is_admin BOOLEAN DEFAULT FALSE,
        clerk_user_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
    content_generations: `
      CREATE TABLE IF NOT EXISTS content_generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        original_image_url VARCHAR(255) NOT NULL,
        extracted_text TEXT,
        user_comment TEXT,
        generated_content JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
    social_posts: `
      CREATE TABLE IF NOT EXISTS social_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_generation_id UUID REFERENCES content_generations(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        platform_post_id VARCHAR(255),
        error_message TEXT,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  };
  
  try {
    // Créer chaque table
    for (const [tableName, sql] of Object.entries(tables)) {
      console.log(`📝 Création de la table ${tableName}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`   ⚠️  RPC échoué, tentative directe...`);
        // Fallback: essayer avec une requête SQL brute
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql })
          });
          
          if (response.ok) {
            console.log(`   ✅ Table ${tableName} créée`);
          } else {
            console.log(`   ⚠️  Erreur HTTP ${response.status} pour ${tableName}`);
          }
        } catch (fetchError) {
          console.log(`   ⚠️  Erreur fetch pour ${tableName}:`, fetchError.message);
        }
      } else {
        console.log(`   ✅ Table ${tableName} créée`);
      }
    }
    
    // Vérifier que les tables existent
    console.log('\n🔍 Vérification des tables...');
    
    for (const tableName of Object.keys(tables)) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}: Table accessible`);
        }
      } catch (err) {
        console.log(`   ❌ ${tableName}: Erreur de vérification`);
      }
    }
    
    console.log('\n🎉 Configuration terminée!');
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Vérifiez les tables dans l\'interface Supabase');
    console.log('   2. Testez la connexion utilisateur');
    console.log('   3. Configurez les redirections Clerk');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
createTablesDirectly();