/**
 * 파일명: update-modified-dates.js
 * 목적: 파일의 수정일 주석을 정리하고 git 이력과 일치시키는 스크립트
 * 역할: 1. 여러 개의 수정일이 있다면 가장 최근 것만 유지, 2. git log 기반으로 수정일 업데이트
 * 작성일: 2024-05-09
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const execPromise = promisify(exec);

const rootDir = process.cwd(); // 현재 디렉토리(프로젝트 루트)

// 대상 파일 확장자
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md'];

// 제외할 디렉토리
const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'html'];

// git log에서 파일의 마지막 수정 날짜 가져오기
async function getLastModifiedDateFromGit(filePath) {
    try {
        const relativeFilePath = path.relative(rootDir, filePath);
        const { stdout } = await execPromise(`git log -1 --format="%ad" --date=short -- "${relativeFilePath}"`);
        return stdout.trim(); // YYYY-MM-DD 형식
    } catch (error) {
        console.error(`Git log error for ${filePath}:`, error.message);
        return null;
    }
}

// 주어진 파일에서 수정일 주석 정리
async function processFile(filePath) {
    try {
        const content = await readFile(filePath, 'utf8');

        // 수정일 주석 여러 개 있는지 확인
        const modificationDateRegex = /\* 수정일: (\d{4}-\d{2}-\d{2}).*$/gm;
        const matches = [...content.matchAll(modificationDateRegex)];

        // 파일에 수정일 주석이 없으면 git에서 최종 수정일 가져오기
        let lastDate = await getLastModifiedDateFromGit(filePath);

        if (!lastDate) {
            console.log(`Git 히스토리를 찾을 수 없음: ${filePath}`);
            return;
        }

        let updatedContent = content;

        // 수정일 주석이 없고, 작성일 주석이 있는 경우에만 추가
        if (matches.length === 0) {
            const creationDateRegex = /\* 작성일: (\d{4}-\d{2}-\d{2})/;
            const creationMatch = content.match(creationDateRegex);

            if (creationMatch) {
                const creationDate = creationMatch[1];

                // 작성일과 최종 수정일이 다른 경우에만 수정일 추가
                if (creationDate !== lastDate) {
                    updatedContent = content.replace(
                        creationDateRegex,
                        `* 작성일: ${creationDate}\n * 수정일: ${lastDate}`
                    );
                    await writeFile(filePath, updatedContent, 'utf8');
                    console.log(`수정일 추가됨: ${filePath} (${lastDate})`);
                }
            }
            return;
        }

        // 수정일 주석이 있으면 가장 최근 수정일만 남기고 나머지 삭제
        if (matches.length > 1) {
            // 주석 내용 포함한 전체 수정일 라인들
            const modificationLines = matches.map(match => match[0]);

            // 첫 번째 수정일 주석만 남기고 나머지는 제거
            for (let i = 1; i < modificationLines.length; i++) {
                updatedContent = updatedContent.replace(`\n * ${modificationLines[i]}`, '');
            }
        }

        // git에서 가져온 최종 수정일로 첫 번째 수정일 업데이트
        const firstModificationLine = matches[0][0];

        // 수정일 설명 부분을 추출 (있는 경우)
        let description = '';
        if (firstModificationLine.includes(' - ')) {
            description = ` - ${firstModificationLine.split(' - ')[1].trim()}`;
        } else {
            // ' - ' 구분자가 없지만 설명이 있는 경우
            const dateMatch = firstModificationLine.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatch) {
                const restOfLine = firstModificationLine.substring(dateMatch.index + dateMatch[0].length).trim();
                if (restOfLine) {
                    description = ` - ${restOfLine}`;
                }
            }
        }

        // 업데이트된 수정일 라인 생성
        const updatedLine = `* 수정일: ${lastDate}${description}`;

        updatedContent = updatedContent.replace(firstModificationLine, updatedLine);

        if (content !== updatedContent) {
            await writeFile(filePath, updatedContent, 'utf8');
            console.log(`수정일 업데이트: ${filePath} (${lastDate}${description ? ' 설명 유지됨' : ''})`);
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

// 디렉토리 순회하면서 파일 처리
async function processDirectory(dir) {
    try {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (!excludeDirs.includes(entry.name)) {
                    await processDirectory(fullPath);
                }
                continue;
            }

            const ext = path.extname(entry.name);
            if (fileExtensions.includes(ext)) {
                await processFile(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error processing directory ${dir}:`, error.message);
    }
}

// 스크립트 실행
(async () => {
    console.log('파일 수정일 업데이트 시작...');
    try {
        await processDirectory(rootDir);
        console.log('완료: 모든 파일의 수정일 주석이 정리되었습니다.');
    } catch (error) {
        console.error('오류 발생:', error);
    }
})(); 