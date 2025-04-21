/**
 * 파일명: src/tests/integration/card-flow.test.tsx
 * 목적: 카드 관련 CRUD 기능 통합 테스트
 * 역할: 카드 생성/조회/수정/삭제 과정 검증
 * 작성일: 2024-05-01
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'

// MSW 서버 가져오기
import { server } from '@/tests/msw/server'
import { createMockCard } from '@/tests/msw/handlers'

// 테스트 유틸리티
import { renderWithProviders } from '@/tests/test-utils'

// 카드 관련 컴포넌트
import CardList from '@/components/cards/CardList'
import CreateCardModal from '@/components/cards/CreateCardModal'
import { Card } from '@/types'

// Zustand 스토어와 훅 모킹
vi.mock('@/hooks/useCards', () => ({
    useCards: () => ({
        data: [
            createMockCard('card-1'),
            createMockCard('card-2'),
            { ...createMockCard('card-3'), title: '수정될 카드' }
        ],
        isLoading: false,
        error: null
    })
}))

vi.mock('@/hooks/useCard', () => ({
    useCard: (id: string) => ({
        data: createMockCard(id),
        isLoading: false,
        error: null
    })
}))

vi.mock('@/hooks/useCreateCard', () => ({
    useCreateCard: () => ({
        mutate: vi.fn((newCard) => {
            return Promise.resolve({
                id: 'new-card-id',
                ...newCard
            })
        }),
        isLoading: false,
        error: null,
        isSuccess: true
    })
}))

vi.mock('@/hooks/useUpdateCard', () => ({
    useUpdateCard: () => ({
        mutate: vi.fn((updates) => {
            return Promise.resolve({
                id: 'card-3',
                ...createMockCard('card-3'),
                ...updates
            })
        }),
        isLoading: false,
        error: null,
        isSuccess: true
    })
}))

vi.mock('@/hooks/useDeleteCard', () => ({
    useDeleteCard: () => ({
        mutate: vi.fn(() => Promise.resolve()),
        isLoading: false,
        error: null,
        isSuccess: true
    })
}))

describe('카드 CRUD 통합 테스트', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        // 추가 MSW 핸들러 설정
        server.use(
            // 카드 목록 조회
            http.get('/api/cards', () => {
                return HttpResponse.json([
                    createMockCard('card-1'),
                    createMockCard('card-2'),
                    { ...createMockCard('card-3'), title: '수정될 카드' }
                ])
            }),

            // 카드 삭제
            http.delete('/api/cards/:id', () => {
                return new HttpResponse(null, { status: 200 })
            })
        )
    })

    it('카드 목록 조회 및 렌더링을 테스트합니다', async () => {
        // CardList 컴포넌트 렌더링
        renderWithProviders(<CardList />)

        // 로딩 상태가 표시되는지 확인 (필요한 경우)
        // expect(screen.getByText(/로딩 중/i)).toBeInTheDocument()

        // 카드 항목들이 표시되는지 확인
        await waitFor(() => {
            expect(screen.getByText('테스트 카드')).toBeInTheDocument()
            expect(screen.getByText('수정될 카드')).toBeInTheDocument()
        })

        // 적어도 3개의 카드가 표시되는지 확인
        const cardItems = screen.getAllByRole('article')
        expect(cardItems.length).toBeGreaterThanOrEqual(3)
    })

    it('새 카드 생성 프로세스를 테스트합니다', async () => {
        const user = userEvent.setup()

        // 새 카드 생성 모달 표시
        const { getByText, getByLabelText } = renderWithProviders(
            <CreateCardModal open={true} onClose={() => { }} />
        )

        // 폼 입력
        const titleInput = getByLabelText(/제목/i)
        const contentInput = getByLabelText(/내용/i)

        await user.type(titleInput, '새 테스트 카드')
        await user.type(contentInput, '새 카드의 상세 내용입니다.')

        // 추가 버튼 클릭
        await user.click(getByText(/추가|저장|생성/i))

        // 카드 생성 API 호출 성공 확인
        await waitFor(() => {
            // useCreateCard의 mutate가 호출되었는지 검증
            expect(vi.mocked(useCreateCard).mock.results[0].value.mutate).toHaveBeenCalled()
        })
    })

    it('카드 수정 프로세스를 테스트합니다', async () => {
        const user = userEvent.setup()

        // 수정할 카드가 있는 상태에서 CardList 렌더링
        const { getByText, getByDisplayValue } = renderWithProviders(<CardList />)

        // 특정 카드의 수정 버튼 클릭 (실제 구현에 맞게 조정 필요)
        const editButton = screen.getByLabelText(/카드 편집/i)
        await user.click(editButton)

        // 수정 폼이 나타나면 입력 필드 업데이트
        const titleInput = getByDisplayValue('수정될 카드')
        await user.clear(titleInput)
        await user.type(titleInput, '수정된 카드 제목')

        // 저장 버튼 클릭
        await user.click(getByText(/저장/i))

        // 카드 수정 API 호출 성공 확인
        await waitFor(() => {
            // useUpdateCard의 mutate가 호출되었는지 검증
            expect(vi.mocked(useUpdateCard).mock.results[0].value.mutate).toHaveBeenCalled()
        })
    })

    it('카드 삭제 프로세스를 테스트합니다', async () => {
        const user = userEvent.setup()

        // CardList 렌더링
        renderWithProviders(<CardList />)

        // 특정 카드의 삭제 버튼 클릭 (실제 구현에 맞게 조정 필요)
        const deleteButton = screen.getByLabelText(/카드 삭제/i)
        await user.click(deleteButton)

        // 확인 대화상자에서 확인 버튼 클릭
        await user.click(screen.getByText(/확인|예/i))

        // 카드 삭제 API 호출 성공 확인
        await waitFor(() => {
            // useDeleteCard의 mutate가 호출되었는지 검증
            expect(vi.mocked(useDeleteCard).mock.results[0].value.mutate).toHaveBeenCalled()
        })

        // 삭제 후 UI에서 카드가 제거되었는지 확인
        await waitFor(() => {
            const cardItems = screen.queryAllByRole('article')
            expect(cardItems.length).toBeLessThan(3)
        })
    })
}) 