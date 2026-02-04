/**
 * 배포 전 체크 스크립트
 * 
 * 사용법:
 * node scripts/check-deployment.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('🔍 배포 전 체크 시작...');
console.log('========================================\n');

let hasErrors = false;
let hasWarnings = false;

// 필수 환경변수 체크
function checkEnvFile() {
  console.log('📋 환경변수 체크...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local 파일이 없습니다!');
    console.log('   .env.example을 참고하여 .env.local을 생성하세요.\n');
    hasErrors = true;
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
    'VAPID_SUBJECT'
  ];
  
  const missingVars = [];
  const placeholderVars = [];
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    } else if (
      envContent.includes(`${varName}=your-`) ||
      envContent.includes(`${varName}=YOUR_`)
    ) {
      placeholderVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('❌ 필수 환경변수가 없습니다:');
    missingVars.forEach(v => console.log(`   - ${v}`));
    console.log('');
    hasErrors = true;
  }
  
  if (placeholderVars.length > 0) {
    console.log('⚠️  다음 환경변수가 아직 설정되지 않았습니다:');
    placeholderVars.forEach(v => console.log(`   - ${v}`));
    console.log('');
    hasWarnings = true;
  }
  
  if (missingVars.length === 0 && placeholderVars.length === 0) {
    console.log('✅ 환경변수 체크 완료\n');
  }
}

// 필수 파일 체크
function checkRequiredFiles() {
  console.log('📁 필수 파일 체크...');
  
  const requiredFiles = [
    'package.json',
    'next.config.ts',
    'tsconfig.json',
    'tailwind.config.ts',
    'public/sw.js',
    'public/manifest.json',
    'app/layout.tsx',
    'app/page.tsx',
    'lib/auth.ts'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log('❌ 필수 파일이 없습니다:');
    missingFiles.forEach(f => console.log(`   - ${f}`));
    console.log('');
    hasErrors = true;
  } else {
    console.log('✅ 필수 파일 체크 완료\n');
  }
}

// .gitignore 체크
function checkGitignore() {
  console.log('🔒 .gitignore 체크...');
  
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    console.log('⚠️  .gitignore 파일이 없습니다!\n');
    hasWarnings = true;
    return;
  }
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredPatterns = [
    '.env',
    '.env.local',
    'node_modules',
    '.next'
  ];
  
  const missingPatterns = [];
  
  requiredPatterns.forEach(pattern => {
    if (!gitignoreContent.includes(pattern)) {
      missingPatterns.push(pattern);
    }
  });
  
  if (missingPatterns.length > 0) {
    console.log('⚠️  .gitignore에 다음 패턴이 없습니다:');
    missingPatterns.forEach(p => console.log(`   - ${p}`));
    console.log('');
    hasWarnings = true;
  } else {
    console.log('✅ .gitignore 체크 완료\n');
  }
}

// 빌드 가능 여부 체크
function checkBuild() {
  console.log('🔨 빌드 테스트...');
  console.log('   (npm run build를 실행하여 확인하세요)\n');
}

// 메인 실행
function main() {
  checkEnvFile();
  checkRequiredFiles();
  checkGitignore();
  checkBuild();
  
  console.log('========================================');
  
  if (hasErrors) {
    console.log('❌ 배포 전 수정이 필요한 문제가 있습니다.');
    console.log('   위의 에러를 해결한 후 다시 확인하세요.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  경고가 있지만 배포 가능합니다.');
    console.log('   위의 경고를 확인하고 필요하면 수정하세요.\n');
  } else {
    console.log('✅ 모든 체크 완료! 배포 준비가 되었습니다.');
    console.log('\n다음 단계:');
    console.log('1. npm run build로 빌드 테스트');
    console.log('2. vercel 명령어로 배포\n');
  }
  
  console.log('========================================\n');
}

main();
