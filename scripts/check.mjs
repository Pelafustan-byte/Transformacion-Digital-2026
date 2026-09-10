import fs from 'node:fs';
const content = JSON.parse(fs.readFileSync(new URL('../seed/content.seed.json', import.meta.url)));
const required=['site','videos','materials','capsules','notes','timeline','resources','news','libraryCollections'];
for(const key of required) if(!(key in content)) throw new Error(`Falta ${key}`);
if(content.resources.length < 30) throw new Error('Se esperaban 30 recursos');
console.log('OK · esquema y contenido base válidos');
