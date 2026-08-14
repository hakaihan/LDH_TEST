// 점수 저장/조회 담당 모듈.
// DB 접근은 반드시 이 두 함수를 통해서만 이루어집니다: saveScore(), getTop(n)
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const SCORES_COLLECTION = "scores";

/**
 * 닉네임과 반응 속도(ms) 기록을 Firestore에 저장합니다.
 * @param {string} nickname 닉네임 (1~20자)
 * @param {number} ms 반응 속도 (밀리초)
 * @returns {Promise<void>}
 */
export async function saveScore(nickname, ms) {
  const trimmedNickname = String(nickname ?? "").trim();
  if (!trimmedNickname) {
    throw new Error("닉네임을 입력해주세요.");
  }
  if (!Number.isFinite(ms) || ms <= 0) {
    throw new Error("올바르지 않은 기록입니다.");
  }

  await addDoc(collection(db, SCORES_COLLECTION), {
    nickname: trimmedNickname.slice(0, 20),
    ms: Math.round(ms),
    createdAt: serverTimestamp(),
  });
}

/**
 * 반응 속도가 가장 빠른(작은) 순으로 상위 n개 기록을 가져옵니다.
 * @param {number} n 가져올 기록 개수
 * @returns {Promise<Array<{ nickname: string, ms: number }>>}
 */
export async function getTop(n) {
  const q = query(
    collection(db, SCORES_COLLECTION),
    orderBy("ms", "asc"),
    limit(n)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return { nickname: data.nickname, ms: data.ms };
  });
}
