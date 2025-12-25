#!/usr/bin/env node

// ENV Var Confessional - Where your environment variables come to confess their sins
// Because debugging ENV issues shouldn't feel like a medieval inquisition

const fs = require('fs');
const path = require('path');

// The Holy Trinity of environment files (choose your own adventure)
const envFiles = ['.env.local', '.env.staging', '.env.production', '.env'];

// Collect confessions from all environment files
const confessions = {};

envFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`\n📖 Reading ${file}'s confession...`);
        
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                const [key, value] = line.split('=').map(s => s.trim());
                if (key) {
                    if (!confessions[key]) {
                        confessions[key] = {};
                    }
                    // The value - to be judged by our merciful debugger
                    confessions[key][file] = value || '(empty confession)';
                }
            }
        });
    }
});

console.log('\n🔍 The Great Inquisition Begins...\n');
console.log('='.repeat(60));

// Let the judgment commence!
Object.keys(confessions).forEach(key => {
    const files = Object.keys(confessions[key]);
    
    if (files.length === 1) {
        console.log(`✅ ${key}: Only in ${files[0]} (Lonely but safe)`);
    } else {
        // Check for conflicting values (the real sinners)
        const values = files.map(f => confessions[key][f]);
        const uniqueValues = [...new Set(values)];
        
        if (uniqueValues.length === 1) {
            console.log(`✅ ${key}: Consistent across ${files.length} files (Praise the consistency!)`);
        } else {
            console.log(`❌ ${key}: CONFLICT DETECTED!`);
            files.forEach(file => {
                console.log(`   ${file}: ${confessions[key][file]}`);
            });
            console.log('   ^ This is why we can\'t have nice things');
        }
    }
    console.log('-'.repeat(60));
});

// Check for missing in current environment (the ghosts)
const currentEnv = process.env;
Object.keys(confessions).forEach(key => {
    if (!currentEnv[key]) {
        console.log(`👻 ${key}: Defined in config but missing in current environment`);
        console.log(`   Files: ${Object.keys(confessions[key]).join(', ')}`);
        console.log('-'.repeat(60));
    }
});

console.log('\n📊 Summary:');
console.log(`Total variables found: ${Object.keys(confessions).length}`);
console.log(`Environment files checked: ${envFiles.filter(f => fs.existsSync(f)).length}`);
console.log('\n🙏 May your environment variables be ever in harmony');
