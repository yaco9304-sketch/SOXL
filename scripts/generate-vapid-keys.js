/**
 * VAPID 키 생성 스크립트
 * 
 * 사용법:
 * node scripts/generate-vapid-keys.js
 * 
 * 생성된 키를 .env.local에 추가하세요:
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY=생성된_공개키
 * VAPID_PRIVATE_KEY=생성된_비밀키
 * VAPID_SUBJECT=mailto:your-email@example.com
 */

const webpush = require('web-push');

// VAPID 키 생성
const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n========================================');
console.log('VAPID 키가 생성되었습니다!');
console.log('========================================\n');

console.log('다음 내용을 .env.local 파일에 추가하세요:\n');

console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);

console.log('\n========================================');
console.log('⚠️ 주의사항:');
console.log('1. 비밀키(VAPID_PRIVATE_KEY)는 절대 공개하지 마세요!');
console.log('2. VAPID_SUBJECT는 실제 이메일 주소로 변경하세요.');
console.log('3. 환경변수 추가 후 서버를 재시작하세요.');
console.log('========================================\n');
