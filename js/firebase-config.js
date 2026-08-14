// Firebase 프로젝트 설정 값입니다.
// Firebase 콘솔(https://console.firebase.google.com) > 프로젝트 설정 > 일반 > 내 앱(웹 앱)
// 에서 발급받은 값을 아래에 그대로 채워 넣으세요.
//
// 1. Firebase 콘솔에서 새 프로젝트를 생성합니다.
// 2. "Firestore Database"를 생성합니다 (프로덕션 모드 또는 테스트 모드 선택 후,
//    README.md에 안내된 보안 규칙을 적용하세요).
// 3. 프로젝트 설정 > 일반 탭에서 "웹 앱 추가"를 눌러 앱을 등록합니다.
// 4. 발급된 firebaseConfig 객체 값을 아래 자리에 붙여넣습니다.
//
// 참고: Firebase 웹 apiKey는 비밀 값이 아니며 클라이언트에 공개되는 것이 정상입니다.
// 실제 접근 제어는 Firestore 보안 규칙(README.md 참고)으로 처리합니다.

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
