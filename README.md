# 임재모 백엔드 개발자 포트폴리오

메인 페이지와 4개 프로젝트 상세 페이지를 생성하는 GitHub Pages용 정적 사이트입니다. Node.js 22 이상만 필요하며 빌드·미리보기에는 외부 패키지가 필요하지 않습니다.

## 실행

```sh
npm run build
npm run check
npm run preview
```

미리보기: <http://127.0.0.1:4173/>. 소스·콘텐츠 수정 후 `npm run build`를 다시 실행하고 브라우저를 새로고침합니다.

## 콘텐츠 수정

| 파일 | 역할 |
| --- | --- |
| `content/site.json` | 소개, 운영 지표, 기술, 학력·자격·수상, 연락처, 기본 저장소 |
| `content/projects.json` | 프로젝트 순서, 요약, 기여, 아키텍처, 문제 해결, 결과·한계, 증빙 |
| `content/assets.json` | PDF 이미지 출처 페이지와 크기 |
| `public/assets/` | 추출 이미지, 스타일, 이미지 확대 기능 |
| `scripts/build.mjs` | 데이터에서 실제 HTML 페이지 생성 |
| `docs/CONTENT_REVIEW.md` | 충돌·미확정 사실 및 공개 전 확인 사항 |
| `docs/QA.md` | 검증 결과와 범위 |

콘텐츠는 HTML 코드와 분리했습니다. 모든 본문은 HTML에 정적으로 포함되어 JavaScript가 없어도 읽을 수 있습니다. 이미지 확대만 JavaScript를 사용하며, JavaScript를 끄면 원본 이미지 링크로 동작합니다.

## 배포 대상과 경로

사용자가 선택한 대상은 사용자 사이트 `JAEMO-LIM/jaemo-lim.github.io`이며 공개 URL은 배포 후 `https://jaemo-lim.github.io/`입니다. 공식 GitHub 안내에 맞춰 저장소 이름의 사용자 부분을 소문자로 정리했습니다.

2026-10-14 확인 시 로컬에는 포트폴리오 저장소가 없었고, 연결된 GitHub의 목록에도 나타나지 않았습니다. 해당 저장소 조회는 404를 반환했습니다. 따라서 기존 저장소가 확인되었다고 간주하지 않았으며, 저장소 생성·업로드·공개 배포는 수행하지 않았습니다.

빌드는 실제 GitHub Actions `GITHUB_REPOSITORY` → 로컬 `origin` → `content/site.json` 순서로 저장소 이름을 결정합니다. 사용자 사이트는 `/`, 프로젝트 사이트는 `/저장소이름/`을 사용합니다. 사용자 정의 도메인 등에는 `BASE_PATH=/`를 명시할 수 있습니다.

```sh
# 프로젝트 사이트 경로 검증 예시
GITHUB_REPOSITORY=JAEMO-LIM/portfolio npm run build
npm run check

# 사용자 사이트로 복원
npm run build
```

`dist/projects/filly/index.html`처럼 각 상세 페이지에 실제 HTML 파일이 생성됩니다. SPA fallback이나 서버 재작성에 의존하지 않아 상세 주소 직접 접속·새로고침이 가능합니다. `.nojekyll`, `404.html`, sitemap도 함께 생성합니다.

## 미리보기 검토 후 공개 배포

1. `docs/CONTENT_REVIEW.md`와 로컬 미리보기를 검토합니다.
2. GitHub에 `JAEMO-LIM/jaemo-lim.github.io` 저장소를 생성하고 이 디렉터리의 파일을 저장소 루트에 올립니다.
3. 저장소 Settings → Pages → Build and deployment → Source에서 **GitHub Actions**를 선택합니다.
4. Actions → **Deploy portfolio to GitHub Pages** → **Run workflow**를 수동 실행합니다.
5. 배포 완료 후 홈과 `/projects/mapleplanet/`, `/projects/filly/`, `/projects/crush/`, `/projects/speech-analysis/`에 직접 접속해 확인합니다.

`pages.yml`은 `workflow_dispatch`만 사용합니다. Push/PR은 `check.yml`에서 빌드·내부 링크 검증만 실행하며 자동 공개하지 않습니다. 배포 산출물에는 `dist`만 포함되며 확인 목록과 소스 원고는 사이트에 게시되지 않습니다. 공개 저장소를 사용하면 소스와 docs 파일 자체는 GitHub에서 열람할 수 있습니다.

## 선택적 브라우저 QA

브라우저 검증은 Playwright와 Chrome이 설치된 환경에서 실행합니다. 사이트 빌드에는 필요하지 않습니다.

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright \
CHROME_PATH='/absolute/path/to/chrome' \
node scripts/browser-qa.mjs
```

`PREVIEW_URL`, `QA_OUTPUT`으로 검증 주소와 스크린샷 폴더를 지정할 수 있습니다. 1440·768·390·320px에서 메인·상세 접속, 오버플로, 이미지, 확대/닫기, 키보드 포커스, 목차, 404와 JS 미사용 화면을 검증합니다.

## 참고

- 구성 참고: <https://kootaeho.github.io/portfolio/> — 소개·기술·프로젝트·이력의 정보 구조와 문제/해결/결과 설명 순서를 참고했습니다. 문구·디자인·성과 수치는 복제하지 않았습니다.
- 사용자 사이트 이름 및 설정: <https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site>
- Actions 배포: <https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>
