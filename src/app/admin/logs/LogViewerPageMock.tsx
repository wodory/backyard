/**
 * 파일명: LogViewerPageMock.tsx
 * 목적: 로그 뷰어 페이지 테스트를 위한 모킹 컴포넌트
 * 역할: 실제 컴포넌트의 동작을 시뮬레이션
 * 작성일: 2025-04-01
 */

import React, { useState } from 'react'
import { Log, mockLogs, mockModules } from '@/tests/msw/handlers/logs'

export const LogViewerPageMock: React.FC = () => {
    const [selectedModule, setSelectedModule] = useState('')
    const [selectedLevel, setSelectedLevel] = useState('')
    const [logData, setLogData] = useState<Log[]>(mockLogs)
    const [showError, setShowError] = useState(false)
    const [showEmpty, setShowEmpty] = useState(false)
    const [showDetail, setShowDetail] = useState(false)
    const [selectedLog, setSelectedLog] = useState<Log | null>(null)

    const handleFilterApply = () => {
        // 에러 시뮬레이션
        if (selectedModule === 'error-trigger') {
            setShowError(true)
            setShowEmpty(false)
            setLogData([])
            return
        }

        // 빈 결과 시뮬레이션
        if (selectedModule === 'empty-trigger') {
            setShowError(false)
            setShowEmpty(true)
            setLogData([])
            return
        }

        // 일반 필터링 시뮬레이션
        setShowError(false)
        setShowEmpty(false)

        let filtered = [...mockLogs]
        if (selectedModule) {
            filtered = filtered.filter(log => log.module === selectedModule)
        }
        if (selectedLevel) {
            filtered = filtered.filter(log => log.level === selectedLevel)
        }

        setLogData(filtered)
    }

    const handleFilterReset = () => {
        setSelectedModule('')
        setSelectedLevel('')
        setShowError(false)
        setShowEmpty(false)
        setLogData(mockLogs)
    }

    const handleLogClick = (log: Log) => {
        setSelectedLog(log)
        setShowDetail(true)
    }

    const handleCloseDetail = () => {
        setShowDetail(false)
        setSelectedLog(null)
    }

    return (
        <div>
            <h1>로그 뷰어</h1>

            {/* 필터 컨트롤 */}
            <div>
                <label htmlFor="module">모듈</label>
                <select
                    id="module"
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                    data-testid="module-select"
                >
                    <option value="">모든 모듈</option>
                    {mockModules.map((module: string) => (
                        <option key={module} value={module}>{module}</option>
                    ))}
                    <option value="error-trigger">에러 트리거</option>
                    <option value="empty-trigger">빈 결과 트리거</option>
                </select>

                <label htmlFor="level">레벨</label>
                <select
                    id="level"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    data-testid="level-select"
                >
                    <option value="">모든 레벨</option>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                </select>

                <label htmlFor="limit">로그 수</label>
                <select id="limit">
                    <option value="100">100개</option>
                </select>

                <button onClick={handleFilterApply} data-testid="apply-filter">필터 적용</button>
                <button onClick={handleFilterReset} data-testid="reset-filter">필터 초기화</button>
            </div>

            {/* 에러 메시지 */}
            {showError && (
                <div className="error-message" data-testid="error-message">
                    로그를 가져오는 중 오류가 발생했습니다.
                </div>
            )}

            {/* 로그 목록 */}
            {showEmpty || logData.length === 0 ? (
                <div data-testid="empty-message">조건에 맞는 로그가 없습니다.</div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>시간</th>
                            <th>모듈</th>
                            <th>레벨</th>
                            <th>메시지</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logData.map((log, index) => (
                            <tr
                                key={index}
                                onClick={() => handleLogClick(log)}
                                data-testid={`log-row-${index}`}
                            >
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>{log.module}</td>
                                <td>{log.level}</td>
                                <td>{log.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* 로그 상세 정보 모달 */}
            {showDetail && selectedLog && (
                <div className="log-detail" data-testid="log-detail">
                    <h2>로그 상세 정보</h2>
                    <p><strong>메시지:</strong> {selectedLog.message}</p>
                    <p><strong>모듈:</strong> {selectedLog.module}</p>
                    <p><strong>레벨:</strong> {selectedLog.level}</p>
                    <p><strong>시간:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                    <p><strong>세션 ID:</strong> {selectedLog.sessionId}</p>

                    {selectedLog.data && (
                        <div>
                            <strong>데이터:</strong>
                            <pre data-testid="log-data">
                                {JSON.stringify(selectedLog.data, null, 2)}
                            </pre>
                        </div>
                    )}

                    <button onClick={handleCloseDetail} data-testid="close-detail">닫기</button>
                </div>
            )}
        </div>
    )
} 