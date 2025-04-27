/**
 * 파일명: scripts/test-webhook.js
 * 목적: 사용자 동기화 웹훅 테스트
 * 
 * 사용법:
 * node scripts/test-webhook.js
 */

import fetch from 'node-fetch';

// 테스트 환경 설정
const WEBHOOK_URL = 'http://localhost:3000/api/auth/user-sync';
// 테스트에 사용할 실제 사용자 ID
const TEST_USER_ID = '47050492-4cde-4a79-a55b-44a8da1a4fc8';
const TEST_USER_EMAIL = 'wodory@gmail.com';

const TEST_CASES = [
    {
        name: '사용자 생성 테스트 (INSERT)',
        payload: {
            type: 'INSERT',
            record: {
                id: TEST_USER_ID,
                email: TEST_USER_EMAIL,
                raw_user_meta_data: {
                    name: process.env.GOOGLE_USER_NAME || '테스트 사용자',
                    picture: process.env.GOOGLE_USER_PICTURE
                }
            }
        }
    }
    // UPDATE와 DELETE 테스트는 주석 처리
    /*
    {
        name: '사용자 업데이트 테스트 (UPDATE)',
        payload: {
            type: 'UPDATE',
            record: {
                id: TEST_USER_ID,
                email: TEST_USER_EMAIL,
                raw_user_meta_data: {
                    name: '업데이트된 사용자',
                    picture: process.env.GOOGLE_USER_PICTURE
                }
            }
        }
    },
    {
        name: '사용자 삭제 테스트 (DELETE)',
        payload: {
            type: 'DELETE',
            record: {
                id: TEST_USER_ID
            }
        }
    }
    */
];

// 웹훅 테스트 함수
async function testWebhook() {
    console.log('사용자 동기화 웹훅 테스트 시작...\n');

    // 웹훅 상태 확인
    try {
        const statusResponse = await fetch(WEBHOOK_URL);
        const statusData = await statusResponse.json();
        console.log('웹훅 상태:', statusData);
        console.log('-'.repeat(50));
    } catch (error) {
        console.error('웹훅 상태 확인 실패:', error.message);
        console.error('서버가 실행 중인지 확인하세요.');
        process.exit(1);
    }

    // 각 테스트 케이스 실행
    for (const testCase of TEST_CASES) {
        try {
            console.log(`테스트: ${testCase.name}`);
            console.log('요청 페이로드:', JSON.stringify(testCase.payload, null, 2));

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 실제 환경에서는 인증 헤더 추가
                    // 'x-webhook-secret': process.env.WEBHOOK_SECRET
                },
                body: JSON.stringify(testCase.payload)
            });

            const responseData = await response.json();

            console.log('응답 상태:', response.status, response.statusText);
            console.log('응답 데이터:', responseData);
            console.log('-'.repeat(50));
        } catch (error) {
            console.error(`테스트 실패 (${testCase.name}):`, error.message);
            console.log('-'.repeat(50));
        }
    }

    console.log('\n모든 테스트 완료');
}

// 테스트 실행
testWebhook().catch(error => {
    console.error('테스트 중 오류 발생:', error);
}); 