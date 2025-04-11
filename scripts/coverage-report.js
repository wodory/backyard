import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파라미터
const sortBy = process.argv[2] || 'LoC';

// 파일 읽기
const coveragePath = path.resolve(__dirname, '../coverage/coverage-summary.json');

if (!fs.existsSync(coveragePath)) {
    console.error('❌ coverage-summary.json 파일이 존재하지 않습니다.');
    process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));
delete summary.total;

const rows = Object.entries(summary).map(([filePath, metrics]) => {
    const folder = path.dirname(filePath);
    const file = path.basename(filePath);
    const lines = metrics.lines || {};
    const branches = metrics.branches || {};
    const functions = metrics.functions || {};

    return {
        '파일명': file,
        '폴더': folder,
        'LoC': lines.total || 0,
        '브랜치 커버리지': branches.pct || 0,
        '함수 커버리지': functions.pct || 0,
        '라인 커버리지': lines.pct || 0,
        'uncovered Line': (lines.total || 0) - (lines.covered || 0),
    };
});

// 정렬
const validSort = rows[0].hasOwnProperty(sortBy) ? sortBy : 'LoC';
rows.sort((a, b) => b[validSort] - a[validSort]);

// 출력
const printTable = (data) => {
    if (data.length === 0) {
        console.log('데이터가 없습니다.');
        return;
    }

    const headers = Object.keys(data[0]);
    const colWidths = headers.map(header =>
        Math.max(header.length, ...data.map(row => String(row[header] ?? '').length))
    );

    const formatRow = (rowOrHeader) =>
        headers.map((h, i) => String(rowOrHeader[h] ?? rowOrHeader[i] ?? '').padEnd(colWidths[i])).join(' | ');

    const separator = colWidths.map(w => '-'.repeat(w)).join('-|-');

    // ✅ 수정된 출력
    console.log(formatRow(headers));
    console.log(separator);
    data.forEach(row => console.log(formatRow(row)));
};


printTable(rows);
