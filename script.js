"use strict";

const conditions = ["Words", "Nonwords", "Single letters"];
const get = (id) => document.getElementById(id);
const display = get("display");
const next = get("next");
const feedback = get("feedback");
const scores = conditions.map(() => ({ correct: 0, total: 0 }));

let bank;
let trials;
let index = 0;
let practice = true;
let stage = "idle";
let animationFrame;
let choices = [];

function show(id) {
  for (const screen of document.querySelectorAll("main > section")) {
    screen.hidden = screen.id !== id;
  }
  get(id).querySelector("h1").setAttribute("tabindex", "-1");
  get(id).querySelector("h1").focus();
}

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function scoredTrials() {
  const prepared = [];
  for (let position = 0; position < 4; position++) {
    const items = shuffle(bank.scored.filter((item) => item.targetIndex === position));
    items.forEach((item, i) => {
      const withinCondition = i % 4;
      prepared.push({
        ...item,
        condition: Math.floor(i / 4),
        alternate: withinCondition >= 2,
        correctSlot: withinCondition % 2,
      });
    });
  }
  return shuffle(prepared);
}

function begin(isPractice) {
  practice = isPractice;
  index = 0;
  if (!practice) {
    for (const score of scores) {
      score.correct = 0;
      score.total = 0;
    }
  }
  trials = practice ? bank.practice.map((item, i) => ({
    ...item, condition: i % 3, alternate: false, correctSlot: i % 2,
  })) : scoredTrials();
  get("task-heading").textContent = practice ? "Practice" : "Task";
  get("scored-start").hidden = true;
  show("task");
  ready();
}

function drawText(text, className) {
  const row = document.createElement("div");
  row.className = className;
  for (const character of text) {
    const slot = document.createElement("span");
    slot.textContent = character;
    row.append(slot);
  }
  display.replaceChildren(row);
}

function ready() {
  stage = "ready";
  get("progress").textContent = `Trial ${index + 1} of ${trials.length}`;
  feedback.textContent = "";
  drawText("+", "fixation");
  next.hidden = false;
  next.style.visibility = "";
  display.focus({ preventScroll: true });
}

function startTrial() {
  if (stage !== "ready") return;
  stage = "fixation";
  display.focus({ preventScroll: true });
  next.style.visibility = "hidden";
  feedback.textContent = "";
  const trial = trials[index];
  const { word, alternateWord, targetIndex, nonword, alternate, condition } = trial;
  const correct = (alternate ? alternateWord : word)[targetIndex];
  const foil = (alternate ? word : alternateWord)[targetIndex];
  const scrambled = nonword.slice(0, targetIndex) + correct + nonword.slice(targetIndex + 1);
  const letter = correct.padStart(targetIndex + 1).padEnd(4);
  const stimulus = [alternate ? alternateWord : word, scrambled, letter][condition];
  choices = trial.correctSlot === 0 ? [correct, foil] : [foil, correct];

  let exposureEnd;
  let fixationStart;
  let previousFrame;
  function animate(timestamp) {
    if (stage !== "fixation" && stage !== "stimulus") return;
    if (stage === "fixation") {
      fixationStart ??= timestamp;
      if (timestamp - fixationStart >= 500) {
        const frameLength = timestamp - previousFrame;
        // Snap about 50 ms to the nearest estimated display frame.
        exposureEnd = timestamp + Math.max(1, Math.round(50 / frameLength)) * frameLength
          - frameLength / 2;
        stage = "stimulus";
        drawText(stimulus, "stimulus");
      }
    } else if (timestamp >= exposureEnd) {
      showChoices(trial);
      return;
    }
    previousFrame = timestamp;
    animationFrame = requestAnimationFrame(animate);
  }
  animationFrame = requestAnimationFrame(animate);
}

function showChoices(trial) {
  stage = "response";
  const mask = document.createElement("div");
  mask.className = "mask";
  mask.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement("span");
    for (const letter of ["X", "O"]) {
      const glyph = document.createElement("b");
      glyph.textContent = letter;
      slot.append(glyph);
    }
    mask.append(slot);
  }
  display.replaceChildren(mask);
  choices.forEach((letter, slot) => {
    const option = document.createElement("button");
    option.className = "choice";
    option.style.gridColumn = trial.targetIndex + 1;
    option.style.gridRow = slot + 1;
    option.textContent = `${slot + 1} · ${letter}`;
    option.addEventListener("click", () => respond(slot));
    display.append(option);
  });
}

function respond(slot) {
  if (stage !== "response") return;
  const trial = trials[index];
  const correct = slot === trial.correctSlot;
  index++;
  if (!practice) {
    const score = scores[trial.condition];
    score.total++;
    score.correct += Number(correct);
    if (index === trials.length) {
      stage = "done";
      show("done");
    } else {
      ready();
    }
    return;
  }

  if (index < trials.length) {
    ready();
  } else {
    stage = "practice-complete";
    display.replaceChildren();
    next.hidden = true;
    get("scored-start").hidden = false;
    get("scored-start").focus();
  }
  feedback.textContent = correct ? "Correct." : `The correct letter was ${choices[trial.correctSlot]}.`;
}

function results() {
  const chart = get("chart");
  chart.replaceChildren();
  for (const [i, name] of conditions.entries()) {
    const { correct, total } = scores[i];
    const percent = 100 * correct / total;
    const label = document.createElement("div");
    label.className = "score";
    const title = document.createElement("strong");
    title.textContent = name;
    const value = document.createElement("span");
    value.textContent = `${correct}/${total} (${Number(percent.toFixed(2))}%)`;
    label.append(title, value);
    const track = document.createElement("div");
    track.className = "track";
    track.setAttribute("aria-hidden", "true");
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.width = `${percent}%`;
    track.append(bar);
    chart.append(label, track);
  }
  const scale = document.createElement("div");
  scale.className = "scale";
  scale.innerHTML = "<span>0%</span><span>50%</span><span>100%</span>";
  chart.append(scale);
  show("results");
}

get("start").addEventListener("click", () => show("instructions"));
get("practice-start").addEventListener("click", () => begin(true));
get("scored-start").addEventListener("click", () => begin(false));
get("view-results").addEventListener("click", results);
get("try-again").addEventListener("click", () => begin(false));
next.addEventListener("click", startTrial);
document.addEventListener("keydown", (event) => {
  if (event.key === " " && ["ready", "fixation", "stimulus"].includes(stage)) {
    event.preventDefault();
    if (stage === "ready" && !event.repeat) startTrial();
  }
  if (stage === "response" && !event.repeat && ["1", "2"].includes(event.key)) {
    event.preventDefault();
    respond(Number(event.key) - 1);
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && ["fixation", "stimulus", "response"].includes(stage)) {
    cancelAnimationFrame(animationFrame);
    ready();
  }
});

fetch("stimuli.json")
  .then((response) => {
    if (!response.ok) throw new Error("Stimuli unavailable");
    return response.json();
  })
  .then((data) => {
    bank = data;
    get("start").disabled = false;
    get("load-status").textContent = "";
  })
  .catch(() => {
    get("load-status").textContent = "Could not load stimuli. Open this page through a web server.";
  });
