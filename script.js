// Feed attempt history to LLM.

// Logging module
// ===============================
// Secure logging (Cloudflare Worker)
// ===============================

const LOG_ENDPOINT = "https://tol-log-worker.happytreeih2007.workers.dev/";
const LOG_API_KEY = "455f2fafc30aa4f82741d24fc1c4a3d2696b553de1a61d2da434379bb8264116";

// ===============================
// Study-day tagging
// ===============================
const STUDY_DAY = "2026-04-14";  // 🔴 CHANGE THIS ON EACH TEST DAY

// Anonymous per‑session id
const SESSION_ID = crypto.randomUUID();
const PAGE_NAME = "tol-project";

function logEvent(event, data = {}) {
  const payload = {
    sessionId: SESSION_ID,
    page: PAGE_NAME,
    event,
    timestamp: new Date().toISOString(),
    study_day: STUDY_DAY,
    ...data
  };

  return fetch(LOG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": LOG_API_KEY
    },
    body: JSON.stringify(payload),
    keepalive: true
  });
}

// ===============================
// Per-attempt timing (GLOBAL)
// ===============================
const attemptStartTimes = {};
const attemptCounters = {};

function beginAttempt(questionId) {
  if (!attemptCounters[questionId]) {
    attemptCounters[questionId] = 1;
  } else {
    attemptCounters[questionId]++;
  }

  const attempt = attemptCounters[questionId];
  attemptStartTimes[`${questionId}-a${attempt}`] = Date.now();
  return attempt;
}

function finishAttempt(questionId, attempt, extra = {}) {
  const key = `${questionId}-a${attempt}`;
  const start = attemptStartTimes[key];
  if (!start) return;

  logEvent("attempt_time", {
    question: questionId,
    attempt,
    ms_spent: Date.now() - start,
    ...extra
  });

  delete attemptStartTimes[key];
}

// ===============================
// Section-level timing
// ===============================

const sectionStartTimes = {};

function startSection(sectionName) {
  sectionStartTimes[sectionName] = Date.now();
}

function endSection(sectionName) {
  const start = sectionStartTimes[sectionName];
  if (!start) return;

  logEvent("section_time", {
    section: sectionName,
    ms_spent: Date.now() - start
  });

  delete sectionStartTimes[sectionName];
}

// ===============================
// Practice 3 revision history
// ===============================
const practice3History = {};


// Intro & Explanation audio
const audioMap = {
    q1: new Audio("audio/tol-1.mp3"),
    q2: new Audio("audio/tol-2.mp3"),
    exp1: new Audio("audio/exp1.mp3"),
    exp2: new Audio("audio/exp2.mp3")
};

document.querySelectorAll(".audio").forEach(button => {
    button.style.cursor = "pointer"; 
    button.addEventListener("click", () => {
        const audioKey = button.dataset.name;

// ✅ NEW: determine section based on audio key
    const section =
      audioKey === "q1" || audioKey === "q2"
        ? "intro"
        : "explanation";

    // ✅ NEW: log audio play
    logEvent("audio_play", {
      audio_id: audioKey,
      section
    });

        if(audioMap[audioKey]) {
            audioMap[audioKey].currentTime = 0;
            audioMap[audioKey].play();
        };
    });
});

const introInput = document.getElementById("intro-answer");
const feedbackIntro = document.getElementById("feedback-intro");
const checkIntro = document.getElementById("check-intro");

// Intro - check answer
checkIntro.addEventListener("click", () => {
    const answer = introInput.value.trim();
    
    logEvent("intro_submission", {
    question: "kara-function",
    answer_raw: answer,
    empty: answer === ""
});

    const inputValue = introInput.value.trim();
    if(inputValue==="") {
    feedbackIntro.textContent = "Please enter your answer before checking.";
    feedbackIntro.style.color = "red";
} else {
    feedbackIntro.textContent = "「から」marks the reason of a situation."
    feedbackIntro.style.color = "green";
};
});

// Intro - reset
const resetIntro = document.getElementById("reset-intro");

resetIntro.addEventListener("click", () => {
    introInput.value = "";
    feedbackIntro.textContent = "";
})

// Intro - continue
const continueIntro = document.getElementById("continue-intro");
const explanation = document.getElementById("explanation");

continueIntro.addEventListener("click", () => {
  endSection("intro");

  explanation.style.display = "block";
  startSection("explanation");

  explanation.scrollIntoView({ behavior: "smooth" });
});

// Explanation - continue
const continueExp = document.getElementById("continue-explanation");
const practiceOne = document.getElementById("practice-1");

continueExp.addEventListener("click", () => {
  endSection("explanation");

  practiceOne.style.display = "block";
  startSection("practice-1");

  practiceOne.scrollIntoView({ behavior: "smooth" });
});

// Practice1 - Q1
const tilesOne = document.querySelectorAll(".tile-q1");
const slotsOne = document.querySelectorAll(".slot-q1");
const feedbackOne1 = document.getElementById("feedback-p1-1");
const resetOne1 = document.getElementById("reset-p1-1"); 
const checkOne1 = document.getElementById("check-p1-1");
const bankOne1 = document.getElementById("tiles-1"); 
let draggedTileOne = null;
let p1q1Attempt = null;

tilesOne.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        if (!p1q1Attempt) {
            p1q1Attempt = beginAttempt("p1-q1");
        }
        draggedTileOne = tile;
        tile.classList.add("dragging");
    });

    tile.addEventListener("dragend", () => {
        tile.classList.remove("dragging");
        draggedTileOne = null;
    });
});

slotsOne.forEach(slot => {
    slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("over");
    });
    slot.addEventListener("dragleave", () => {
        slot.classList.remove("over");
    });
    slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("over");

        if(!draggedTileOne) return;

        const existingTile = slot.querySelector(".tile-q1");
        if(existingTile) {
            bankOne1.appendChild(existingTile);
        };
        slot.textContent = "";
        slot.appendChild(draggedTileOne);
        feedbackOne1.textContent = "";
    });
});

checkOne1.addEventListener("click", () => {
    let allCorrect = true;
    slotsOne.forEach(slot => {
        const slotCorrect = slot.dataset.correct;
        const tile = slot.querySelector(".tile-q1");
        
        if(!tile) {
            feedbackOne1.textContent = "One or more tiles are missing. Please fill all tile slots.";
            feedbackOne1.style.color = "red";
            allCorrect = false;
            return;
        };
        
        const tileName = tile.dataset.name;
        if(slotCorrect != tileName) {
            allCorrect = false;
        };
     });
     if(allCorrect) {
        feedbackOne1.textContent = "✅　正解（せいかい）！This sentence means, 'Since I have two tickets, why don't we got to the movies?'";
        feedbackOne1.style.color = "green";
     } else {
        feedbackOne1.textContent = "❌　不正解（ふせいかい）！Remember the structure 「<Reason>から、<Situation>」. Which is the reason - going to the movies or having two tickets?";
        feedbackOne1.style.color = "red";
     };  
     
     logEvent("practice1_check", {
        question: "p1-q1",
        correct: allCorrect,
        attempt: p1q1Attempt
    });
    finishAttempt("p1-q1", p1q1Attempt, { correct: allCorrect });
    p1q1Attempt = null; // reset for next attempt
});

resetOne1.addEventListener("click", () => {
    document.querySelectorAll(".slot-q1 .tile-q1").forEach(tile => {
        bankOne1.appendChild(tile);
    });
    slotsOne.forEach(slot => {
        slot.textContent = slot.dataset.type === "reason" ? "Reason" : "Situation";
    });
    feedbackOne1.textContent = "";
});

// Practice1 - Q2
const tilesTwo = document.querySelectorAll(".tile-q2");
const slotsTwo = document.querySelectorAll(".slot-q2");
const feedbackOne2 = document.getElementById("feedback-p1-2");
const resetOne2 = document.getElementById("reset-p1-2"); 
const checkOne2 = document.getElementById("check-p1-2");
const bankOne2 = document.getElementById("tiles-2"); 
let draggedTileTwo = null;
let p1q2Attempt = null;

tilesTwo.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        if (!p1q2Attempt) {
            p1q2Attempt = beginAttempt("p1-q2");
        }
        draggedTileTwo = tile;
        tile.classList.add("dragging");
    });

    tile.addEventListener("dragend", () => {
        tile.classList.remove("dragging");
        draggedTileTwo = null;
    });
});

slotsTwo.forEach(slot => {
    slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("over");
    });
    slot.addEventListener("dragleave", () => {
        slot.classList.remove("over");
    });
    slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("over");

        if(!draggedTileTwo) return;

        const existingTile = slot.querySelector(".tile-q2");
        if(existingTile) {
            bankOne2.appendChild(existingTile);
        };
        slot.textContent = "";
        slot.appendChild(draggedTileTwo);
        feedbackOne2.textContent = "";
    });
});

checkOne2.addEventListener("click", () => {
    let allCorrect = true;
    slotsTwo.forEach(slot => {
        const slotCorrect = slot.dataset.correct;
        const tile = slot.querySelector(".tile-q2");
        
        if(!tile) {
            feedbackOne2.textContent = "One or more tiles are missing. Please fill all tile slots.";
            feedbackOne2.style.color = "red";
            allCorrect = false;
            return;
        };
        
        const tileName = tile.dataset.name;
        if(slotCorrect != tileName) {
            allCorrect = false;
        };
     });
     if(allCorrect) {
        feedbackOne2.textContent = "✅　正解（せいかい）！This sentence means, 'Since I have class from 9am to 4pm every day, I am very busy.'";
        feedbackOne2.style.color = "green";
     } else {
        feedbackOne2.textContent = "❌　不正解（ふせいかい）！Remember the structure 「<Reason>から、<Situation>」. Which is the reason - having class from 9am-4pm or being very busy?";
        feedbackOne2.style.color = "red";
     };  

     logEvent("practice1_check", {
        question: "p1-q2",
        correct: allCorrect,
        attempt: p1q2Attempt
    });
    finishAttempt("p1-q2", p1q2Attempt, { correct: allCorrect });
    p1q2Attempt = null; // reset for next attempt
});

resetOne2.addEventListener("click", () => {
    document.querySelectorAll(".slot-q2 .tile-q2").forEach(tile => {
        bankOne2.appendChild(tile);
    });
    slotsTwo.forEach(slot => {
        slot.textContent = slot.dataset.type === "reason" ? "Reason" : "Situation";
    });
    feedbackOne2.textContent = "";
});

// Practice1 - Q3
const tilesThree = document.querySelectorAll(".tile-q3");
const slotsThree = document.querySelectorAll(".slot-q3");
const checkOne3 = document.getElementById("check-p1-3");
const resetOne3 = document.getElementById("reset-p1-3");
const feedbackOne3 = document.getElementById("feedback-p1-3");
const bankOne3 = document.getElementById("tiles-3");
let draggedTile3 = null;
let p1q3Attempt = null;

tilesThree.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        if (!p1q3Attempt) {
            p1q3Attempt = beginAttempt("p1-q3");
        }
        draggedTile3 = tile;
        tile.classList.add("dragging");
    });

    tile.addEventListener("dragend", () => {
        tile.classList.remove("dragging");
        draggedTile3 = null;
    });
})

slotsThree.forEach(slot => {
    slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("over");
    });
    slot.addEventListener("dragleave", () => {
        slot.classList.remove("over");
    });
    slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("over");

        if(!draggedTile3) return;

        const existingTile = slot.querySelector(".tile-q3");
        if(existingTile) {
            bankOne3.appendChild(existingTile);
        };
        slot.textContent = "";
        slot.appendChild(draggedTile3);
        feedbackOne3.textContent = "";
    });
});

checkOne3.addEventListener("click", () => {
    let allCorrect = true;
    slotsThree.forEach(slot => {
        const slotCorrect = slot.dataset.correct;
        const tile = slot.querySelector(".tile-q3");

        if(!tile) {
            feedbackOne3.textContent = "One or more tiles are missing. Please fill all tile slots.";
            feedbackOne3.style.color = "red";
            allCorrect = false;
            return;
        };

        const tileName = tile.dataset.name;
        if(tileName !== slotCorrect) {
            allCorrect = false;
        };
    });
    if(allCorrect) {
        feedbackOne3.textContent = "✅　正解（せいかい）！This sentence means, 'Since I like sushi, I eat it every day.'";
        feedbackOne3.style.color = "green";
    } else {
        feedbackOne3.textContent = "❌　不正解（ふせいかい）！Remember the structure 「<Reason>から、<Situation>」. Which is the reason - eating sushi every day or liking sushi?";
        feedbackOne3.style.color = "red";
    };

    logEvent("practice1_check", {
        question: "p1-q3",
        correct: allCorrect,
        attempt: p1q3Attempt
    });
    finishAttempt("p1-q3", p1q3Attempt, { correct: allCorrect });
    p1q3Attempt = null; // reset for next attempt
});

resetOne3.addEventListener("click", () => {
    document.querySelectorAll(".slot-q3 .tile-q3").forEach(tile => {
        bankOne3.appendChild(tile);
    });
    slotsThree.forEach(slot => {
        slot.textContent = slot.dataset.type === "reason" ? "Reason" : "Situation";
    });
    feedbackOne3.textContent = "";
});

// Practice1 - continue
const continueP1 = document.getElementById("continue-p1");
const practiceTwo = document.getElementById("practice-2")

continueP1.addEventListener("click", () => {
  endSection("practice-1");

  practiceTwo.style.display = "block";
  startSection("practice-2");

  practiceTwo.scrollIntoView({ behavior: "smooth" });
});

// Practice2 Q1
const tilesTwo1 = document.querySelectorAll(".tile-p2-q1");
const slotsTwo1 = document.querySelectorAll(".slot-p2-q1");
const bankTwo1 = document.getElementById("tiles-p2-q1");
const checkTwo1 = document.getElementById("check-p2-q1");
const resetTwo1 = document.getElementById("reset-p2-q1");
const feedbackTwo1 = document.getElementById("feedback-p2-q1");
let draggedTileTwo1 = null;
let p2q1Attempt = null;

// dragstart/end
tilesTwo1.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        if (!p2q1Attempt) {
            p2q1Attempt = beginAttempt("p2-q1");
        }
        draggedTileTwo1 = tile;
        tile.classList.add("dragging");
    });

    tile.addEventListener("dragend", () => {
        tile.classList.remove("dragging");
        draggedTileTwo1 = null;
    });
});

// slot dragover/drop
slotsTwo1.forEach(slot => {
    slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("over");
    });

    slot.addEventListener("dragleave", () => {
        slot.classList.remove("over");
    });

    slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("over");

        if(!draggedTileTwo1) {
            return;
        };
        const existingTileTwo1 = slot.querySelector(".tile-p2-q1");
        if(existingTileTwo1) {
            bankTwo1.appendChild(existingTileTwo1);
        };
        slot.appendChild(draggedTileTwo1);
    });
});

// check answers
checkTwo1.addEventListener("click", () => {
    let allCorrect = true;
    let missingTile = false;

    tilesTwo1.forEach(tile => tile.classList.remove("incorrect"));

    slotsTwo1.forEach(slot => {
        const tile = slot.querySelector(".tile-p2-q1");

        if(!tile) {
            missingTile = true;
            allCorrect = false;
            return;
        };

        const tileName = tile.dataset.name;
        const slotCorrect = slot.dataset.correct;
        if(tileName != slotCorrect) {
            allCorrect = false;
            tile.classList.add("incorrect");
        };
    });

    if(missingTile) {
        feedbackTwo1.textContent = "One or more tiles are missing. Please fill all slots.";
        feedbackTwo1.style.color = "red";
    } else if(allCorrect) {
        feedbackTwo1.textContent = "✅　正解（せいかい）！";
        feedbackTwo1.style.color = "green";
    } else {
        feedbackTwo1.textContent = "Highlighted tiles are incorrect. Remember the 「<Reason>から、<Situation>」 structure. It should be '(Japanese is fun)から、(like)'.";
        feedbackTwo1.style.color = "red";
    };

    const answers = Array.from(slotsTwo1).map(slot => {
        const tile = slot.querySelector(".tile-p2-q1");
        return tile ? tile.dataset.name : null;
    });
    
    logEvent("practice2_submission", {
    question: "p2-q1",
    attempt: p2q1Attempt,
    correct: allCorrect,
    answers_raw: answers,
    missing: missingTile
});
finishAttempt("p2-q1", p2q1Attempt, { correct: allCorrect });
p2q1Attempt = null;
});

// reset
resetTwo1.addEventListener("click", () => {
    document.querySelectorAll(".slot-p2-q1 .tile-p2-q1").forEach(tile => {
        bankTwo1.appendChild(tile);
        tile.classList.remove("incorrect");
    });
    feedbackTwo1.textContent = "";
});

// Practice 2 Q2
const tilesTwo2 = document.querySelectorAll(".tile-p2-q2");
const slotsTwo2 = document.querySelectorAll(".slot-p2-q2");
const bankTwo2 = document.getElementById("tiles-p2-q2");
const checkTwo2 = document.getElementById("check-p2-q2");
const resetTwo2 = document.getElementById("reset-p2-q2");
const feedbackTwo2 = document.getElementById("feedback-p2-q2");
let draggedTileTwo2 = null;
let p2q2Attempt = null;

// dragstart/end
tilesTwo2.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        if (!p2q2Attempt) {
            p2q2Attempt = beginAttempt("p2-q2");
        }
        draggedTileTwo2 = tile;
        tile.classList.add("dragging");
    });

    tile.addEventListener("dragend", () => {
        tile.classList.remove("dragging");
        draggedTileTwo2 = null;
    });
});

// slot dragover/drop
slotsTwo2.forEach(slot => {
    slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("over");
    });

    slot.addEventListener("dragleave", () => {
        slot.classList.remove("over");
    });

    slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("over");

        if(!draggedTileTwo2) {
            return;
        };
        const existingTileTwo2 = slot.querySelector(".tile-p2-q2");
        if(existingTileTwo2) {
            bankTwo2.appendChild(existingTileTwo2);
        };
        slot.appendChild(draggedTileTwo2);
    });
});

// check answers
checkTwo2.addEventListener("click", () => {
    let allCorrect = true;
    let missingTile = false;

    tilesTwo2.forEach(tile => tile.classList.remove("incorrect"));

    slotsTwo2.forEach(slot => {
        const tile = slot.querySelector(".tile-p2-q2");

        if(!tile) {
            missingTile = true;
            allCorrect = false;
            return;
        };

        const tileName = tile.dataset.name;
        const slotCorrect = slot.dataset.correct;
        if(tileName != slotCorrect) {
            allCorrect = false;
            tile.classList.add("incorrect");
        };
    });

    if(missingTile) {
        feedbackTwo2.textContent = "One or more tiles are missing. Please fill all slots.";
        feedbackTwo2.style.color = "red";
    } else if(allCorrect) {
        feedbackTwo2.textContent = "✅　正解（せいかい）！";
        feedbackTwo2.style.color = "green";
    } else {
        feedbackTwo2.textContent = "Highlighted tiles are incorrect. Remember the 「<Reason>から、<Situation>」 structure. It should be '(Winter is cold)から、(dislike)'.";
        feedbackTwo2.style.color = "red";
    };

    const answers = Array.from(slotsTwo2).map(slot => {
        const tile = slot.querySelector(".tile-p2-q2");
        return tile ? tile.dataset.name : null;
    });

    logEvent("practice2_submission", {
    question: "p2-q2",
    attempt: p2q2Attempt,
    correct: allCorrect,
    answers_raw: answers,
    missing: missingTile
});
finishAttempt("p2-q2", p2q2Attempt, { correct: allCorrect });
p2q2Attempt = null;
});

// reset
resetTwo2.addEventListener("click", () => {
    document.querySelectorAll(".slot-p2-q2 .tile-p2-q2").forEach(tile => {
        bankTwo2.appendChild(tile);
        tile.classList.remove("incorrect");
    });
    feedbackTwo2.textContent = "";
});

// Practice 2 Q3
const tilesTwo3 = document.querySelectorAll(".tile-p2-q3");
const slotsTwo3 = document.querySelectorAll(".slot-p2-q3");
const bankTwo3 = document.getElementById("tiles-p2-q3");
const checkTwo3 = document.getElementById("check-p2-q3");
const resetTwo3 = document.getElementById("reset-p2-q3");
const feedbackTwo3 = document.getElementById("feedback-p2-q3");
let draggedTileTwo3 = null;
let p2q3Attempt = null;

// dragstart, dragend
tilesTwo3.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        if (!p2q3Attempt) {
            p2q3Attempt = beginAttempt("p2-q3");
        }
        draggedTileTwo3 = tile;
        tile.classList.add("dragging");
    });

    tile.addEventListener("dragend", () => {
        tile.classList.remove("dragging");
        draggedTileTwo3 = null;
    });
});

// dragover, drop
slotsTwo3.forEach(slot => {
    slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        slot.classList.add("over");
    });
    slot.addEventListener("dragleave", () => {
        slot.classList.remove("over");
    });
    slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("over");

        if(!draggedTileTwo3) return;

        const existingTileTwo3 = slot.querySelector(".tile-p2-q3");
        if(existingTileTwo3) {
            bankTwo3.appendChild(existingTileTwo3)
        };
        slot.appendChild(draggedTileTwo3);
    });
});

// check answer
checkTwo3.addEventListener("click", () => {
    let allCorrect = true;
    let missingTile = false;

    tilesTwo3.forEach(tile => tile.classList.remove("incorrect"));

    slotsTwo3.forEach(slot => {
        const tile = slot.querySelector(".tile-p2-q3");

        if(!tile) {
            allCorrect = false;
            missingTile = true;
            return;
        };
        const slotCorrect = slot.dataset.correct;
        const tileName = tile.dataset.name;
        if(slotCorrect != tileName) {
            allCorrect = false;
            tile.classList.add("incorrect");
        };
    });
        if(allCorrect) {
            feedbackTwo3.textContent = "✅　正解（せいかい）！";
            feedbackTwo3.style.color = "green";
        } else if(missingTile) {
            feedbackTwo3.textContent = "One or more tiles are missing. Please fill all slots.";
            feedbackTwo3.style.color = "red";
        } else {
            feedbackTwo3.textContent = "Highlighted tiles are incorrect. Remember the 「<Reason>から、<Situation>」 structure. It should be '(Will study)から、(will not go to the party)'.";
            feedbackTwo3.style.color = "red";
        };

    const answers = Array.from(slotsTwo3).map(slot => {
        const tile = slot.querySelector(".tile-p2-q3");
        return tile ? tile.dataset.name : null;
    });

    logEvent("practice2_submission", {
    question: "p2-q3",
    attempt: p2q3Attempt,
    correct: allCorrect,
    answers_raw: answers,
    missing: missingTile
});
finishAttempt("p2-q3", p2q3Attempt, { correct: allCorrect });
p2q3Attempt = null;
});

// reset
resetTwo3.addEventListener("click", () => {
    document.querySelectorAll(".slot-p2-q3 .tile-p2-q3").forEach(tile => {
        bankTwo3.appendChild(tile);
        tile.classList.remove("incorrect");
    });
    feedbackTwo3.textContent = "";
});

// Practice2 continue
const continueP2 = document.getElementById("continue-p2");
const practiceThree = document.getElementById("practice-3");

continueP2.addEventListener("click", () => {
  endSection("practice-2");

  practiceThree.style.display = "block";
  startSection("practice-3");

  practiceThree.scrollIntoView({ behavior: "smooth" });
});

// Practice3
let p3Attempts = {};

async function checkPractice3(q) {

  const input    = document.getElementById(`input-p3-${q}`);
  const feedback = document.getElementById(`feedback-p3-${q}`);
  const answer   = (input.value || "").trim();
  const questionId = `p3-q${q}`;

  // ✅ Fix: Start the attempt and get the number
  if (!p3Attempts[questionId]) {
    p3Attempts[questionId] = beginAttempt(questionId);
  }
  const attempt = p3Attempts[questionId];

  if (!practice3History[questionId]) {
    practice3History[questionId] = [];
}

  if (!answer) {
    feedback.textContent = "Please write a sentence that uses 「から」.";
    feedback.style.color = "red";
    return;
  }
  
  const attemptNumber = practice3History[questionId].length + 1;
  practice3History[questionId].push({
    attempt: attemptNumber,
    learner_input: answer
});
  
  logEvent("practice3_submission", {
  question: questionId,
  attempt,                 
  answer_raw: answer
});

  feedback.textContent = "Evaluating your sentence…";
  feedback.style.color = "#555";

  try {
    const res = await fetch("https://tol-llm-worker.happytreeih2007.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Browser sets Origin automatically; Worker checks it
      body: JSON.stringify({
        response_text: answer,
        learning_objective: "Learner can create their own sentence using the <Reason>から、<Situation> sentence structure correctly.",
        criteria: [
            "The reason marker から is used appropriately. The reason is marked with から, followed by the situation.",
            "Verbs, adjectives and nouns are conjugated correctly in the です／ます form",
            "Vocabulary usage is correct",
            "Particle usage is correct"
        ],
        revision_context: practice3History[questionId]
    })
    });

    const data = await res.json();
// ✅ Ensure the history is updated
practice3History[questionId][attemptNumber - 1].feedback = data;

// ✅ Fix: Capture the actual attempt number from your history or counter
const currentAttempt = attemptNumber; 

await logEvent("practice3_feedback", {
  question: questionId,
  attempt: currentAttempt,
  verdict: data.verdict || null,
  // ✅ Verify this key: In worker (2).js, you instructed the LLM 
  // to output 'perhaps_you_meant'. This line ensures it maps correctly.
  perhaps_you_meant: data.perhaps_you_meant || null, 
  criteria_feedback: data.criteria_feedback || null,
  next_step: data.next_step || null
});

    // Render: verdict + bullets
    const lines = [];
    if (data.verdict) lines.push(`Verdict: ${data.verdict}`);
    if (data.perhaps_you_meant) {
        lines.push(`Perhaps you were trying to say: ${data.perhaps_you_meant}`);
    }
    if (Array.isArray(data.criteria_feedback) && data.criteria_feedback.length) {
        data.criteria_feedback.forEach(item => {
            lines.push(`${item.met ? "✅" : "❌"} ${item.criterion} — ${item.comment}`);
        });
    }
    if (data.next_step) lines.push(`Next step: ${data.next_step}`);

    feedback.textContent = lines.join("\n");
    feedback.style.whiteSpace = "pre-wrap";
    feedback.style.color = (data.verdict === "Correct") ? "green" : "purple";
    
    finishAttempt(questionId, attempt);
    p3Attempts[questionId] = null;
  } catch (err) {
    feedback.textContent = "Temporary issue contacting the feedback service. Please try again.";
    feedback.style.color = "red";
    console.error(err);
  }
}
// Attach Practice-3 button handlers (Q1–Q2)
[1, 2].forEach(q => {
  const btnCheck = document.getElementById(`check-p3-${q}`);
  const btnReset = document.getElementById(`reset-p3-${q}`);
  const input = document.getElementById(`input-p3-${q}`);
  const feedback = document.getElementById(`feedback-p3-${q}`);

  btnCheck?.addEventListener("click", (e) => {
    e.preventDefault();
    checkPractice3(q);
  });

  btnReset?.addEventListener("click", (e) => {
    e.preventDefault();
    if (input) input.value = "";
    if (feedback) feedback.textContent = "";
    input?.focus();
  });
});

// Start timing Intro when page loads
document.addEventListener("DOMContentLoaded", () => {
  startSection("intro");
});

// Capture time if learner leaves early
window.addEventListener("beforeunload", () => {
  Object.keys(sectionStartTimes).forEach(section => {
    endSection(section);
  });
});

// show thank you text
const lastButton = document.getElementById("end");
const thanks = document.getElementById("thanks");

lastButton.addEventListener("click", () => {
    endSection("practice-3");
    thanks.style.display = "block";
});
