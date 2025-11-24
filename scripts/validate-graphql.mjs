import fs from 'fs';

const schemaPath = './src/lib/graphql/schema.ts';
const resolversPath = './src/lib/graphql/resolvers.ts';

const schema = fs.readFileSync(schemaPath, 'utf8');
const resolvers = fs.readFileSync(resolversPath, 'utf8');

function extractQueryFieldsFromSchema(schemaText) {
  const m = schemaText.match(/type\s+Query\s*\{([\s\S]*?)\}/);
  if (!m) return [];
  const block = m[1];
  const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
  const fields = [];
  for (const line of lines) {
    // skip comments
    if (line.startsWith('#')) continue;
    // match `name(` or `name:` patterns
    const f = line.match(/^([A-Za-z0-9_]+)/);
    if (f) fields.push(f[1]);
  }
  return fields;
}

function extractQueryFieldsFromResolvers(resText) {
  const m = resText.match(/Query:\s*\{([\s\S]*?)\n\s*},/);
  if (!m) {
    // maybe closing of Query at 