# Backyard

마인드맵 스타일의 카드 보드 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: shadcn/ui
- **데이터베이스**: 
  - 개발: SQLite
  - 프로덕션: Supabase (PostgreSQL)
- **인증**: Supabase Auth (Google OAuth)
- **배포**: Vercel

## 프로젝트 설정 방법

### 1. 저장소 클론
```bash
git clone https://github.com/wodory/backyard.git
cd backyard
```

### 2. 의존성 설치
```bash
yarn install
```

### 3. 환경 변수 설정

세 가지 환경 변수 파일을 설정해야 합니다:

```bash
# 환경 변수 템플릿 파일 복사
cp .env.example .env
cp .env.development.example .env.development
cp .env.production.example .env.production
```

각 파일의 용도와 설정 방법:

#### `.env` (공통 설정)
- Supabase 프로젝트의 URL과 anon key 설정
- Supabase 대시보드 > Project Settings > API에서 확인 가능
```bash
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

#### `.env.development` (개발 환경)
- 로컬 개발 환경에서 사용
- SQLite 데이터베이스 사용
- OAuth 리다이렉션은 localhost:3000으로 설정
```bash
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_OAUTH_REDIRECT_URL="http://localhost:3000"
```

#### `.env.production` (프로덕션 환경)
- Vercel 배포 환경에서 사용
- Supabase PostgreSQL 데이터베이스 사용
- OAuth 리다이렉션은 Vercel 배포 URL 사용
```bash
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres:password@project-id.supabase.co:6543/postgres"
DIRECT_URL="postgresql://postgres:password@project-id.supabase.co:5432/postgres"
NEXT_PUBLIC_OAUTH_REDIRECT_URL="https://your-project-name.vercel.app"
```

### 4. 데이터베이스 설정

개발 환경에서는 SQLite를 사용합니다. 다음 명령어로 데이터베이스를 설정하세요:

```bash
# 개발 환경 DB 설정
yarn db:setup:dev

# Prisma 클라이언트 생성
yarn prisma:generate

# (선택적) 초기 데이터 생성
yarn prisma:seed
```

### 5. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. OAuth 동의 화면 설정
4. 사용자 인증 정보 > OAuth 2.0 클라이언트 ID 생성
5. 승인된 리다이렉션 URI 설정:
   - 개발: `http://localhost:3000/auth/callback`
   - 프로덕션: `https://your-project-name.vercel.app/auth/callback`

### 6. Supabase 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. Authentication > Providers > Google 설정
3. 승인된 리다이렉션 URI 추가:
   - 개발: `http://localhost:3000/auth/callback`
   - 프로덕션: `https://your-project-name.vercel.app/auth/callback`

### 7. 개발 서버 실행

```bash
yarn dev
```

### 8. 프로덕션 배포 (Vercel)

1. [Vercel](https://vercel.com)에서 GitHub 저장소 import
2. 환경 변수 설정:
   - `.env.production` 파일의 내용을 Vercel 프로젝트 설정 > Environment Variables에 추가
3. 배포 실행:
   ```bash
   npx vercel deploy --prod
   ```

## 주요 기능

- 카드 생성 및 관리
- 카드 간 연결 관계 설정
- 마인드맵 스타일 레이아웃
- Google 계정으로 로그인
- 실시간 자동 저장

## 개발 가이드

자세한 개발 가이드는 [/.note](/.note) 디렉토리를 참조하세요.

## 데이터베이스 스키마 관리

프로젝트는 두 가지 데이터베이스 환경을 지원합니다:

1. **개발 환경 (SQLite)**
   - `prisma/schema.sqlite.prisma`
   - 로컬 개발용

2. **프로덕션 환경 (PostgreSQL)**
   - `prisma/schema.postgresql.prisma`
   - Supabase 배포용

스키마 동기화가 필요한 경우:
```bash
yarn schema:sync
```

## 문제 해결

### 데이터베이스 연결 문제

1. **개발 환경 (SQLite)**
   ```bash
   # SQLite 데이터베이스 초기화
   rm -f prisma/dev.db
   yarn db:setup:dev
   ```

2. **프로덕션 환경 (PostgreSQL)**
   - Supabase 대시보드에서 데이터베이스 연결 정보 확인
   - `DATABASE_URL`과 `DIRECT_URL` 환경 변수 확인

### 환경 변수 문제

1. 각 환경 변수 파일이 올바르게 설정되었는지 확인:
   - `.env`
   - `.env.development`
   - `.env.production`

2. Vercel 배포 시 환경 변수가 올바르게 설정되었는지 확인

### OAuth 인증 문제

1. Google Cloud Console 설정 확인:
   - 승인된 리디렉션 URI
   - OAuth 동의 화면 설정

2. Supabase 설정 확인:
   - Google OAuth Provider 설정
   - 승인된 콜백 URL

## 라이선스

MIT License

## 데이터베이스 설정

이 프로젝트는 PostgreSQL 데이터베이스를 사용합니다. 프로젝트를 실행하기 전에 다음 단계를 따라 데이터베이스를 설정해 주세요:

1. PostgreSQL이 설치되어 있고 실행 중인지 확인하세요.
   ```bash
   # macOS (Homebrew)
   brew install postgresql@14
   brew services start postgresql@14
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Windows
   # https://www.postgresql.org/download/windows/에서 설치 프로그램을 다운로드하세요
   ```

2. 본인의 사용자 계정으로 PostgreSQL에 접속할 수 있도록 설정합니다:
   ```bash
   # macOS의 경우, 기본적으로 시스템 사용자 이름으로 접속 가능합니다
   # Linux의 경우 다음을 실행하세요:
   sudo -u postgres createuser --superuser $USER
   
   # 패스워드 설정이 필요한 경우:
   sudo -u postgres psql
   postgres=# \password [username]
   ```

3. `backyard` 데이터베이스를 생성합니다:
   ```bash
   createdb backyard
   
   # 또는 다음과 같이 실행:
   psql -c "CREATE DATABASE backyard"
   ```

4. `.env.example` 파일을 `.env` 파일로 복사하고, 본인의 PostgreSQL 사용자 이름과 비밀번호로 업데이트합니다:
   ```bash
   cp .env.example .env
   
   # .env 파일 내용 예시:
   # macOS/Linux 사용자 인증이 없는 경우: 
   # DATABASE_URL="postgresql://[사용자명]@localhost:5432/backyard?schema=public"
   
   # 패스워드가 있는 경우:
   # DATABASE_URL="postgresql://[사용자명]:[패스워드]@localhost:5432/backyard?schema=public"
   ```

5. Prisma 마이그레이션을 실행하여 데이터베이스 스키마를 생성합니다:
   ```bash
   npx prisma migrate dev --name init
   ```

6. (선택 사항) 테스트 사용자를 생성합니다:
   ```bash
   node scripts/create-user.js
   
   # 또는 더 많은 기본 데이터를 포함한 seed 스크립트 실행:
   npm run prisma:seed
   ```

7. 데이터베이스를 다른 컴퓨터로 이전해야 하는 경우:
   ```bash
   # 데이터베이스 백업
   pg_dump backyard > backyard_backup.sql
   
   # 다른 컴퓨터에서 복원
   psql -d backyard -f backyard_backup.sql
   ```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 개발 노트

### 사용자 인증 시스템

현재 애플리케이션은 개발 및 테스트 목적으로 하드코딩된 사용자 ID를 사용합니다. 이 ID는 `src/lib/constants.ts` 파일의 `DEFAULT_USER_ID` 상수에 저장되어 있습니다.

#### 인증 시스템 구현 계획

1. **로그인 및 회원가입 구현**
   - Next.js 인증 시스템 구현 (NextAuth.js 또는 Supabase Auth 사용)
   - 이메일/비밀번호 로그인
   - 소셜 로그인 (Google, GitHub 등)

2. **사용자 세션 관리**
   - 로그인 상태 유지
   - 세션 만료 처리
   - 권한 관리

3. **보안 강화**
   - HTTPS 사용
   - CSRF 보호
   - Rate limiting

이 인증 시스템이 구현되면 하드코딩된 사용자 ID 대신 현재 로그인한 사용자의 ID를 사용하게 됩니다.
