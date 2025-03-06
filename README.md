This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

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

## 문제 해결

### 데이터베이스 연결 문제

데이터베이스 연결에 문제가 있는 경우 다음 사항을 확인하세요:

1. **PostgreSQL 서버가 실행 중인지 확인**
   ```bash
   # macOS
   brew services list | grep postgres
   
   # Linux
   systemctl status postgresql
   ```

2. **데이터베이스 존재 확인**
   ```bash
   psql -l
   ```

3. **데이터베이스 사용자 권한 확인**
   ```bash
   psql -c "SELECT current_user;"
   psql -c "SELECT current_database();"
   ```

4. **마이그레이션 초기화 (문제가 지속될 경우)**
   ```bash
   # 기존 마이그레이션 삭제
   rm -rf prisma/migrations
   
   # 새로운 마이그레이션 생성
   npx prisma migrate dev --name init
   ```

5. **Prisma 클라이언트 재생성**
   ```bash
   npx prisma generate
   ```

### 다른 데이터베이스 사용하기 (개발 환경용)

개발 환경에서는 SQLite를 사용할 수도 있습니다. 이를 위해 다음과 같이 설정하세요:

1. `.env.development` 파일을 생성하고 다음 내용을 추가:
   ```
   DATABASE_URL="file:./dev.db"
   ```

2. Prisma 스키마를 수정하여 데이터베이스 공급자를 SQLite로 변경:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. 마이그레이션 초기화 및 실행:
   ```bash
   rm -rf prisma/migrations
   npx prisma migrate dev --name init
   ```

**참고**: SQLite는 일부 PostgreSQL 기능을 지원하지 않을 수 있으므로 프로덕션 환경에서는 PostgreSQL을 사용하세요.
