# 네온 듀엣 배포 안내

## 업로드할 파일

`neon-duet-deploy.zip`은 게임 실행에 필요한 파일만 담은 배포용 압축 파일입니다.
폴더 업로드를 지원하는 정적 웹 호스팅에는 `dist` 폴더를 사용하세요.
ZIP 업로드를 지원하지 않으면 압축을 풀어서 내용물을 업로드하세요.

업로드 후 사이트 루트에 `index.html`이 있어야 합니다.

```text
index.html
style.css
game.js
imported-chart.js
assets/
  self-embodiment.mp3
  self-embodiment-inline.js
```

오리지널 곡 3개, 제공한 MP3 곡과 채보, ESC 일시정지·재시작·곡 멈춤 기능이 포함됩니다.
`self-embodiment-inline.js`는 파일을 더블클릭해서 실행할 때 사용하는 음원입니다.
웹으로 접속하면 MP3를 직접 불러옵니다.

## 호스팅 설정

- 사이트 유형: 정적 사이트
- 게시 폴더: `dist`
- 빌드 명령: 없음 (이미 준비된 `dist`를 업로드하는 경우)
- 시작 파일: `index.html`

Node 서버, 데이터베이스, 환경 변수는 필요하지 않습니다.
`server.cjs`, `analysis`, 테스트 파일은 업로드하지 않습니다.
주소를 받은 뒤 다른 컴퓨터에서 접속해 게임 시작 버튼을 누르면 됩니다.
최고 점수와 설정은 각 브라우저에 따로 저장됩니다.

## 게임 수정 후 다시 만들기

Windows에서 Node.js가 설치되어 있다면 `배포하기.cmd`를 더블클릭하거나,
이 프로젝트 폴더에서 다음 명령을 실행하세요.

```powershell
node build-deploy.cjs
```

원본 게임 파일을 `dist`로 복사하고 `neon-duet-deploy.zip`을 갱신합니다.
`dist` 안의 파일을 직접 수정하지 말고 원본을 수정한 뒤 다시 만드세요.
예상하지 못한 파일이 `dist`에 있으면 스크립트가 중단되므로 해당 파일을 다른 곳으로 옮긴 뒤 실행하세요.

현재 결과물은 배포용 파일이며, 공개 웹 주소는 호스팅 서비스에 업로드한 뒤 생성됩니다.

## Sonic.exe 추가 파일

배포 스크립트가 `mod-assets.json` 목록에 따라 `mod-songs.js`와 `assets/sonic/`의 22개 OGG 음원을 자동 포함합니다.
11곡은 웹 주소로 실행해야 합니다. 기존 단일 MP3의 파일 직접 실행 기능은 유지됩니다.
