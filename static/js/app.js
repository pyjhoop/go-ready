/* Go Ready — 클라이언트 사이드는 이것뿐이다.
   페이지 본문·코드 하이라이트·다이어그램은 전부 빌드 시점에 완성된 정적 HTML.
   여기 남는 건 "상태가 필요한 것"들: 진도 저장, 퀴즈 판정, 토글. */

const KEY = "go-ready:progress";

/* ── 진도 (아티팩트의 window.storage → 공개 사이트에선 localStorage) ── */
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { completedLessons: {} }; }
  catch { return { completedLessons: {} }; }
}
function saveProgress(p) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...p, updatedAt: Date.now() })); }
  catch (e) { console.warn("진도를 저장하지 못했다:", e); }
}
let progress = loadProgress();

/* 빌드 시점에 주입된 전체 레슨 목록 */
function manifest() {
  const el = document.getElementById("lesson-manifest");
  try { return el ? JSON.parse(el.textContent) : []; } catch { return []; }
}

function paintProgress() {
  const lessons = manifest();
  const done = lessons.filter(l => progress.completedLessons[l.id]).length;
  const pct = lessons.length ? Math.round(done / lessons.length * 100) : 0;

  const pctEl = document.querySelector("[data-progress-pct]");
  const barEl = document.querySelector("[data-progress-bar]");
  const cntEl = document.querySelector("[data-progress-count]");
  if (pctEl) pctEl.textContent = pct + "%";
  if (barEl) barEl.style.width = pct + "%";
  if (cntEl) cntEl.textContent = `${done} / ${lessons.length} lessons completed`;

  document.querySelectorAll("[data-toggle]").forEach(btn => {
    const isDone = !!progress.completedLessons[btn.dataset.toggle];
    btn.classList.toggle("done", isDone);
    if (btn.hasAttribute("role")) btn.setAttribute("aria-checked", String(isDone));
    if (btn.classList.contains("complete-toggle")) {
      btn.textContent = isDone ? "✓ 완료함" : "완료로 표시";
    }
    const row = btn.closest(".lesson-row");
    if (row) row.querySelector(".lesson-open")?.classList.toggle("done", isDone);
  });

  // 모듈 전체 완료 시 사이드바 체크
  document.querySelectorAll("[data-module-check]").forEach(chk => {
    const mod = chk.dataset.moduleCheck;
    const inMod = lessons.filter(l => l.module === mod);
    const allDone = inMod.length > 0 && inMod.every(l => progress.completedLessons[l.id]);
    chk.closest(".nav-item")?.classList.toggle("done", allDone);
  });
}

/* ── 퀴즈 엔진 ─────────────────────────────────────────────────── */
function initQuiz(section) {
  const dataEl = section.querySelector("[data-quiz-data]");
  if (!dataEl) return;
  const quiz = JSON.parse(dataEl.textContent);
  const body = section.querySelector("[data-quiz-body]");
  const score = section.querySelector("[data-quiz-score]");
  let idx = 0, selected = null, results = [];

  function draw() {
    if (idx >= quiz.questions.length) {
      const correct = results.filter(Boolean).length;
      const pass = correct / quiz.questions.length >= 0.7;
      score.textContent = "";
      body.innerHTML = `<div class="quiz-result">
        <div class="big">${correct} / ${quiz.questions.length}</div>
        <div class="msg">${pass ? "통과! 이 모듈의 함정을 잘 파악했다 ✓" : "다시 한 번 훑어보면 좋겠다."}</div>
        <button class="btn btn-ghost" data-retry type="button">다시 풀기</button>
      </div>`;
      return;
    }
    const q = quiz.questions[idx];
    const answered = selected !== null;
    score.textContent = `문제 ${idx + 1} / ${quiz.questions.length}`;
    body.innerHTML = `
      <div class="quiz-q">${q.q}</div>
      ${q.options.map((opt, i) => {
        let cls = "quiz-opt", mark = "";
        if (answered) {
          if (i === q.answer) { cls += " correct"; mark = "✓"; }
          else if (i === selected) { cls += " wrong"; mark = "✕"; }
        }
        return `<button class="${cls}" data-opt="${i}" ${answered ? "disabled" : ""} type="button">${opt}<span class="mark">${mark}</span></button>`;
      }).join("")}
      ${answered ? `<div class="quiz-explain">${q.explain}</div>` : ""}
      <div class="quiz-nav">
        <button class="btn btn-primary" data-next ${answered ? "" : "disabled"} type="button">
          ${idx === quiz.questions.length - 1 ? "결과 보기" : "다음 문제 →"}
        </button>
      </div>`;
  }

  section.addEventListener("click", (e) => {
    const opt = e.target.closest("[data-opt]");
    if (opt && selected === null) {
      selected = +opt.dataset.opt;
      results[idx] = selected === quiz.questions[idx].answer;
      return draw();
    }
    if (e.target.closest("[data-next]")) { idx++; selected = null; return draw(); }
    if (e.target.closest("[data-retry]")) { idx = 0; selected = null; results = []; return draw(); }
  });

  draw();
}

/* ── 이벤트 위임 ───────────────────────────────────────────────── */
document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-toggle],[data-runoutput],[data-copy],[data-playground],[data-reset]");
  if (!t) return;

  if (t.dataset.toggle) {
    const id = t.dataset.toggle;
    if (progress.completedLessons[id]) delete progress.completedLessons[id];
    else progress.completedLessons[id] = true;
    saveProgress(progress);
    paintProgress();
    return;
  }
  if (t.dataset.runoutput) {
    document.getElementById(t.dataset.runoutput)?.classList.toggle("output-open");
    return;
  }
  if (t.dataset.copy || t.dataset.playground) {
    const id = t.dataset.copy || t.dataset.playground;
    const code = document.querySelector(`#${CSS.escape(id)} .code-body`)?.innerText || "";
    try { await navigator.clipboard.writeText(code.trim()); } catch {}
    if (t.dataset.playground) {
      window.open("https://go.dev/play/", "_blank", "noopener");
      t.textContent = "복사됨 · 붙여넣기";
      setTimeout(() => t.textContent = "Playground ↗", 1800);
    } else {
      t.textContent = "복사됨 ✓";
      setTimeout(() => t.textContent = "복사", 1400);
    }
    return;
  }
  if (t.hasAttribute("data-reset")) {
    if (confirm("모든 학습 진도를 지웁니다. 계속할까요?")) {
      try { localStorage.removeItem(KEY); } catch {}
      progress = { completedLessons: {} };
      paintProgress();
    }
  }
});

/* 모바일 메뉴 */
document.getElementById("hamburger")?.addEventListener("click", () => {
  document.getElementById("sidebar")?.classList.add("mobile-open");
  document.getElementById("overlay")?.classList.add("show");
});
document.getElementById("overlay")?.addEventListener("click", () => {
  document.getElementById("sidebar")?.classList.remove("mobile-open");
  document.getElementById("overlay")?.classList.remove("show");
});

/* 부팅 */
paintProgress();
document.querySelectorAll(".quiz").forEach(initQuiz);
