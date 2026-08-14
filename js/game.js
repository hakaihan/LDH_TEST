// 게임 진행에 필요한 순수 로직 (DOM에 의존하지 않음)

export const MIN_DELAY_MS = 1000; // 1초
export const MAX_DELAY_MS = 12000; // 12초

/**
 * 1~12초 사이의 랜덤한 대기 시간을 밀리초 단위로 반환합니다.
 * @returns {number}
 */
export function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
}

export const GameState = Object.freeze({
  IDLE: "IDLE",
  WAITING: "WAITING", // 파란 화면, 신호 대기 중
  READY: "READY", // 빨간 화면, 클릭 대기 중
  RESULT: "RESULT", // 초록 화면, 결과 표시
  FAILED: "FAILED", // 너무 일찍 클릭함
});
