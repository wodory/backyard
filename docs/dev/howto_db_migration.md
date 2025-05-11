## 매뉴얼: Prisma 스키마 변경 후 Supabase DB 마이그레이션 절차

**목표:** 로컬 `prisma/schema.prisma` 파일의 변경 사항(예: `Edge` 모델 수정)을 실제 Supabase 데이터베이스 스키마에 안전하고 체계적으로 적용합니다.

**요약:** 로컬 prisma 스키마 변경 > DB 마이그레이션 과정은 아래와 같다. 
```
#supabase link
npx supabase link 

#수정한 스키마로 prisma 클라이언트 생성
yarn prisma generate

#supabase migration 폴더 정리 

#수정한 스키마의 마이그레이션 SQL 생성

## Production
npx prisma migrate diff \
          --from-url "postgresql://postgres.btdartpjjrkwgfejqnsn:iCLE4RNOaMQ4RJyZ@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres" \
          --to-schema-datamodel prisma/schema.prisma \
          --script > supabase/migrations/20250511216000_update_schema_to_prod.sql

#Dev
npx prisma migrate diff \
          --from-url "postgresql://postgres.rsycayyhmgmbdmmtzewz:SH1HpNpMW4ZSL21d@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres" \
          --to-schema-datamodel prisma/schema.prisma \
          --script > supabase/migrations/20250511216000_update_schema_to_prod.sql

#supabase가 링크한 DB 마이그레이션
npx supabase migration up --linked
```

**전제 조건:**

*   `prisma/schema.prisma` 파일이 **수정 및 저장**되었습니다.
*   Supabase CLI가 설치되어 있고, 현재 프로젝트에 `npx supabase link --project-ref <your-project-id>` 명령어로 연결되어 있습니다.
*   Supabase 프로젝트의 **데이터베이스 직접 연결 URI (비밀번호 포함)**를 알고 있습니다. (대시보드 > Project Settings > Database > Connection string > URI)

**단계:**

1.  **Prisma Client 재생성 (스키마 변경 반영):**
    *   **목적:** 수정된 `schema.prisma` 파일을 기반으로 로컬의 `@prisma/client` 라이브러리 타입과 기능을 업데이트합니다. 이는 다음 단계인 `migrate diff` 실행 전후에 해도 괜찮지만, 스키마 수정 직후에 하는 것이 좋습니다.
    *   **명령어:** 프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다.
        ```bash
        yarn prisma generate
        # 또는 npm run prisma generate / npx prisma generate
        ```
    *   **확인:** 명령어 실행 후 오류가 없는지 확인합니다.

2.  **SQL 마이그레이션 스크립트 생성 (`prisma migrate diff`):**
    *   **목적:** 현재 Supabase 데이터베이스 스키마와 로컬의 수정된 `schema.prisma` 파일 간의 차이점을 분석하여, 그 차이를 반영하는 SQL 스크립트 파일을 생성합니다.
    *   **명령어:** 터미널에서 다음 명령어를 실행합니다. **dev와 production 환경에 따라 DIRECT_URL로 업데이트.**
        ```bash
        npx prisma migrate diff \
          --from-url "postgresql://postgres.rsycayyhmgmbdmmtzewz:SH1HpNpMW4ZSL21d@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres" \
          --to-schema-datamodel prisma/schema.prisma \
          --script > supabase/migrations/20250501113700_add_node_to_edge.sql
        ```
        *   `<Your-Supabase-DB-Connection-URI>`: Supabase 대시보드에서 복사한 전체 연결 문자열 (비밀번호 포함). **이 문자열은 Git에 커밋하지 않도록 매우 주의하세요!**
        *   `<YYYYMMDDHHMMSS>`: 마이그레이션 파일이 생성되는 현재 시각 (예: `20230501103000`). 보통 자동으로 이 형식의 파일명이 추천됩니다.
        *   `<migration_description>`: 변경 내용을 설명하는 간결한 이름 (예: `update_edge_relation_to_cardnode`).
    *   **확인:**
        *   명령어 실행 후 오류가 없는지 확인합니다.
        *   `supabase/migrations/` 디렉토리에 지정한 이름으로 `.sql` 파일이 생성되었는지 확인합니다.

3.  **생성된 SQL 스크립트 검토 (선택적이지만 권장):**
    *   **목적:** 자동 생성된 SQL 스크립트가 의도한 대로 데이터베이스 스키마를 변경하는지 확인합니다. (예: `ALTER TABLE "edges" DROP CONSTRAINT ...`, `ALTER TABLE "edges" ADD CONSTRAINT ... FOREIGN KEY ("sourceNodeId") REFERENCES "public"."CardNode"(id)` 등)
    *   **방법:** 방금 생성된 `.sql` 파일을 텍스트 편집기로 열어 내용을 검토합니다.
    *   **주의:** 의도치 않은 테이블 삭제나 데이터 손실을 유발할 수 있는 구문이 있는지 주의 깊게 확인합니다.

4.  **Supabase 마이그레이션 실행 (`supabase migration up`):**
    *   **목적:** `supabase/migrations` 폴더 안에 있는 아직 적용되지 않은 **새로운** SQL 마이그레이션 파일들을 찾아 연결된 원격 Supabase 데이터베이스에 순서대로 적용합니다.
    *   **명령어:**
        ```bash
        npx supabase migration up --linked
        ```
    *   **확인:**
        *   터미널 출력에서 `Applying migration <파일명>...` 메시지와 함께 오류 없이 완료되는지 확인합니다. ("Local database is up to date." 메시지는 성공을 의미합니다.)
        *   Supabase 대시보드의 `Database` > `Migrations` 메뉴에서 방금 실행한 마이그레이션이 목록에 성공적으로 추가되었는지 확인합니다.
        *   Supabase 대시보드의 `Table Editor`에서 `edges` 테이블의 구조 (특히 `sourceNodeId`, `targetNodeId` 컬럼 및 외래 키 제약 조건)가 의도대로 변경되었는지 확인합니다.

5.  **변경 사항 버전 관리 (Git):**
    *   **목적:** 스키마 변경 이력과 마이그레이션 스크립트를 관리합니다.
    *   **Action:** 다음 파일들을 Git에 커밋합니다.
        *   `prisma/schema.prisma` (수정된 파일)
        *   `supabase/migrations/<YYYYMMDDHHMMSS>_<migration_description>.sql` (새로 생성된 SQL 파일)
    *   **주의:** `.env` 파일이나 데이터베이스 연결 문자열이 포함된 파일은 커밋하지 않도록 `.gitignore` 설정을 확인합니다.

**중요 참고 사항:**

*   **백업:** 중요한 스키마 변경 전에는 항상 Supabase 대시보드에서 데이터베이스 백업을 수행하는 것이 안전합니다.
*   **오류 발생 시:** `migrate diff` 또는 `migration up` 단계에서 오류가 발생하면, 오류 메시지를 주의 깊게 읽고 원인을 파악해야 합니다. 스키마 정의 오류, 데이터베이스 연결 문제, 기존 데이터와의 충돌 등 다양한 원인이 있을 수 있습니다. 문제가 해결되기 전까지 다음 단계를 진행하지 마세요.
*   **RLS 정책:** 이 매뉴얼은 테이블 구조 변경에 대한 것입니다. RLS 정책 변경은 별도의 SQL 스크립트를 작성하여 Supabase SQL Editor나 마이그레이션 파일을 통해 적용해야 합니다.