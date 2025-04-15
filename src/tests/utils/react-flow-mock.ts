/**
 * 파일명: react-flow-mock.ts
 * 목적: React Flow 컴포넌트 테스트를 위한 모킹 유틸리티
 * 역할: 테스트 환경에서 React Flow에 필요한 브라우저 환경 API 모킹
 * 작성일: 2025-03-28
 * 수정일: 2023-10-27 : any 타입을 구체적인 타입으로 변경
 */

// React Flow 공식 문서에서 제시하는 테스트 유틸리티 구현

/**
 * ResizeObserver 모의 구현
 * 브라우저 환경이 아닌 Jest/Vitest에서 동작하기 위한 구현체
 */
class ResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback([{ target } as ResizeObserverEntry], this);
  }

  unobserve() {}

  disconnect() {}
}

/**
 * DOMMatrixReadOnly 모의 구현
 * 브라우저 환경이 아닌 Jest/Vitest에서 동작하기 위한 구현체
 */
class DOMMatrixReadOnly {
  m22: number;
  constructor(transform: string) {
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1];
    this.m22 = scale !== undefined ? +scale : 1;
  }
}

// 모킹이 한 번만 초기화되도록 플래그 관리
let init = false;

/**
 * mockReactFlow: React Flow를 모킹하는 함수
 * Jest/Vitest 테스트 환경에서 React Flow 사용 시 필요한 브라우저 API 모킹
 */
export const mockReactFlow = () => {
  if (init) return;
  init = true;

  // 전역 객체에 ResizeObserver 추가
  global.ResizeObserver = ResizeObserver as unknown as typeof global.ResizeObserver;

  // 전역 객체에 DOMMatrixReadOnly 추가
  global.DOMMatrixReadOnly = DOMMatrixReadOnly as unknown as typeof global.DOMMatrixReadOnly;

  // HTMLElement에 offsetHeight, offsetWidth 속성 추가
  Object.defineProperties(global.HTMLElement.prototype, {
    offsetHeight: {
      get() {
        return parseFloat(this.style.height) || 1;
      },
    },
    offsetWidth: {
      get() {
        return parseFloat(this.style.width) || 1;
      },
    },
  });

  // SVGElement에 getBBox 메서드 추가
  (global.SVGElement.prototype as unknown as { getBBox: () => { x: number; y: number; width: number; height: number } }).getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
}; 