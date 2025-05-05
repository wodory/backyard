-- public.settings 테이블의 제약 조건 및 트리거 이름 변경

-- 1. 기본 키 제약 조건 이름 변경
ALTER TABLE public.settings RENAME CONSTRAINT board_settings_pkey TO settings_pkey;

-- 2. 고유 제약 조건 이름 변경
ALTER TABLE public.settings RENAME CONSTRAINT board_settings_user_id_key TO settings_user_id_key;

-- 3. 외래 키 제약 조건 이름 변경
ALTER TABLE public.settings RENAME CONSTRAINT board_settings_user_id_fkey TO settings_user_id_fkey;

-- 4. 트리거 이름 변경
ALTER TRIGGER update_board_settings_modtime ON public.settings RENAME TO update_settings_modtime;

-- (참고: 위 트리거가 사용하는 함수 'update_modified_column()'의 이름은 변경하지 않았습니다.)