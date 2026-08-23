const levels = [
  {
    title: "Las sílabas mágicas",
    instruction: "Di en voz alta:",
    items: [
      "TA TE TI TO TU",
      "TAZA",
      "TECHO",
      "TIERRA",
      "TOMATE",
      "TUNA"
    ]
  },
  {
    title: "La cueva de las palabras",
    instruction: "Lee esta palabra:",
    items: [
      "MAMA",
      "PATO",
      "MESA",
      "PIPA",
      "LUNA",
      "MAPA"
    ]
  },
  {
    title: "El bosque encantado",
    instruction: "Lee esta palabra:",
    items: [
      "GATO",
      "CASA",
      "SAPO",
      "RANA",
      "LAGO",
      "ROSA"
    ]
  }
];

let levelIndex = 0;
let itemIndex = 0;
let stars = 0;
let listening = false;

const wordEl = document.getElementById("word");
const titleEl = document.getElementById("title");
const instructionEl = document.getElementById("instruction");
const levelEl = document.getElementById("level");
const starsEl = document.getElementById("stars");
const resultEl = document.getElementById("result");
const progressBar = document.getElementById("progressBar");
const monsterEl = document.getElementById("monster");
const wordListEl = document.getElementById("wordList");
const listenBtn = document.getElementById("listenBtn");
const repeatBtn = document.getElementById("repeatBtn");

function currentItem() {
  return levels[levelIndex].items[itemIndex];
}

function normalize(text) {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-ZÑ\s]/g, "")
    .trim();
}

function render() {
  const level = levels[levelIndex];
  const item = currentItem();

  levelEl.textContent = levelIndex + 1;
  titleEl.textContent = level.title;
  instructionEl.textContent = level.instruction;
  wordEl.textContent = item;
  resultEl.textContent = "Preparado para la magia ✨";
  monsterEl.textContent = "👹";
  monsterEl.classList.remove("transform");

  wordListEl.innerHTML = "";

  level.items.forEach((word, i) => {
    const chip = document.createElement("span");
    chip.className = "word-chip" + (i < itemIndex ? " correct" : "");
    chip.textContent = word;
    wordListEl.appendChild(chip);
  });

  progressBar.style.width =
    (itemIndex / level.items.length) * 100 + "%";
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    resultEl.textContent = "Tu navegador no tiene lectura de voz.";
    return;
  }

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-CL";
  utterance.rate = 0.72;
  utterance.pitch = 1.15;

  speechSynthesis.speak(utterance);
}

function success() {
  stars++;
  starsEl.textContent = stars;

  resultEl.textContent = "✨ ¡Excelente! ¡Hechizo mágico! 🐰";

  monsterEl.classList.add("transform");

  setTimeout(() => {
    itemIndex++;

    if (itemIndex >= levels[levelIndex].items.length) {
      levelIndex++;

      if (levelIndex >= levels.length) {
        levelIndex = 0;
        resultEl.textContent = "🏆 ¡Completaste la aventura!";
      }

      itemIndex = 0;
    }

    render();
  }, 1200);
}

function tryAnswer(transcript) {
  const expected = normalize(currentItem());
  const heard = normalize(transcript);

  if (
    heard === expected ||
    heard.includes(expected) ||
    expected.includes(heard)
  ) {
    success();
  } else {
    resultEl.textContent = `Escuché: "${transcript}". Inténtalo otra vez 🪄`;
  }
}

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();

  recognition.lang = "es-CL";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    listening = true;
    listenBtn.textContent = "🎤 Escuchando...";
    resultEl.textContent = "¡Habla con voz clara! ✨";
  };

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    tryAnswer(transcript);
  };

  recognition.onerror = event => {
    if (event.error === "not-allowed") {
      resultEl.textContent = "Necesito permiso para usar el micrófono.";
    } else {
      resultEl.textContent = "No pude escucharte. Inténtalo nuevamente.";
    }
  };

  recognition.onend = () => {
    listening = false;
    listenBtn.textContent = "🎤 Mantén presionado y lee";
  };

  listenBtn.addEventListener("click", () => {
    if (!listening) {
      recognition.start();
    }
  });
} else {
  listenBtn.disabled = true;
  listenBtn.textContent = "🎤 Voz no compatible";
  resultEl.textContent = "Prueba con Chrome en Android.";
}

repeatBtn.addEventListener("click", () => {
  speak(currentItem());
});

render();
