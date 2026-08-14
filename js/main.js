import { GameState, getRandomDelay } from "./game.js";

const TOP_N = 5;

// score.js는 Firebase(외부 CDN) 모듈을 불러오므로, 네트워크 문제나 설정 미완료로
// 로드에 실패하더라도 게임 자체(시작/대기/신호/측정)는 항상 동작하도록 동적 import로 분리한다.
let scoreModulePromise = null;
function loadScoreModule() {
  if (!scoreModulePromise) {
    scoreModulePromise = import("./score.js");
  }
  return scoreModulePromise;
}

const screens = {
  idle: document.getElementById("screen-idle"),
  game: document.getElementById("screen-game"),
  fail: document.getElementById("screen-fail"),
  result: document.getElementById("screen-result"),
};

const gameArea = document.getElementById("game-area");
const gameMessage = document.getElementById("game-message");
const btnStart = document.getElementById("btn-start");
const btnRetryFail = document.getElementById("btn-retry-fail");
const btnRetryResult = document.getElementById("btn-retry-result");
const resultMsEl = document.getElementById("result-ms");
const formNickname = document.getElementById("form-nickname");
const inputNickname = document.getElementById("input-nickname");
const btnSave = document.getElementById("btn-save");
const saveStatus = document.getElementById("save-status");
const rankingListIdle = document.getElementById("ranking-list-idle");
const rankingListResult = document.getElementById("ranking-list-result");

let state = GameState.IDLE;
let waitTimeoutId = null;
let readyStartTime = null;
let lastReactionMs = 0;

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.add("screen-hidden"));
  screens[name].classList.remove("screen-hidden");
}

function startGame() {
  state = GameState.WAITING;
  gameArea.classList.remove("game-area-ready");
  gameArea.classList.add("game-area-wait");
  gameMessage.textContent = "화면이 빨간색으로 바뀔 때까지 기다리세요...";
  showScreen("game");

  const delay = getRandomDelay();
  waitTimeoutId = setTimeout(() => {
    state = GameState.READY;
    gameArea.classList.remove("game-area-wait");
    gameArea.classList.add("game-area-ready");
    gameMessage.textContent = "지금 클릭하세요!";
    readyStartTime = performance.now();
  }, delay);
}

function handleGameAreaClick() {
  if (state === GameState.WAITING) {
    clearTimeout(waitTimeoutId);
    state = GameState.FAILED;
    showScreen("fail");
    return;
  }

  if (state === GameState.READY) {
    lastReactionMs = performance.now() - readyStartTime;
    state = GameState.RESULT;
    showResult(lastReactionMs);
  }
}

function showResult(ms) {
  resultMsEl.textContent = Math.round(ms);
  formNickname.reset();
  inputNickname.disabled = false;
  btnSave.disabled = false;
  saveStatus.textContent = "";
  showScreen("result");
  renderRanking(rankingListResult);
}

async function renderRanking(listEl) {
  listEl.innerHTML = '<li class="ranking-empty">기록을 불러오는 중...</li>';
  try {
    const { getTop } = await loadScoreModule();
    const top = await getTop(TOP_N);
    if (top.length === 0) {
      listEl.innerHTML = '<li class="ranking-empty">아직 등록된 기록이 없습니다.</li>';
      return;
    }
    listEl.innerHTML = top
      .map(
        (record, index) => `
          <li>
            <span class="rank-nickname">${index + 1}. ${escapeHtml(record.nickname)}</span>
            <span class="rank-ms">${record.ms} ms</span>
          </li>
        `
      )
      .join("");
  } catch (error) {
    console.error("랭킹 조회 실패:", error);
    listEl.innerHTML = '<li class="ranking-empty">기록을 불러오지 못했습니다.</li>';
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

btnStart.addEventListener("click", startGame);
btnRetryFail.addEventListener("click", startGame);
btnRetryResult.addEventListener("click", startGame);
gameArea.addEventListener("click", handleGameAreaClick);

formNickname.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nickname = inputNickname.value.trim();
  if (!nickname) {
    saveStatus.textContent = "닉네임을 입력해주세요.";
    return;
  }

  btnSave.disabled = true;
  inputNickname.disabled = true;
  saveStatus.textContent = "저장 중...";

  try {
    const { saveScore } = await loadScoreModule();
    await saveScore(nickname, lastReactionMs);
    saveStatus.textContent = "기록이 저장되었습니다!";
    await renderRanking(rankingListResult);
  } catch (error) {
    console.error("기록 저장 실패:", error);
    saveStatus.textContent = "기록 저장에 실패했습니다. 다시 시도해주세요.";
    btnSave.disabled = false;
    inputNickname.disabled = false;
  }
});

// 초기 화면 랭킹 로딩
renderRanking(rankingListIdle);
