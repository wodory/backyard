/**
 * 파일명: scripts/update-file-dates.js
 * 목적: 코드베이스 파일의 작성일 헤더를 수정
 * 역할: 2024년 또는 이상한 날짜가 있는 파일의 헤더를 파일 생성 날짜로 업데이트
 * 작성일: 2023-05-26
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// src 디렉토리 경로
const srcDir = path.join(__dirname, '../src');

// 파일 생성 날짜를 가져오는 함수 (git log를 사용하여 첫 커밋 날짜를 가져옴)
async function getFileCreationDate(filePath) {
    try {
        // 상대 경로로 변환
        const relativeFilePath = path.relative(path.join(__dirname, '..'), filePath);

        // git log를 사용하여 파일의 첫 커밋 날짜 가져오기
        const { stdout } = await execPromise(`git log --follow --format="%ad" --date=short -- "${relativeFilePath}" | tail -1`);

        // 결과가 있으면 반환, 없으면 현재 날짜 반환
        const gitDate = stdout.trim();
        if (gitDate) {
            return gitDate;
        }

        // git 정보가 없는 경우 파일 생성일 가져오기
        const stats = fs.statSync(filePath);
        const date = new Date(stats.birthtime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error(`Error getting creation date for ${filePath}:`, error);

        // 오류 발생 시 현재 날짜 반환
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// 날짜 형식 검증 및 2024년 날짜 확인
function isDateInvalid(dateStr) {
    // 날짜 형식 검증 (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateStr)) {
        return true;
    }

    // 2024년 날짜 확인
    if (dateStr.startsWith('2024-')) {
        return true;
    }

    // 날짜 유효성 검사
    const [year, month, day] = dateStr.split('-').map(Number);

    // 월 범위 검사 (1-12)
    if (month < 1 || month > 12) {
        return true;
    }

    // 일 범위 검사 (1-31, 월별 최대 일수 고려)
    const maxDays = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDays) {
        return true;
    }

    // 미래 날짜 검사
    const currentDate = new Date();
    const fileDate = new Date(year, month - 1, day);
    if (fileDate > currentDate) {
        return true;
    }

    return false;
}

// 파일 헤더 수정 함수
async function updateFileHeader(filePath) {
    try {
        // 파일 읽기
        const content = fs.readFileSync(filePath, 'utf8');

        // 작성일 패턴 찾기
        const datePattern = /작성일:\s*(\d{4}-\d{2}-\d{2}|[^\n]*)/;
        const match = content.match(datePattern);

        if (match) {
            const currentDate = match[1];

            // 날짜가 2024년이거나 형식이 잘못된 경우 업데이트
            if (isDateInvalid(currentDate)) {
                // 파일 생성 날짜 가져오기
                const creationDate = await getFileCreationDate(filePath);

                // 헤더 업데이트
                const updatedContent = content.replace(datePattern, `작성일: ${creationDate}`);

                // 파일 쓰기
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`✅ 업데이트됨: ${filePath} (${currentDate} -> ${creationDate})`);
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error(`Error updating file ${filePath}:`, error);
        return false;
    }
}

// 파일 목록 재귀적으로 가져오기
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // node_modules, .git 등 제외
            if (!file.startsWith('.') && file !== 'node_modules') {
                getAllFiles(filePath, fileList);
            }
        } else {
            // .ts, .tsx 파일만 추가
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    }

    return fileList;
}

// 메인 함수
async function main() {
    try {
        console.log('🔍 src 디렉토리의 파일 검색 중...');

        // 모든 .ts 및 .tsx 파일 가져오기
        const allFiles = getAllFiles(srcDir);
        console.log(`📁 총 ${allFiles.length}개의 파일 발견`);

        let updatedCount = 0;

        // 각 파일 처리
        for (const filePath of allFiles) {
            const updated = await updateFileHeader(filePath);
            if (updated) {
                updatedCount++;
            }
        }

        console.log(`\n✨ 작업 완료: ${updatedCount}개 파일 업데이트됨`);
    } catch (error) {
        console.error('Error running script:', error);
    }
}

// 스크립트 실행
main(); 