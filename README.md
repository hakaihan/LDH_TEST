# 반응속도 측정 웹앱

버튼을 누르면 게임이 시작되고, 화면이 랜덤한 시간(1~12초) 뒤에 빨간색으로 바뀝니다.
빨간색으로 바뀐 순간부터 클릭까지 걸린 시간을 ms 단위로 측정해 보여주고,
닉네임과 함께 Firebase(Firestore)에 기록을 저장합니다. 신호가 오기 전에 클릭하면 실패 처리됩니다.

## 동작 방식

1. 시작 화면에서 "게임 시작" 버튼 클릭 → 화면이 파란색으로 바뀌며 대기 시작
2. 1~12초 사이 랜덤한 시간 뒤 화면이 빨간색으로 전환
3. 빨간색으로 바뀐 뒤 클릭하면 반응 속도(ms)가 초록색 결과 화면에 표시됨
4. 결과 화면에서 닉네임을 입력하고 저장하면 Firestore에 기록이 저장됨
5. 빨간색으로 바뀌기 전에 클릭하면 실패 화면으로 전환되고 재시도 가능
6. 결과 화면과 시작 화면에는 최고 기록 TOP 5(랭킹)가 표시됨

## 프로젝트 구조

```
index.html            화면 마크업
style.css             스타일
js/game.js            게임 상태/랜덤 딜레이 등 순수 로직
js/firebase.js         Firebase 앱/Firestore 초기화
js/firebase-config.js  Firebase 프로젝트 설정 값 (직접 채워 넣어야 함)
js/score.js            saveScore(nickname, ms) / getTop(n) - DB 접근은 이 두 함수로만 수행
js/main.js             DOM 이벤트 연결 및 화면 전환
.github/workflows/deploy.yml  GitHub Pages 자동 배포 워크플로우
```

## Firebase 설정 방법 (필수)

이 저장소에는 실제 Firebase 프로젝트 자격 증명이 포함되어 있지 않습니다.
아래 순서대로 직접 Firebase 프로젝트를 만들고 설정 값을 채워야 기록 저장/랭킹 조회가 동작합니다.

1. [Firebase 콘솔](https://console.firebase.google.com)에서 새 프로젝트를 생성합니다.
2. 왼쪽 메뉴에서 **Firestore Database**를 생성합니다. (리전은 임의로 선택 가능)
3. **Firestore 규칙** 탭에서 아래 규칙으로 교체합니다. (인증 없이 누구나 읽기/기록 추가 가능하되,
   유효한 형식의 기록만 추가할 수 있도록 제한합니다)

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /scores/{scoreId} {
         allow read: if true;
         allow create: if request.resource.data.keys().hasOnly(['nickname', 'ms', 'createdAt'])
                       && request.resource.data.nickname is string
                       && request.resource.data.nickname.size() > 0
                       && request.resource.data.nickname.size() <= 20
                       && request.resource.data.ms is number
                       && request.resource.data.ms > 0
                       && request.resource.data.ms < 20000;
         allow update, delete: if false;
       }
     }
   }
   ```

4. 프로젝트 설정(톱니바퀴 아이콘) > **일반** 탭 > "내 앱" 섹션에서 웹 앱(`</>`)을 추가합니다.
5. 발급된 `firebaseConfig` 값을 복사해 `js/firebase-config.js`의 `firebaseConfig` 객체에 그대로 붙여넣습니다.

> Firebase 웹 `apiKey`는 비밀 값이 아니라 클라이언트에 공개되는 식별자입니다.
> 실제 접근 제어는 위 Firestore 보안 규칙이 담당합니다.

## GitHub Pages 배포

`.github/workflows/deploy.yml` 워크플로우가 `main` 브랜치에 push될 때마다
저장소 루트를 정적 사이트로 빌드해 GitHub Pages에 배포합니다.

1. 저장소 **Settings > Pages**에서 Source를 **GitHub Actions**로 설정합니다.
2. 이 브랜치를 `main`에 병합하면 자동으로 배포가 실행됩니다.

## 로컬에서 실행하기

정적 파일이므로 별도 빌드 없이 로컬 서버로 열면 됩니다.

```bash
npx serve .
# 또는
python3 -m http.server 8080
```

브라우저에서 안내된 주소로 접속합니다. (단, `js/firebase-config.js`를 채우지 않으면
기록 저장/랭킹 조회 기능은 오류 메시지를 표시합니다)
