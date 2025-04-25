/**
 * @rule   three-layer-Standard
 * @layer  service
 * @tag    @service-msw selectDb
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const base = path.resolve(__dirname, '../prisma');
// 항상 PostgreSQL 스키마 사용
fs.copyFileSync(path.join(base, 'schema.postgresql.prisma'), path.join(base, 'schema.prisma'));
console.log('✅ prisma/schema.prisma updated for PostgreSQL'); 