import fs from 'fs';

const schemaPath = './src/lib/graphql/schema.ts';
const resolversPath = './src/lib/graphql/resolvers.ts';

const schema = fs.readFileSync(schemaPath, 'utf8');
const resolvers = fs.readFileSync(resolversPath, 'utf8');

function extractQueryFieldsFromSchema(schemaText) {
  const m = schemaText.match(/type\s+Query\s*\{([\s\S]*?)\}/m);
  if (!m) return [];
  const block = m[1];
  const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
  const fields = [];
  for (const line of lines) {
    if (line.startsWith('#')) continue;
    const f = line.match(/^([A-Za-z0-9_]+)/);
    if (f) fields.push(f[1]);
  }
  return fields;
}

function extractQueryFieldsFromResolvers(resText) {
  // Find the 'Query:' block and extract its contents using bracket matching to avoid nested '},' patterns
  const qIndex = resText.indexOf('Query:');
  if (qIndex === -1) return [];
  const openBraceIndex = resText.indexOf('{', qIndex);
  if (openBraceIndex === -1) return [];
  let depth = 0;
  let endIndex = -1;
  for (let i = openBraceIndex; i < resText.length; i++) {
    const ch = resText[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }
  if (endIndex === -1) return [];
  return resText.slice(openBraceIndex + 1, endIndex);
}

const schemaFields = extractQueryFieldsFromSchema(schema);
const resolverBlock = extractQueryFieldsFromResolvers(resolvers);
const resolverFields = [];
if (resolverBlock) {
  // Look for top-level field definitions, e.g. `userProfile: async (`
  const propertyRegex = /^\s*([A-Za-z_][A-Za-z0-9_]*):\s*(async|\()/gm;
  let match;
  while ((match = propertyRegex.exec(resolverBlock)) !== null) {
    resolverFields.push(match[1]);
  }
}

const schemaSet = new Set(schemaFields);
const resolverSet = new Set(resolverFields);

const inResolversButNotSchema = resolverFields.filter(x => !schemaSet.has(x));
const inSchemaButNotResolvers = schemaFields.filter(x => !resolverSet.has(x));

console.log('Schema Query fields:', schemaFields);
console.log('Resolvers Query fields:', resolverFields);
console.log('\nFields in resolvers but not in schema:', inResolversButNotSchema);
console.log('\nFields in schema but not in resolvers:', inSchemaButNotResolvers);

if (inResolversButNotSchema.length || inSchemaButNotResolvers.length) {
  process.exit(1);
}

console.log('GraphQL schema and resolvers Query sections are aligned.');
