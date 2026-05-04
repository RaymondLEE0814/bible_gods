// 빌드 스크립트: book/*.md → dist/*.html
// 의존성 없음. node 24+ 표준 라이브러리만 사용.
//
// 사용법:
//   node build.mjs
//
// 산출물:
//   dist/index.html, contents.html, about.html
//   dist/parts/{1..5}.html
//   dist/chapters/{slug}.html
//   dist/styles/* (복사)
//   dist/scripts/* (복사)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOOK = path.join(__dirname, 'book');
const SRC = __dirname;
const DIST = path.join(__dirname, 'dist');

// ---------- 메타데이터 (book/00_목차.md 기반으로 수동 작성) ----------

const PARTS = [
  { num: 1, title: '광야의 시작', sub: '족장 시대와 가나안 정착기', era: 'BC 2000 — BC 1200', chapters: [1, 2, 3] },
  { num: 2, title: '국가신들의 전쟁', sub: '사사·왕국 초기', era: 'BC 1200 — BC 930', chapters: [4, 5, 6, 7] },
  { num: 3, title: '혼합주의의 절정', sub: '분열 왕국과 포로 직전', era: 'BC 930 — BC 586', chapters: [8, 9, 10, 11] },
  { num: 4, title: '제국의 그늘', sub: '바벨론 포로기와 페르시아 시대', era: 'BC 586 — BC 400', chapters: [12, 13, 14] },
  { num: 5, title: '카이사르와 그리스도', sub: '신약 헬레니즘·로마 시대', era: 'BC 1세기 — AD 1세기', chapters: [15, 16, 17, 18] },
];

const CHAPTERS = [
  { num: 1, part: 1, slug: 'rachel-teraphim', file: '01_라헬은_왜_그_흙덩어리를_훔쳤을까.md',
    title: '라헬은 왜 그 흙덩어리를 훔쳤을까', sub: '드라빔과 누지 점토판 — 성경 첫 번째 우상의 정체',
    god: '드라빔 (Teraphim)', evidence: '누지 점토판', era: 'BC 18세기 메소포타미아',
    summary: '라헬이 안장 밑에 숨긴 작은 흙 인형은 미신이 아니라 가문 상속권을 증명하는 법적 증서였다.' },
  { num: 2, part: 1, slug: 'egypt-plagues', file: '02_나일강을_피로_물들인_신.md',
    title: '나일강을 피로 물들인 신', sub: '10가지 재앙은 이집트 신들에 대한 정밀 타격이었다',
    god: '하피·라·하토르·파라오', evidence: '사자의 서·피라미드 텍스트', era: 'BC 13세기 이집트',
    summary: '10가지 재앙은 자연재해가 아니라 이집트 1,500위 만신전을 한 명씩 호명한 신학적 처형이었다.' },
  { num: 3, part: 1, slug: 'baal-asherah', file: '03_비를_부르려_살을_섞은_사람들.md',
    title: '비를 부르려 살을 섞은 사람들', sub: '바알, 아세라, 그리고 1929년 우가릿이 깨운 침묵',
    god: '바알·아세라·엘', evidence: '우가릿 점토판 (라스 샴라)', era: 'BC 12세기 가나안',
    summary: '가나안의 다산 제의는 미신이 아니라 천수답 농경 사회의 생존 시스템이었다. 우가릿 1,500점이 입증한다.' },

  { num: 4, part: 2, slug: 'dagon-ark', file: '04_머리가_잘려_나간_곡물의_신.md',
    title: '머리가 잘려 나간 곡물의 신', sub: '블레셋 다곤과 언약궤가 마주친 한밤의 신전',
    god: '다곤 (Dagon)', evidence: '텔 카시·텔 미크네 신전 발굴', era: 'BC 11세기 블레셋',
    summary: '다곤 신전 안에서 신상이 두 차례 무너진 사건은 고대 근동 신상 의식론의 가장 결정적 신학적 도발이었다.' },
  { num: 5, part: 2, slug: 'mesha-stele', file: '05_메사가_돌에_새긴_살인_고백.md',
    title: '메사가 돌에 새긴 살인 고백', sub: '모압의 그모스와 1868년 디본 들판에서 나온 한 비석',
    god: '그모스 (Chemosh)', evidence: '메사 석비', era: 'BC 9세기 모압',
    summary: '모압 왕 메사가 자기 손으로 새긴 7,000명 학살의 자랑이 성경 본문의 역사성을 결정적으로 입증했다.' },
  { num: 6, part: 2, slug: 'molech-gehenna', file: '06_청동_팔에_던져진_아이들.md',
    title: '청동 팔에 던져진 아이들', sub: '몰렉, 도벳, 그리고 게헨나라는 이름의 기원',
    god: '몰렉 / 밀곰', evidence: '카르타고 토펫 (6,000개 항아리)', era: 'BC 8~6세기 유다',
    summary: '힌놈의 골짜기 도벳에서 자행된 인신 제사는 카르타고 발굴이 결정적으로 입증한 역사적 사실이다.' },
  { num: 7, part: 2, slug: 'rimmon-astarte', file: '07_림몬_신당의_절과_시돈의_여신.md',
    title: '림몬 신당의 절과 시돈의 여신', sub: '의전과 상업이라는 이름으로 들어온 우상들',
    god: '림몬 (하닷)·아스다롯', evidence: '페니키아 무역망 비문', era: 'BC 9세기 다메섹·시돈',
    summary: '가장 위험한 우상은 잔혹한 형식이 아니라 의전과 결혼과 무역이라는 정중한 일상의 옷을 입고 다가온다.' },

  { num: 8, part: 3, slug: 'yahweh-asherah-kuntillet', file: '08_야훼에게는_부인이_있었다.md',
    title: '야훼에게는 부인이 있었다', sub: '쿤틸렛 아즈루드 비문이 폭로한 1970년대의 충격',
    god: '"사마리아의 야훼와 그의 아세라"', evidence: '쿤틸렛 아즈루드 피토스 비문', era: 'BC 9세기 후반 이스라엘',
    summary: '한 사막 휴게소의 항아리에 새겨진 한 줄이 이스라엘 신앙이 어디까지 휘청였는지를 폭로했다.' },
  { num: 9, part: 3, slug: 'tammuz-temple-gate', file: '09_한여름에_우는_여인들.md',
    title: '한여름에 우는 여인들', sub: '담무스, 두무지, 그리고 성전 북문의 애곡',
    god: '담무스 (두무지)', evidence: '인안나의 하강·이슈타르의 하강 점토판', era: 'BC 6세기 초 예루살렘',
    summary: '예루살렘 성전 북문에서 여인들이 죽은 청년 신을 위해 울던 그 광경이 영적 부패의 정점이었다.' },
  { num: 10, part: 3, slug: 'queen-of-heaven', file: '10_가족이_함께_굽는_별_모양_빵.md',
    title: '가족이 함께 굽는 별 모양 빵', sub: '하늘의 여왕과 일상화된 배교의 풍경',
    god: '하늘의 여왕 (이슈타르/아스타르테)', evidence: '메소포타미아 봉헌 빵 인장', era: 'BC 6세기 초 유다',
    summary: '온 가족이 마당에서 분업하여 별 모양 빵을 굽는 이 평화로운 풍경이 가장 무서운 배교의 형태였다.' },
  { num: 11, part: 3, slug: 'samaria-seven-gods', file: '11_사마리아의_신들은_왜_일곱이_되었나.md',
    title: '사마리아의 신들은 왜 일곱이 되었나', sub: '앗수르가 옮겨놓은 종교와 한 혼혈 백성의 탄생',
    god: '네르갈·숙곳브놋·아드람멜렉 외', evidence: '앗수르 사르곤 2세 비문', era: 'BC 722년 이후 사마리아',
    summary: '앗수르의 강제 이주가 사마리아에 다섯 백성·일곱 신을 심었고, 800년 후 우물가까지 그 그림자가 닿는다.' },

  { num: 12, part: 4, slug: 'bel-nebo-akitu', file: '12_짐승_등에_업혀야_움직이는_신.md',
    title: '짐승 등에 업혀야 움직이는 신', sub: '벨, 느보, 그리고 아키투 새해 축제',
    god: '벨 (마르둑)·느보 (나부)', evidence: '에누마 엘리쉬·이슈타르 문', era: 'BC 6세기 초 바벨론',
    summary: '황금 신상은 짐승 등에 업혀야 움직였지만, 야훼는 자기 백성을 자기 등에 업고 다니시는 신이다.' },
  { num: 13, part: 4, slug: 'dura-fiery-furnace', file: '13_27미터_금_신상_앞에_선_세_청년.md',
    title: '27미터 금 신상 앞에 선 세 청년', sub: '두라 평지의 충성 테스트와 풀무불',
    god: '느부갓네살의 금 신상', evidence: '두라 평지 (바벨론 동남부)', era: 'BC 6세기 바벨론',
    summary: '"그렇게 하지 아니하실지라도"라는 한 마디가 모든 시대 신앙이 도달해야 할 가장 깊은 자리를 보여 준다.' },
  { num: 14, part: 4, slug: 'cyrus-lions-den', file: '14_고레스_원통과_사자굴.md',
    title: '고레스 원통과 사자굴', sub: '페르시아의 관용 속에 숨은 새로운 박해',
    god: '아후라 마즈다 / 페르시아 황제 신격화', evidence: '고레스 원통 (BC 539)', era: 'BC 539 페르시아',
    summary: '신상이 없는 우상 숭배 시대에도 한 신앙인의 일상의 충실은 가장 결정적인 거부의 행위가 된다.' },

  { num: 15, part: 5, slug: 'artemis-ephesus', file: '15_신전이_곧_은행이었다.md',
    title: '신전이 곧 은행이었다', sub: '에베소 아르테미스와 은장색 데메드리오의 폭동',
    god: '아르테미스 (에베소 형)', evidence: '아르테미시온 발굴·25,000석 대극장', era: 'AD 50년대 에베소',
    summary: '한 시대의 우상은 한 신앙이 아니라 그 신앙을 둘러싼 거대 경제 생태계 전체다.' },
  { num: 16, part: 5, slug: 'lystra-athens', file: '16_두_신이_마을에_내려왔다.md',
    title: '두 신이 마을에 내려왔다', sub: '루스드라의 변신 이야기와 아테네의 알지 못하는 신',
    god: '제우스·헤르메스 / 알지 못하는 신', evidence: '오비디우스 변신 이야기·파우사니아스 그리스 안내', era: 'AD 47년 루스드라·아테네',
    summary: '신을 너무 많이 모시는 자는 결국 어떤 신도 제대로 모시지 못한다.' },
  { num: 17, part: 5, slug: 'pergamum-throne', file: '17_사탄의_권좌가_있는_도시.md',
    title: '사탄의_권좌가 있는 도시', sub: '버가모 산정상의 황제 숭배와 한 산봉우리의 무게',
    god: '제우스·아우구스투스 / 도미티아누스', evidence: '버가모 제우스 대제단 (베를린)', era: 'AD 90년대 후반 버가모',
    summary: '"네가 거주하는 곳은 사탄의 권좌가 있는 곳이라" — 한 마디가 한 산봉우리를 정확히 지목한다.' },
  { num: 18, part: 5, slug: 'mark-of-the-beast', file: '18_666_매매를_막는_표.md',
    title: '666, 매매를 막는 표', sub: '길드, 향, 그리고 카이사르는 주(Kyrios)다',
    god: '짐승의 표 / 네로 카이사르', evidence: '게마트리아·길드 회원증·증명서(libellus)', era: 'AD 1세기 후반 소아시아',
    summary: '광장 입구의 작은 향 알갱이 하나가 한 시대의 짐승의 이름이 한 시민의 이마에 새겨지는 자리였다.' },
];

CHAPTERS.forEach((c, i) => {
  c.prev = i > 0 ? CHAPTERS[i - 1] : null;
  c.next = i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null;
});

// ---------- HTML escape ----------
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ---------- Inline formatting ----------
function inline(text) {
  // Already-escaped text comes in. Process bold and em.
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  // Inline link [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return text;
}

// ---------- Markdown → HTML for chapter body ----------
//
// Custom rules:
//  - First # heading is the chapter title (already in chapter-header) → SKIP
//  - First ### heading is subtitle → SKIP
//  - First > "..." block (epigraph) → SKIP (already in header)
//  - Remaining ## headings → <h2 id="...">
//  - Blockquotes: classify by leading icon
//      📜 → sidebar-box origin
//      🏺 → sidebar-box archaeology
//      💡 → sidebar-box myth
//      🗺️ → sidebar-box map
//      [시대적 상황 예시 → scene-box
//      otherwise → epigraph (rare; we already strip the first one)
//  - 🔑 **이 장에서 기억할 것** + 1./2./3. items → key-takeaway
//  - --- → <hr>
//  - The last paragraph after the final 🔑 block is the bridge → <p class="bridge">

function parseChapter(md) {
  // Normalize line endings
  md = md.replace(/\r\n/g, '\n');

  // Strip the chapter title block (everything up to the first horizontal rule)
  // The chapter starts with: # 1장. ... \n\n### subtitle \n\n> "epigraph" \n> — source \n\n---
  // We want to discard everything up to and including that first '---'.
  const firstHrIdx = md.indexOf('\n---\n');
  let body = firstHrIdx >= 0 ? md.slice(firstHrIdx + 5) : md;

  // We'll classify blocks: split by blank lines (preserving block-level groups).
  // But first, we need to identify the key-takeaway block (which spans multiple paragraphs).
  // Strategy: find the line "🔑 **이 장에서 기억할 것**" and anything after that until next "---" or end.

  let keyTakeawayHtml = '';
  let bridgeHtml = '';
  const keyMatch = body.match(/(?:^|\n)🔑\s+\*\*이 장에서 기억할 것\*\*\n([\s\S]+?)(?:\n---\n|\n\n---|$)/);
  if (keyMatch) {
    const items = [];
    const re = /^(\d+)\.\s+(.+)$/gm;
    let m;
    while ((m = re.exec(keyMatch[1])) !== null) {
      items.push(`<li>${inline(esc(m[2]))}</li>`);
    }
    keyTakeawayHtml = `
<aside class="key-takeaway" aria-label="이 장에서 기억할 것">
  <div class="key-takeaway__head">🔑 이 장에서 기억할 것</div>
  <ol class="key-takeaway__list">
    ${items.join('\n    ')}
  </ol>
</aside>`;
    // Anything after the key-takeaway block (separated by ---) is the bridge.
    const afterKey = body.slice(keyMatch.index + keyMatch[0].length).trim();
    if (afterKey) {
      const bridgeText = afterKey.replace(/^---\s*\n?/, '').trim();
      if (bridgeText) {
        const ps = bridgeText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
        bridgeHtml = ps.map((p) => `<p>${inline(esc(p.replace(/\n/g, ' ')))}</p>`).join('\n');
      }
    }
    // Strip the key-takeaway and everything after from body.
    body = body.slice(0, keyMatch.index).trim();
  }

  // Now process remaining body block-by-block.
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const sectionAnchors = []; // collected for TOC sidebar
  let sectionCounter = 0;
  const out = [];

  for (let i = 0; i < blocks.length; i++) {
    const blk = blocks[i];

    // Horizontal rule
    if (blk === '---') {
      out.push('<hr>');
      continue;
    }

    // Heading
    let m;
    if ((m = blk.match(/^(#{1,6})\s+(.+)$/m)) && blk.split('\n').length === 1) {
      const level = m[1].length;
      const text = m[2].trim();
      if (level === 2) {
        sectionCounter += 1;
        const id = `s${sectionCounter}`;
        sectionAnchors.push({ id, text });
        out.push(`<h2 id="${id}" data-section-anchor>${inline(esc(text))}</h2>`);
      } else if (level === 3) {
        out.push(`<h3>${inline(esc(text))}</h3>`);
      } else if (level === 4) {
        out.push(`<h4>${inline(esc(text))}</h4>`);
      } else {
        out.push(`<h${level}>${inline(esc(text))}</h${level}>`);
      }
      continue;
    }

    // Blockquote (classify)
    if (blk.startsWith('>')) {
      const lines = blk.split('\n').map((l) => l.replace(/^>\s?/, ''));
      const first = lines[0] || '';
      // Sidebar boxes
      const sidebarMap = {
        '📜': { variant: 'origin', label: '원어로 읽기' },
        '🏺': { variant: 'archaeology', label: '고고학 노트' },
        '💡': { variant: 'myth', label: '한 가지 오해' },
        '🗺️': { variant: 'map', label: '지도' },
      };
      let matched = null;
      for (const [icon, info] of Object.entries(sidebarMap)) {
        if (first.startsWith(`**${icon}`)) { matched = { icon, ...info }; break; }
      }
      if (matched) {
        // First line: **🏺 고고학 노트 — 제목** ; rest: body paragraphs.
        const titleMatch = first.match(/\*\*[^—\-—]+—\s*(.+?)\*\*/);
        const titleText = titleMatch ? titleMatch[1].trim() : matched.label;
        const restLines = lines.slice(1).join('\n').trim();
        // Multi-paragraph: split by blank line
        const paras = restLines.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
        const bodyHtml = paras.map((p) => `<p>${inline(esc(p.replace(/\n/g, ' ')))}</p>`).join('\n');
        out.push(`
<aside class="sidebar-box sidebar-box--${matched.variant}">
  <div class="sidebar-box__head"><span class="sidebar-box__icon">${matched.icon}</span><span>${esc(matched.label)}</span></div>
  <h4 class="sidebar-box__title">${inline(esc(titleText))}</h4>
  <div class="sidebar-box__body">${bodyHtml}</div>
</aside>`);
        continue;
      }

      // Scene box
      if (first.startsWith('**[시대적 상황')) {
        // First line is the title in brackets
        const titleMatch = first.match(/\*\*\[(.+?)\]\*\*/);
        const titleText = titleMatch ? titleMatch[1] : '시대적 상황 예시';
        const restLines = lines.slice(1).join('\n').trim();
        const paras = restLines.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
        const bodyHtml = paras.map((p) => `<p>${inline(esc(p.replace(/\n/g, ' ')))}</p>`).join('\n');
        out.push(`
<aside class="scene-box">
  <div class="scene-box__title">${inline(esc(titleText))}</div>
  <div class="scene-box__body">${bodyHtml}</div>
</aside>`);
        continue;
      }

      // Generic blockquote (highlighted pull-quote)
      const text = lines.join('\n').trim();
      const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
      const bodyHtml = paras.map((p) => `<p>${inline(esc(p.replace(/\n/g, ' ')))}</p>`).join('\n');
      out.push(`<blockquote>${bodyHtml}</blockquote>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(blk)) {
      const items = blk.split('\n').filter((l) => /^\d+\.\s/.test(l)).map((l) => l.replace(/^\d+\.\s+/, ''));
      out.push(`<ol>${items.map((i) => `<li>${inline(esc(i))}</li>`).join('')}</ol>`);
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(blk)) {
      const items = blk.split('\n').filter((l) => /^[-*]\s/.test(l)).map((l) => l.replace(/^[-*]\s+/, ''));
      out.push(`<ul>${items.map((i) => `<li>${inline(esc(i))}</li>`).join('')}</ul>`);
      continue;
    }

    // Paragraph (single newlines collapse to spaces)
    const paragraph = blk.replace(/\n/g, ' ').trim();
    out.push(`<p>${inline(esc(paragraph))}</p>`);
  }

  return {
    bodyHtml: out.join('\n\n'),
    keyTakeawayHtml,
    bridgeHtml,
    sectionAnchors,
  };
}

// ---------- Templates ----------

function pageBase({ title, description, bodyClass = '', main, activeNav = '', depth = 0 }) {
  // depth 0 = root (index, contents, about); depth 1 = parts/, chapters/
  const base = depth === 0 ? '' : '../'.repeat(depth);
  const navTab = (key, label, href) => {
    const active = activeNav === key ? ' topnav__tab--active' : '';
    return `<a href="${base}${href}" class="topnav__tab${active}">${esc(label)}</a>`;
  };
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="stylesheet" href="${base}styles/tokens.css">
<link rel="stylesheet" href="${base}styles/typography.css">
<link rel="stylesheet" href="${base}styles/components.css">
<link rel="stylesheet" href="${base}styles/layout.css">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="article">
</head>
<body class="${bodyClass}">
<a href="#main" class="skip-link">본문 바로가기</a>
<header class="topnav">
  <div class="topnav__inner">
    <a href="${base}index.html" class="topnav__brand" aria-label="성경의 우상들 — 홈">
      <span class="topnav__brand-mark">우</span>
      <span>성경의 우상들</span>
    </a>
    <nav class="topnav__tabs" aria-label="메인 내비게이션">
      ${navTab('home', '홈', 'index.html')}
      ${navTab('contents', '목차', 'contents.html')}
      ${navTab('about', '소개', 'about.html')}
    </nav>
    <div class="topnav__utility">
      <a href="${base}chapters/rachel-teraphim.html">읽기 시작</a>
    </div>
    <button class="topnav__menu-btn" data-menu-toggle aria-label="메뉴 열기" aria-controls="mobile-sheet">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h12M2 8h12M2 12h12"/></svg>
    </button>
  </div>
</header>

<div class="mobile-sheet__scrim" data-mobile-scrim></div>
<aside class="mobile-sheet" id="mobile-sheet" data-mobile-sheet aria-label="모바일 메뉴">
  <button class="mobile-sheet__close" data-mobile-close aria-label="메뉴 닫기">×</button>
  <ul class="mobile-sheet__list">
    <li><a href="${base}index.html">홈</a></li>
    <li><a href="${base}contents.html">목차</a></li>
    <li><a href="${base}about.html">소개</a></li>
    <li><a href="${base}chapters/rachel-teraphim.html">1장부터 읽기</a></li>
  </ul>
</aside>

<main id="main">
${main}
</main>

<footer class="footer">
  <div class="footer__cols">
    <div class="footer__col">
      <h4>책</h4>
      <ul>
        <li><a href="${base}contents.html">전체 목차</a></li>
        <li><a href="${base}about.html">책 소개</a></li>
      </ul>
    </div>
    <div class="footer__col">
      <h4>구조</h4>
      <ul>
        ${PARTS.map(p => `<li><a href="${base}parts/${p.num}.html">${p.num}부 — ${esc(p.title)}</a></li>`).join('\n        ')}
      </ul>
    </div>
    <div class="footer__col">
      <h4>방법론</h4>
      <ul>
        <li><a href="${base}about.html#research">리서치 자료</a></li>
        <li><a href="${base}about.html#design">디자인 시스템</a></li>
      </ul>
    </div>
  </div>
  <div class="footer__legal">
    <span>© 2026 성경의 우상들 — 발굴된 신들의 역사</span>
    <span>한국어 · ko-KR</span>
  </div>
</footer>

<script src="${base}scripts/nav.js"></script>
</body>
</html>`;
}

// ---------- Page: Home ----------
function pageHome() {
  const partCards = PARTS.map((p) => `
    <a href="parts/${p.num}.html" class="part-card" data-part="${p.num}">
      <div class="part-card__bg"></div>
      <div class="part-card__num">${p.num}부</div>
      <div class="part-card__title">${esc(p.title)}</div>
      <div class="part-card__sub">${esc(p.sub)}</div>
      <div class="part-card__era">${esc(p.era)}</div>
      <div class="part-card__count">${p.chapters.length}개 장</div>
    </a>`).join('');

  const main = `
<section class="hero">
  <span class="hero__eyebrow">발굴된 신들의 역사</span>
  <h1 class="hero__title">성경의 우상들</h1>
  <p class="hero__subtitle">성경 속 이방신은 신화가 아니었다.<br>점토판과 비석, 무너진 신전이 그들의 실재를 증언한다.</p>
  <div class="hero__cta">
    <a href="chapters/rachel-teraphim.html" class="btn btn-primary">1장부터 읽기</a>
    <a href="contents.html" class="btn btn-secondary">목차 둘러보기</a>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head text-center">
      <h2 class="section-head__title">5부 18장의 여정</h2>
      <p class="section-head__sub">족장 시대부터 신약 시대까지, 한 시대의 우상을 한 챕터씩 추적한다.</p>
    </div>
    <div class="part-card-grid">
      ${partCards}
    </div>
  </div>
</section>

<section class="section--tight">
  <div class="container">
    <div class="section-head">
      <h2 class="section-head__title">먼저 읽기 좋은 챕터</h2>
      <p class="section-head__sub">관심사에 따라 어디서든 시작할 수 있습니다.</p>
    </div>
    <div class="chapter-grid">
      ${[1, 6, 8, 13, 15, 18].map((n) => chapterCardHtml(CHAPTERS[n - 1])).join('\n      ')}
    </div>
  </div>
</section>`;

  return pageBase({
    title: '성경의 우상들 — 발굴된 신들의 역사',
    description: '성경에 등장하는 모든 이방 우상을 고고학·고대 근동학·헬레니즘 사료로 재추적한 심층 논픽션.',
    bodyClass: 'page-home',
    main,
    activeNav: 'home',
    depth: 0,
  });
}

// ---------- Chapter card ----------
function chapterCardHtml(c, base = '') {
  return `<a href="${base}chapters/${c.slug}.html" class="chapter-card" data-part="${c.part}">
    <div class="chapter-card__visual">
      <span class="chapter-card__num">${String(c.num).padStart(2, '0')}</span>
      <span class="chapter-card__badge">${c.part}부 · ${c.num}장</span>
      <span class="chapter-card__god">${esc(c.god)}</span>
    </div>
    <div class="chapter-card__meta">
      <h3 class="chapter-card__title">${esc(c.title)}</h3>
      <p class="chapter-card__sub">${esc(c.sub)}</p>
      <div class="chapter-card__era">${esc(c.era)}</div>
    </div>
  </a>`;
}

// ---------- Page: Contents ----------
function pageContents() {
  const partsHtml = PARTS.map((p) => `
    <section class="section--tight" id="part-${p.num}">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">${p.num}부 · ${esc(p.era)}</span>
          <h2 class="section-head__title">${esc(p.title)}</h2>
          <p class="section-head__sub">${esc(p.sub)}</p>
        </div>
        <div class="chapter-grid">
          ${p.chapters.map((n) => chapterCardHtml(CHAPTERS[n - 1])).join('\n          ')}
        </div>
      </div>
    </section>`).join('');

  const main = `
<section class="section--tight">
  <div class="container">
    <div class="text-center mb-xxl">
      <span class="eyebrow">전체 목차</span>
      <h1 class="hero__title" style="font-size:36px">18장의 여정 한눈에 보기</h1>
    </div>
  </div>
</section>
${partsHtml}`;

  return pageBase({
    title: '목차 — 성경의 우상들',
    description: '5부 18장의 전체 목차. 각 챕터의 우상·고고학 사료·시대 정보.',
    bodyClass: 'page-contents',
    main,
    activeNav: 'contents',
    depth: 0,
  });
}

// ---------- Page: Part ----------
function pagePart(p) {
  const main = `
<div class="container">
  <section class="part-hero">
    <div class="part-hero__num">${p.num}부 · ${esc(p.era)}</div>
    <h1 class="part-hero__title">${esc(p.title)}</h1>
    <p class="part-hero__sub">${esc(p.sub)}</p>
    <div class="part-hero__era">${p.chapters.length}개 장</div>
  </section>

  <div class="chapter-grid mt-xl">
    ${p.chapters.map((n) => chapterCardHtml(CHAPTERS[n - 1], '../')).join('\n    ')}
  </div>
</div>`;

  return pageBase({
    title: `${p.num}부. ${p.title} — 성경의 우상들`,
    description: `${p.sub} (${p.era})`,
    bodyClass: `page-part page-part-${p.num}`,
    main,
    activeNav: 'contents',
    depth: 1,
  });
}

// ---------- Page: Chapter ----------
function pageChapter(c) {
  const mdPath = path.join(BOOK, c.file);
  const md = fs.readFileSync(mdPath, 'utf8');
  const { bodyHtml, keyTakeawayHtml, bridgeHtml, sectionAnchors } = parseChapter(md);

  // Extract epigraph from md (first '> "..."' / '> — source')
  const epigraphMatch = md.match(/\n>\s*"([\s\S]+?)"\n>\s*—\s*([^\n]+)/);
  const epigraphHtml = epigraphMatch
    ? `<blockquote class="epigraph">
        <p>"${esc(epigraphMatch[1].trim())}"</p>
        <cite>— ${esc(epigraphMatch[2].trim())}</cite>
       </blockquote>`
    : '';

  const tocLinksHtml = sectionAnchors.map((a, i) => `
    <li><a href="#${a.id}" data-toc-section><span class="reading-toc__nav-num">${String(i + 1).padStart(2, '0')}</span>${esc(a.text.replace(/^\d+\.\s*/, ''))}</a></li>`).join('');

  const prevLink = c.prev
    ? `<a href="../chapters/${c.prev.slug}.html"><span class="reading-toc__nav-pair-label">← 이전</span>${c.prev.num}장. ${esc(c.prev.title)}</a>`
    : `<a href="../contents.html"><span class="reading-toc__nav-pair-label">← 목록</span>전체 목차</a>`;
  const nextLink = c.next
    ? `<a href="../chapters/${c.next.slug}.html"><span class="reading-toc__nav-pair-label">다음 →</span>${c.next.num}장. ${esc(c.next.title)}</a>`
    : `<a href="../contents.html"><span class="reading-toc__nav-pair-label">완독 →</span>다른 챕터 보기</a>`;

  const main = `
<div class="chapter-layout">
  <article class="chapter-layout__main" data-chapter-article>
    <div class="container--reading" style="padding:0">
      <header class="chapter-header">
        <nav class="chapter-header__breadcrumb">
          <a href="../index.html">홈</a> ·
          <a href="../parts/${c.part}.html">${c.part}부 — ${esc(PARTS[c.part - 1].title)}</a>
        </nav>
        <div class="chapter-header__num-display">${String(c.num).padStart(2, '0')}</div>
        <h1 class="chapter-header__title">${esc(c.title)}</h1>
        <p class="chapter-header__subtitle">${esc(c.sub)}</p>
      </header>

      ${epigraphHtml}

      <div class="reading-body">
        ${bodyHtml}
        ${keyTakeawayHtml}
        ${bridgeHtml ? `<div class="bridge">${bridgeHtml}</div>` : ''}
      </div>
    </div>
  </article>

  <aside class="chapter-layout__aside">
    <div class="reading-toc" aria-label="챕터 진행도와 내비게이션">
      <div class="reading-toc__head">${c.num}장 · ${c.part}부</div>
      <div class="reading-toc__progress" aria-hidden="true">
        <div class="reading-toc__progress-fill" data-progress-fill></div>
      </div>
      <ul class="reading-toc__nav">
        ${tocLinksHtml}
      </ul>
      <hr class="reading-toc__divider">
      <div class="reading-toc__nav-pair">
        ${prevLink}
        ${nextLink}
      </div>
    </div>
  </aside>
</div>`;

  return pageBase({
    title: `${c.num}장. ${c.title} — 성경의 우상들`,
    description: c.summary,
    bodyClass: `page-chapter page-chapter-${c.num}`,
    main,
    activeNav: 'contents',
    depth: 1,
  });
}

// ---------- Page: About ----------
function pageAbout() {
  const main = `
<section class="section">
  <div class="container container--reading">
    <span class="eyebrow">소개</span>
    <h1 class="hero__title" style="text-align:left;font-size:36px">성경의 우상들에 관하여</h1>

    <div class="reading-body mt-xl">
      <p>이 책은 성경에 등장하는 이방 우상 모두를 한 챕터씩 추적한다. 라헬이 훔친 작은 흙 인형부터 사도 요한이 묘사한 666의 표에 이르기까지, 약 2,000년에 걸친 우상 숭배의 역사를 고고학·고대 근동학·헬레니즘 사료로 재구성했다.</p>

      <h2 id="research">리서치 방법론</h2>
      <p>본 책은 5부 리서치 자료(<code>report/deep_research/01~05_*.md</code>)를 토대로 한다. 각 챕터의 모든 사실관계는 1차 사료(점토판, 비석, 발굴 보고서)와 동료평가 학술 문헌에서 비롯되었으며, 본문에 등장하는 모든 인용·연대·지명은 원본 리서치 범위 안에서만 다룬다.</p>

      <p>주요 1차 사료:</p>
      <ul>
        <li>누지 점토판(BC 15세기, 후르리 가족법)</li>
        <li>우가릿 점토판 / 라스 샴라(BC 14~13세기, 가나안 신화)</li>
        <li>메사 석비(BC 9세기, 모압 그모스)</li>
        <li>카르타고 토펫 발굴(BC 8~2세기, 인신 제사)</li>
        <li>쿤틸렛 아즈루드 비문(BC 9세기 후반)</li>
        <li>에누마 엘리쉬(BC 12세기 정형, 바벨론 창조 서사시)</li>
        <li>고레스 원통(BC 539, 페르시아 정복 칙령)</li>
        <li>버가모 제우스 대제단(BC 2세기, 헬레니즘 부조)</li>
      </ul>

      <h2 id="design">디자인 시스템</h2>
      <p>이 사이트는 <a href="https://airbnb.design">Airbnb의 디자인 시스템</a>을 도서 맥락으로 매핑하여 구축되었다. 흰 캔버스에 단일 강조색(Rausch #ff385c), 모듈화된 그림자, 둥근 모서리, 모디스트 타이포그래피의 원칙을 그대로 따른다.</p>

      <p>주요 컴포넌트 매핑:</p>
      <ul>
        <li>property-card → chapter-card (챕터 카드)</li>
        <li>experience-card → part-card (부 카드)</li>
        <li>reservation-card → reading-toc (독서 사이드바)</li>
        <li>rating-display-card → chapter-num-display (챕터 번호 디스플레이)</li>
      </ul>

      <h2>저작권과 사용</h2>
      <p>본문은 리서치 자료를 기반으로 작성된 창작 텍스트다. 무단 전재나 상업적 활용을 금하되, 학습·교육 목적의 인용은 출처를 명기하면 가능하다.</p>
    </div>
  </div>
</section>`;

  return pageBase({
    title: '소개 — 성경의 우상들',
    description: '책의 목적, 리서치 방법론, 디자인 시스템에 관하여.',
    bodyClass: 'page-about',
    main,
    activeNav: 'about',
    depth: 0,
  });
}

// ---------- Build orchestration ----------
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function build() {
  console.log('🔨 Building site...');
  // Clean dist
  fs.rmSync(DIST, { recursive: true, force: true });
  ensureDir(DIST);

  // Copy static assets
  copyDir(path.join(SRC, 'styles'), path.join(DIST, 'styles'));
  copyDir(path.join(SRC, 'scripts'), path.join(DIST, 'scripts'));
  console.log('  ✓ static assets copied');

  // Home / Contents / About
  fs.writeFileSync(path.join(DIST, 'index.html'), pageHome());
  console.log('  ✓ /index.html');
  fs.writeFileSync(path.join(DIST, 'contents.html'), pageContents());
  console.log('  ✓ /contents.html');
  fs.writeFileSync(path.join(DIST, 'about.html'), pageAbout());
  console.log('  ✓ /about.html');

  // Parts
  ensureDir(path.join(DIST, 'parts'));
  for (const p of PARTS) {
    fs.writeFileSync(path.join(DIST, 'parts', `${p.num}.html`), pagePart(p));
    console.log(`  ✓ /parts/${p.num}.html`);
  }

  // Chapters
  ensureDir(path.join(DIST, 'chapters'));
  for (const c of CHAPTERS) {
    fs.writeFileSync(path.join(DIST, 'chapters', `${c.slug}.html`), pageChapter(c));
    console.log(`  ✓ /chapters/${c.slug}.html`);
  }

  console.log(`\n✅ Build complete. Output: ${DIST}`);
  console.log(`   Open ${path.join(DIST, 'index.html')} in your browser, or run:`);
  console.log(`   npx http-server src/dist -p 8000`);
}

build();
