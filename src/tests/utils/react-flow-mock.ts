/**
 * 파일명: react-flow-mock.ts
 * 목적: React Flow 컴포넌트 테스트를 위한 모킹 유틸리티
 * 역할: 테스트 환경에서 React Flow에 필요한 브라우저 환경 API 모킹
 * 작성일: 2025-03-28
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
  global.ResizeObserver = ResizeObserver as any;

  // 전역 객체에 DOMMatrixReadOnly 추가
  global.DOMMatrixReadOnly = DOMMatrixReadOnly as any;

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
  (global.SVGElement as any).prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
}; 