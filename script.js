// Intro
const introInput = document.getElementById("intro-answer");
const feedbackIntro = document.getElementById("feedback-intro");
const checkIntro = document.getElementById("check-intro");

// Intro - check answer
checkIntro.addEventListener("click", () => {
    const inputValue = introInput.value.trim();
    if(inputValue==="") {
    feedbackIntro.textContent = "Please make a guess and enter your answer.";
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
    explanation.style.display = "block";
    requestAnimationFrame(() => {
        explanation.scrollIntoView({behavior: "smooth", block: "start"});
    });
});

// Explanation - continue
const continueExp = document.getElementById("continue-explanation");
const practiceOne = document.getElementById("practice-1");

continueExp.addEventListener("click", () => {
    practiceOne.style.display = "block";
    requestAnimationFrame(() => {
        practiceOne.scrollIntoView({behavior: "smooth", block: "start"});
    });
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
        draggedTile4 = tile;
        tile.classList.add("dragging");
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
    practiceTwo.style.display = "block";
    requestAnimationFrame(() => {
        practiceTwo.scrollIntoView({behavior: "smooth", block: "start"});
    });
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
});

resetTwo3.addEventListener("click", () => {
    input3.value = "";
    feedbackTwo3.textContent = "";
});

// Practice4 Q4
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
});

resetTwo4.addEventListener("click", () => {
    input4.value = "";
    feedbackTwo4.textContent = "";
});

// Practice3 continue
const continueP2 = document.getElementById("continue-p2");
const practiceThree = document.getElementById("practice-3");

continueP2.addEventListener("click", () => {
    practiceThree.style.display = "block";
    requestAnimationFrame(() => {
        practiceThree.scrollIntoView({behavior: "smooth", block: "start"});
    });
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

  feedback.textContent = "Evaluating your sentence…";
  feedback.style.color = "#555";

  try {
    const res = await fetch("https://captivate-llm-worker.happytreeih2007.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Browser sets Origin automatically; Worker checks it
      body: JSON.stringify({
        response_text:      answer,
        learning_objective: "Use 「から」 to express reason → result in a short sentence.",
        criteria: [
          "Includes から",
          "Reason before から; result after",
          "Polite form (です／ます)",
          "Natural wording and particles",
          "Use a comma 「、」 if helpful"
        ]
      })
    });

    const data = await res.json();
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
