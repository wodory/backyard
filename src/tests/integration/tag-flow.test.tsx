/**
 * 파일명: src/tests/integration/tag-flow.test.tsx
 * 목적: 태그 관련 기능 통합 테스트
 * 역할: 태그 생성/삭제 및 태그별 필터링 검증
 * 작성일: 2024-05-01
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'

// MSW 서버 가져오기
import { server } from '@/tests/msw/server'

// 모의 렌더 함수
import { renderWithProviders } from '../test-utils'

// 태그 관련 컴포넌트
import TagList from '@/components/tags/TagList'
import TagForm from '@/components/tags/TagForm'
import TagFilter from '@/components/tags/TagFilter'

// 모의 태그 데이터
const mockTags = [
    { id: 'tag-1', name: '중요' },
    { id: 'tag-2', name: '작업' },
    { id: 'tag-3', name: '아이디어' }
]

// Zustand 스토어와 훅 모킹
vi.mock('@/hooks/useTags', () => ({
    useTags: () => ({
        data: mockTags,
        isLoading: false,
        error: null
    })
}))

vi.mock('@/hooks/useCreateTag', () => {
    const mockMutate = vi.fn((name) => {
        return Promise.resolve({
            id: `new-tag-${Date.now()}`,
            name
        })
    })

    return {
        useCreateTag: () => ({
            mutate: mockMutate,
            isLoading: false,
            error: null,
            isSuccess: true
        })
    }
})

vi.mock('@/hooks/useDeleteTag', () => {
    const mockMutate = vi.fn((id) => Promise.resolve())

    return {
        useDeleteTag: () => ({
            mutate: mockMutate,
            isLoading: false,
            error: null,
            isSuccess: true
        })
    }
})

// Next.js 훅 모킹
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn()
    }),
    useSearchParams: () => ({
        get: vi.fn((param) => param === 'tag' ? '작업' : null),
        toString: vi.fn(() => '')
    }),
    usePathname: () => '/'
}))

describe('태그 관리 통합 테스트', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // 추가 MSW 핸들러 설정
        server.use(
            // 태그 목록 조회
            http.get('/api/tags', () => {
                return HttpResponse.json(mockTags)
            }),

            // 태그 생성
            http.post('/api/tags', async ({ request }) => {
                const data = await request.json() as { name: string }
                if (!data.name) {
                    return HttpResponse.json({ error: '태그 이름은 필수입니다.' }, { status: 400 })
                }

                return HttpResponse.json(
                    { id: `new-tag-${Date.now()}`, name: data.name },
                    { status: 201 }
                )
            }),

            // 태그 삭제
            http.delete('/api/tags/:id', ({ params }) => {
                const { id } = params
                if (id === 'error-tag') {
                    return HttpResponse.json({ error: '태그 삭제 실패' }, { status: 400 })
                }

                return new HttpResponse(null, { status: 200 })
            })
        )
    })

    it('태그 목록 조회 및 렌더링을 테스트합니다', async () => {
        renderWithProviders(<TagList />)

        // 태그 항목들이 표시되는지 확인
        await waitFor(() => {
            expect(screen.getByText('중요')).toBeInTheDocument()
            expect(screen.getByText('작업')).toBeInTheDocument()
            expect(screen.getByText('아이디어')).toBeInTheDocument()
        })

        // 3개의 태그가 표시되는지 확인
        const tagItems = screen.getAllByRole('listitem')
        expect(tagItems.length).toBe(3)
    })

    it('새 태그 생성 프로세스를 테스트합니다', async () => {
        const user = userEvent.setup()

        const { getByLabelText, getByText } = renderWithProviders(<TagForm />)

        // 태그명 입력
        const tagNameInput = getByLabelText(/태그명|태그 이름/i)
        await user.type(tagNameInput, '새 태그')

        // 추가 버튼 클릭
        const addButton = getByText(/추가|생성/i)
        await user.click(addButton)

        // 태그 생성 API 호출 성공 확인
        await waitFor(() => {
            const { useCreateTag } = require('@/hooks/useCreateTag')
            const mockUseCreateTag = vi.mocked(useCreateTag)
            expect(mockUseCreateTag().mutate).toHaveBeenCalledWith('새 태그')
        })

        // 입력 필드가 초기화되었는지 확인
        await waitFor(() => {
            expect(tagNameInput).toHaveValue('')
        })
    })

    it('태그 삭제 프로세스를 테스트합니다', async () => {
        const user = userEvent.setup()

        renderWithProviders(<TagList />)

        // 첫 번째 태그의 삭제 버튼 클릭
        const deleteButtons = screen.getAllByLabelText(/태그 삭제/i)
        await user.click(deleteButtons[0])

        // 확인 대화상자에서 확인 버튼 클릭
        await user.click(screen.getByText(/확인|예/i))

        // 태그 삭제 API 호출 성공 확인
        await waitFor(() => {
            const { useDeleteTag } = require('@/hooks/useDeleteTag')
            const mockUseDeleteTag = vi.mocked(useDeleteTag)
            expect(mockUseDeleteTag().mutate).toHaveBeenCalledWith('tag-1')
        })
    })

    it('태그 필터링 기능을 테스트합니다', async () => {
        const user = userEvent.setup()

        const { getByText } = renderWithProviders(<TagFilter />)

        // 현재 선택된 태그가 강조 표시되는지 확인
        const selectedTag = getByText('작업')
        expect(selectedTag).toHaveClass('active')

        // 다른 태그 클릭
        await user.click(getByText('아이디어'))

        // 라우터 이동 확인
        const { useRouter } = require('next/navigation')
        const mockRouter = vi.mocked(useRouter)

        await waitFor(() => {
            expect(mockRouter().push).toHaveBeenCalledWith(expect.stringContaining('tag=아이디어'))
        })
    })
}) 