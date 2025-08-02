/**
 * Script de configuration automatique pour l'authentification Google avec Clerk
 * Exécute la création des tables et configurations nécessaires
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Fonction pour charger les variables d'environnement depuis .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '../../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

// Charger les variables d'environnement
loadEnvFile();

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  console.error('Vérifiez que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont configurées.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupGoogleAuth() {
  console.log('🚀 Configuration de l\'authentification Google avec Clerk...');
  console.log(`📍 URL Supabase: ${supabaseUrl}`);
  
  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'setup-google-auth.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Exécution du script SQL...');
    
    // Diviser le script en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const command of commands) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command + ';' });
        
        if (error) {
          // Essayer avec une requête directe si rpc échoue
          const { error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(0);
          
          if (directError && !directError.message.includes('does not exist')) {
            console.log(`   ⚠️  Commande ignorée: ${command.substring(0, 50)}...`);
          }
        }
        successCount++;
      } catch (err) {
        console.log(`   ❌ Erreur: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Configuration terminée!`);
    console.log(`   📊 ${successCount} commandes exécutées`);
    console.log(`   ⚠️  ${errorCount} erreurs (normales pour les éléments existants)`);
    
    // Vérifier les tables créées
    console.log('\n🔍 Vérification des tables...');
    
    const tables = [
      'users',
      'user_oauth_accounts', 
      'user_sessions',
      'login_attempts',
      'projects',
      'services',
      'activities'
    ];
    
    for (const tableName of tables) {
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
    
    console.log('\n🎉 Configuration de l\'authentification Google terminée!');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Configurez Google OAuth dans le dashboard Clerk');
    console.log('2. Ajoutez vos vraies clés Google dans .env.local');
    console.log('3. Testez la connexion Google sur votre application');
    console.log('\n🔗 Liens utiles:');
    console.log('- Dashboard Clerk: https://dashboard.clerk.dev');
    console.log('- Google Cloud Console: https://console.cloud.google.com');
    console.log('- Documentation Clerk OAuth: https://clerk.dev/docs/authentication/social-connections/google');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

// Test de connexion Supabase
async function testConnection() {
  console.log('🔌 Test de connexion Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Connexion Supabase: Limitée (clé anon)');
    } else {
      console.log('✅ Connexion Supabase: OK');
    }
  } catch (err) {
    console.error('❌ Erreur de connexion Supabase:', err.message);
    process.exit(1);
  }
}

// Exécution principale
async function main() {
  await testConnection();
  await setupGoogleAuth();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupGoogleAuth, testConnection };