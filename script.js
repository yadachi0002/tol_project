// Logging module
// ===============================
// Secure logging (Cloudflare Worker)
// ===============================

const LOG_ENDPOINT = "https://tol-log-worker.happytreeih2007.workers.dev/";
const LOG_API_KEY = "455f2fafc30aa4f82741d24fc1c4a3d2696b553de1a61d2da434379bb8264116";

// Anonymous per‑session id
const SESSION_ID = crypto.randomUUID();
const PAGE_NAME = "tol-project";

function logEvent(event, data = {}) {
  const payload = {
    sessionId: SESSION_ID,
    page: PAGE_NAME,
    event,
    timestamp: new Date().toISOString(),
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
// Per-question timing
// ===============================

const questionStartTimes = {};

function startQuestion(questionId) {
  // Only start once
  if (questionStartTimes[questionId]) return;

  questionStartTimes[questionId] = Date.now();

  logEvent("question_start", {
    question: questionId
  });
}

function endQuestion(questionId, extra = {}) {
  const start = questionStartTimes[questionId];
  if (!start) return;

  logEvent("question_time", {
    question: questionId,
    ms_spent: Date.now() - start,
    ...extra
  });

  delete questionStartTimes[questionId];
}

// Log all button clicks
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  logEvent("button_click", {
    buttonId: btn.id,
    label: btn.textContent.trim()
  });
});

// Log input typing just for non-question inputs
document.querySelectorAll("input:not(.input-p2):not(.input-p3)").forEach(input => {
  input.addEventListener("input", () => {
    logEvent("input_started", { inputId: input.id });
  }, { once: true });
});
``

// ===============================
// Section-level timing
// ===============================

const sectionStartTimes = {};

function startSection(sectionName) {
  sectionStartTimes[sectionName] = Date.now();

  logEvent("section_view", {
    section: sectionName
  });
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


// Intro
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

tilesOne.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        startQuestion("p1-q1");
        draggedTileOne = tile;
        tile.classList.add("dragging");

        logEvent("drag_start", {
            tile: tile.dataset.name,
            question: "p1-q1"
        });
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

        logEvent("tile_drop", {
            tile: draggedTileOne.dataset.name,
            slot: slot.dataset.type,
            question: "p1-q1"
        });
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
        correct: allCorrect
    });
    
    endQuestion("p1-q1", {
        correct: allCorrect
    });
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

tilesTwo.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        startQuestion("p1-q2");
        draggedTileTwo = tile;
        tile.classList.add("dragging");

         logEvent("drag_start", {
            tile: tile.dataset.name,
            question: "p1-q2"
        });
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

        logEvent("tile_drop", {
            tile: draggedTileTwo.dataset.name,
            slot: slot.dataset.type,
            question: "p1-q2"
        });
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
        correct: allCorrect
    });

    endQuestion("p1-q2", {
        correct: allCorrect
    });
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

tilesThree.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        startQuestion("p1-q3");
        draggedTile3 = tile;
        tile.classList.add("dragging");

         logEvent("drag_start", {
            tile: tile.dataset.name,
            question: "p1-q3"
        });
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

        logEvent("tile_drop", {
            tile: draggedTile3.dataset.name,
            slot: slot.dataset.type,
            question: "p1-q3"
        });
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
        correct: allCorrect
    });

    endQuestion("p1-q3", {
        correct: allCorrect
    });
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

// Practice1 - Q4
const tilesFour = document.querySelectorAll(".tile-q4");
const slotsFour = document.querySelectorAll(".slot-q4");
const checkOne4 = document.getElementById("check-p1-4");
const resetOne4 = document.getElementById("reset-p1-4");
const feedbackOne4 = document.getElementById("feedback-p1-4");
const bankOne4 = document.getElementById("tiles-4")
let draggedTile4 = null;

tilesFour.forEach(tile => {
    tile.addEventListener("dragstart", () => {
        startQuestion("p1-q4");
        draggedTile4 = tile;
        tile.classList.add("dragging");

         logEvent("drag_start", {
            tile: tile.dataset.name,
            question: "p1-q4"
        });
    });
    tile.addEventListener("dragend", () => {
        tile.classList.remove("dragging");
        draggedTile4 = null;
    });
});

slotsFour.forEach(slot => {
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

        if(!draggedTile4) return;

        const existingTile = slot.querySelector(".tile-q4");
        if(existingTile) {
            bankOne4.appendChild(existingTile);
        };
        slot.textContent = "";
        slot.appendChild(draggedTile4);
        feedbackOne4.textContent = "";

        logEvent("tile_drop", {
            tile: draggedTile4.dataset.name,
            slot: slot.dataset.type,
            question: "p1-q4"
        });
    });
});

checkOne4.addEventListener("click", () => {
    let allCorrect = true;
    slotsFour.forEach(slot => {
        const slotCorrect = slot.dataset.correct;
        const tile = slot.querySelector(".tile-q4");

        if(!tile) {
            feedbackOne4.textContent = "One or more tiles are missing. Please fill all tile slots.";
            feedbackOne4.style.color = "red";
        };
        const tileName = tile.dataset.name;
        if(slotCorrect != tileName) {
            allCorrect = false;
        };
    });
    if(allCorrect) {
        feedbackOne4.textContent = "✅　正解（せいかい）！This sentence means, 'Since I have a test tomorrow, I will study Kanji.'";
        feedbackOne4.style.color = "green";
    } else {
        feedbackOne4.textContent = "❌　不正解（ふせいかい）！Remember the structure 「<Reason>から、<Situation>」. Which is the reason - having a test tomorrow or studying Kanji?";
        feedbackOne4.style.color = "red";
    };

    logEvent("practice1_check", {
        question: "p1-q4",
        correct: allCorrect
    });

    endQuestion("p1-q4", {
        correct: allCorrect
    });
});

resetOne4.addEventListener("click", () => {
    document.querySelectorAll(".slot-q4 .tile-q4").forEach(tile => {
        bankOne4.appendChild(tile);
    });
    slotsFour.forEach(slot => {
        slot.textContent = slot.dataset.type === "reason" ? "Reason" : "Situation";
    });
    feedbackOne4.textContent = "";
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
const answers1 = [
    "日本語は楽しいですから",
    "日本語はたのしいですから",
    "にほんごは楽しいですから",
    "にほんごはたのしいですから",
    "日本語は楽しいから",
    "日本語はたのしいから",
    "にほんごは楽しいから",
    "にほんごはたのしいから"
];

const input1 = document.getElementById("input-p2-1");
const feedbackTwo1 = document.getElementById("feedback-p2-1");
const checkTwo1 = document.getElementById("check-p2-1");
const resetTwo1 = document.getElementById("reset-p2-1");

input1.addEventListener("input", () => {
    startQuestion("p2-q1");
}, { once: true });

checkTwo1.addEventListener("click", () => {
    const value = input1.value.trim();

    if(value === "") {
        feedbackTwo1.textContent = "Please enter an answer before checking.";
        feedbackTwo1.style.color = "red";
        return;
    };
    const isCorrect = answers1.includes(value);

    if(isCorrect) {
        feedbackTwo1.textContent = "✅　正解（せいかい）！This sentence means, 'Because Japanese is fun, I like it.'";
        feedbackTwo1.style.color = "green";
    } else {
        feedbackTwo1.textContent = "❌　不正解（ふせいかい）！Remember the structure 「<Reason>から、<Situation>」. Don't forget から to mark the reason. The adjective 'fun' is たのしい and is an i-adjective.";
        feedbackTwo1.style.color = "red";
    };

    logEvent("practice2_submission", {
        question: "p2-q1",
        answer_raw: value,
        correct: isCorrect
    });
    
    endQuestion("p2-q1", {
        correct: isCorrect
    });

});

resetTwo1.addEventListener("click", () => {
    input1.value = "";
    feedbackTwo1.textContent = "";
});

// Practice2 Q2
const answers2 = [
    "田中さんは優しいですから",
    "田中さんはやさしいですから",
    "たなかさんは優しいですから",
    "たなかさんはやさしいですから",
    "田中さんは優しいから",
    "田中さんはやさしいから",
    "たなかさんは優しいから",
    "たなかさんはやさしいから"
];
const input2 = document.getElementById("input-p2-2");
const feedbackTwo2 = document.getElementById("feedback-p2-2");
const checkTwo2 = document.getElementById("check-p2-2");
const resetTwo2 = document.getElementById("reset-p2-2");

input2.addEventListener("input", () => {
    startQuestion("p2-q2");
}, { once: true });

checkTwo2.addEventListener("click", () => {
    const value = input2.value.trim();
    if(value === "") {
        feedbackTwo2.textContent = "Please enter an answer before checking.";
        feedbackTwo2.style.color = "red";
        return;
    };
    const isCorrect = answers2.includes(value)
    if(isCorrect) {
        feedbackTwo2.textContent = "✅　正解（せいかい）！This sentence means, 'Because Tanaka-san is kind, I like them.'";
        feedbackTwo2.style.color = "green";
    } else {
        feedbackTwo2.textContent = "❌　不正解（ふせいかい）！Remember the structure 「<Reason>から、<Situation>」. Don't forget から to mark the reason. The adjective 'kind' is やさしい and is an i-adjective.";
        feedbackTwo2.style.color = "red";
    };

    logEvent("practice2_submission", {
        question: "p2-q2",
        answer_raw: value,
        correct: isCorrect
    });

    endQuestion("p2-q2", {
        correct: isCorrect
    });
});

resetTwo2.addEventListener("click", () => {
    input2.value = "";
    feedbackTwo2.textContent = "";
});

// Practice2 Q3
const answers3 = [
    "冬は寒いですから",
    "冬はさむいですから",
    "ふゆは寒いですから",
    "ふゆはさむいですから",
    "冬は寒いから",
    "冬はさむいから",
    "ふゆは寒いから",
    "ふゆはさむいから",
];
const input3 = document.getElementById("input-p2-3");
const feedbackTwo3 = document.getElementById("feedback-p2-3");
const checkTwo3 = document.getElementById("check-p2-3");
const resetTwo3 = document.getElementById("reset-p2-3");

input3.addEventListener("input", () => {
    startQuestion("p2-q3");
}, { once: true });

checkTwo3.addEventListener("click", () => {
    const value = input3.value.trim();
    if(value === "") {
        feedbackTwo3.textContent = "Please enter an answer before checking.";
        feedbackTwo3.style.color = "red";
        return;
    };
    const isCorrect = answers3.includes(value);
    if(isCorrect) {
        feedbackTwo3.textContent = "✅　正解（せいかい）！This sentence means, 'Because winter is very cold, I don't like it.'";
        feedbackTwo3.style.color = "green";
    } else {
        feedbackTwo3.textContent = "❌　不正解（ふせいかい）！Remember the structure 「<Reason>から、<Situation>」. Don't forget から to mark the reason. The adjective 'cold' is さむい and is an i-adjective.";
        feedbackTwo3.style.color = "red";
    };

    logEvent("practice2_submission", {
        question: "p2-q3",
        answer_raw: value,
        correct: isCorrect
    });

    endQuestion("p2-q3", {
        correct: isCorrect
    });
});

resetTwo3.addEventListener("click", () => {
    input3.value = "";
    feedbackTwo3.textContent = "";
});

// Practice2 Q4
const answers4 = [
    "勉強しますから",
    "べんきょうしますから",
    "勉強するから",
    "べんきょうするから",
];
const input4 = document.getElementById("input-p2-4");
const feedbackTwo4 = document.getElementById("feedback-p2-4");
const checkTwo4 = document.getElementById("check-p2-4");
const resetTwo4 = document.getElementById("reset-p2-4");

input4.addEventListener("input", () => {
    startQuestion("p2-q4");
}, { once: true });

checkTwo4.addEventListener("click", () => {
    const value = input4.value.trim();
    if(value === "") {
        feedbackTwo4.textContent = "Please enter an answer before checking.";
        feedbackTwo4.style.color = "red";
        return;
    };
    const isCorrect = answers4.includes(value);
    if(isCorrect) {
        feedbackTwo4.textContent = "✅　正解（せいかい）！This sentence means, 'Because I will study, I will not go to the party.'";
        feedbackTwo4.style.color = "green";
    } else {
        feedbackTwo4.textContent = "❌　不正解（ふせいかい）！Remember the structure 「<Reason>から、<Situation>」. Don't forget から to mark the reason. The verb 'to study' is べんきょうする.";
        feedbackTwo4.style.color = "red";
    };

    logEvent("practice2_submission", {
        question: "p2-q4",
        answer_raw: value,
        correct: isCorrect
    });

    endQuestion("p2-q4", {
        correct: isCorrect
    });
});

resetTwo4.addEventListener("click", () => {
    input4.value = "";
    feedbackTwo4.textContent = "";
});

// Practice3 continue
const continueP2 = document.getElementById("continue-p2");
const practiceThree = document.getElementById("practice-3");

continueP2.addEventListener("click", () => {
  endSection("practice-2");

  practiceThree.style.display = "block";
  startSection("practice-3");

  practiceThree.scrollIntoView({ behavior: "smooth" });
});

// Practice3
async function checkPractice3(q) {

  const input    = document.getElementById(`input-p3-${q}`);
  const feedback = document.getElementById(`feedback-p3-${q}`);
  const answer   = (input.value || "").trim();

  if (!answer) {
    feedback.textContent = "Please write a sentence that uses 「から」.";
    feedback.style.color = "red";
    return;
  }

  logEvent("practice3_submission", {
        question: `p3-q${q}`,
        answer_raw: answer
    });

    endQuestion(`p3-q${q}`);

  feedback.textContent = "Evaluating your sentence…";
  feedback.style.color = "#555";

  try {
    const res = await fetch("https://tol-llm-worker.happytreeih2007.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Browser sets Origin automatically; Worker checks it
      body: JSON.stringify({
        response_text:      answer,
        learning_objective: "Learner can create their own sentence using the <Reason>から、<Situation> sentence structure correctly.",
        criteria: [
          "The reason logically connects to the situation.",
          "The reason is stated before から; the situation goes after",
          "Verbs and adjectives are conjugated correctly in the です／ます form",
          "Particle usage is correct",
        ]
      })
    });

    const data = await res.json();

    await logEvent("practice3_feedback", {
        question: `p3-q${q}`,
        verdict: data.verdict ?? null,
        summary: data.summary ?? null,
        criteria_feedback: data.criteria_feedback ?? null,
        next_step: data.next_step ?? null
    });

    // Render: verdict + bullets
    const lines = [];
    if (data.verdict) lines.push(`Verdict: ${data.verdict}`);
    if (data.summary) lines.push(data.summary);
    if (Array.isArray(data.criteria_feedback) && data.criteria_feedback.length) {
      data.criteria_feedback.forEach(item => {
        lines.push(`${item.met ? "✅" : "❌"} ${item.criterion} — ${item.comment}`);
      });
    }
    if (data.next_step) lines.push(`Next step: ${data.next_step}`);

    feedback.textContent = lines.join("\n");
    feedback.style.whiteSpace = "pre-wrap";
    feedback.style.color = (data.verdict === "Correct") ? "green" : "red";
  } catch (err) {
    feedback.textContent = "Temporary issue contacting the feedback service. Please try again.";
    feedback.style.color = "red";
    console.error(err);
  }
}

// Attach Practice-3 button handlers (Q1–Q3)
[1, 2, 3].forEach((q) => {
  const btnCheck = document.getElementById(`check-p3-${q}`);
  const btnReset = document.getElementById(`reset-p3-${q}`);
  const input    = document.getElementById(`input-p3-${q}`);
  const feedback = document.getElementById(`feedback-p3-${q}`);

input.addEventListener("input", () => {
    startQuestion(`p3-q${q}`);
}, { once: true });

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
