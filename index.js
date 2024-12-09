// ----------------------------------------------------------------CURRENCY--------------------------------------------------------------------//
const currencyElement = document.querySelector(".currency");
const currencyChangeWindow = document.querySelector(".currency-change-window");

// Get all currency options
const dollarOption = document.querySelector(".dollar");
const euroOption = document.querySelector(".euro");
const rubleOption = document.querySelector(".ruble");

function selectCurrency(currency) {
  updateCurrencyDisplay(currency);
  updateCurrencyOptions(currency);
  toggleCurrencyWindow(); // Close the window after selection
}

// Get all currency display images
const rubleDisplay = document.querySelector(
  '.currency-display img[alt="рубль"]'
);
const euroDisplay = document.querySelector('.currency-display img[alt="евро"]');
const dollarDisplay = document.querySelector(
  '.currency-display img[alt="доллар"]'
);

dollarOption.addEventListener("click", () => selectCurrency("dollar"));
euroOption.addEventListener("click", () => selectCurrency("euro"));
rubleOption.addEventListener("click", () => selectCurrency("ruble"));

// Function to toggle the currency change window
function toggleCurrencyWindow() {
  currencyChangeWindow.classList.toggle("hide");
  if (!currencyChangeWindow.classList.contains("hide")) {
    // Add animate class after a small delay to ensure the window is visible
    setTimeout(() => {
      currencyChangeWindow.classList.add("animate");
    }, 50);
  } else {
    currencyChangeWindow.classList.remove("animate");
  }
}

// Function to update the currency display
function updateCurrencyDisplay(selectedCurrency) {
  rubleDisplay.classList.add("hide");
  euroDisplay.classList.add("hide");
  dollarDisplay.classList.add("hide");

  if (selectedCurrency === "ruble") {
    rubleDisplay.classList.remove("hide");
  } else if (selectedCurrency === "euro") {
    euroDisplay.classList.remove("hide");
  } else if (selectedCurrency === "dollar") {
    dollarDisplay.classList.remove("hide");
  }
}

// Function to update the currency options
function updateCurrencyOptions(selectedCurrency) {
  rubleOption.classList.add("hide");
  euroOption.classList.add("hide");
  dollarOption.classList.add("hide");

  if (selectedCurrency !== "ruble") {
    rubleOption.classList.remove("hide");
  }
  if (selectedCurrency !== "euro") {
    euroOption.classList.remove("hide");
  }
  if (selectedCurrency !== "dollar") {
    dollarOption.classList.remove("hide");
  }

  document
    .querySelectorAll(".currency-change-window > div:not(.hide) .currency-text")
    .forEach((text) => {
      text.style.transition = "none";
      text.style.transform = "translateY(100%)";
      text.offsetHeight;
      text.style.transition = "transform 0.3s ease-out";
      text.style.transform = "translateY(0)";
    });
}

// Add click event listener to the currency element

// Add click event listeners to currency options
dollarOption.addEventListener("click", () => {
  updateCurrencyDisplay("dollar");
  updateCurrencyOptions("dollar");
  toggleCurrencyWindow();
});

euroOption.addEventListener("click", () => {
  updateCurrencyDisplay("euro");
  updateCurrencyOptions("euro");
  toggleCurrencyWindow();
});

rubleOption.addEventListener("click", () => {
  updateCurrencyDisplay("ruble");
  updateCurrencyOptions("ruble");
  toggleCurrencyWindow();
});

// Close the currency window when clicking outside of it
document.addEventListener("click", (event) => {
  if (
    !currencyElement.contains(event.target) &&
    !currencyChangeWindow.contains(event.target)
  ) {
    currencyChangeWindow.classList.add("hide");
    currencyChangeWindow.classList.remove("animate");
  }
});

// ----------------------------------------------------------MICROPHONE--------------------------------------------------------//

const slider = document.querySelector(".price-slider");
const microphone = document.querySelector(".microphone");
const totalPrice = document.querySelector(".totalPrice");
const priceCounters = document.querySelectorAll(".price-top .price-counter");
const priceCountersPercent = document.querySelectorAll(
  ".price-bottom .price-counter-percent"
);
const activePriceCounter = document.querySelector(
  ".microphone .price-counter-active"
);
const activePriceCounterPercent = document.querySelector(
  ".microphone .price-counter-active:last-child"
);
const calculatorInput = document.querySelector(".calculator-value input");

const styles = `
  .microphone, .microphone-glow {
      transition: none;
  }
  
  .microphone.smooth-transition, .microphone-glow.smooth-transition {
      transition: left 0.2s ease-out, top 0.2s ease-out;
  }
  .price-counter, .price-counter-percent {
      transition: transform 0.2s ease-out;
  }
`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

let SLIDER_WIDTH = 1125;
let SLIDER_HEIGHT = 0;
let isRotated = false;

const PRICE_RANGES = [
  { max: 999, price: 5, widthPercentage: 23.8, discount: 0 },
  { max: 9999, price: 4, widthPercentage: 25.6, discount: 20 },
  { max: 49999, price: 3, widthPercentage: 26.2, discount: 40 },
  { max: 100000, price: 2, widthPercentage: 24.4, discount: 60 },
];

function updateSliderDimensions() {
  const windowWidth = window.innerWidth;
  if (windowWidth >= 1001) {
    SLIDER_WIDTH = 1125;
    isRotated = false;
  } else if (windowWidth <= 1000 && windowWidth > 700) {
    SLIDER_WIDTH = 920;
    isRotated = false;
  } else if (windowWidth <= 700 && windowWidth > 480) {
    SLIDER_WIDTH = 700;
    isRotated = false;
  } else if (windowWidth <= 480 && windowWidth > 425) {
    SLIDER_WIDTH = 340;
    isRotated = false;
  } else {
    SLIDER_WIDTH = 340;
    SLIDER_HEIGHT = 460;
    isRotated = true;
  }

  let totalPercentage = PRICE_RANGES.reduce(
    (sum, range) => sum + range.widthPercentage,
    0
  );
  PRICE_RANGES.forEach((range) => {
    range.width = (range.widthPercentage / totalPercentage) * SLIDER_WIDTH;
  });
}

function updatePositions(position, smooth = false) {
  if (microphone) {
    microphone.classList.toggle("smooth-transition", smooth);
    microphone.style.left = `${position}px`;
  }
}

function calculateMinutes(position) {
  let accumulatedWidth = 0;
  for (let range of PRICE_RANGES) {
    if (position <= accumulatedWidth + range.width) {
      const relativePosition = position - accumulatedWidth;
      const rangePercentage = relativePosition / range.width;
      const prevMax =
        accumulatedWidth > 0
          ? PRICE_RANGES[PRICE_RANGES.indexOf(range) - 1].max
          : 0;
      return Math.round(prevMax + (range.max - prevMax) * rangePercentage);
    }
    accumulatedWidth += range.width;
  }
  return 100000;
}

function calculatePosition(minutes) {
  let accumulatedWidth = 0;
  for (let range of PRICE_RANGES) {
    if (minutes <= range.max) {
      const prevMax =
        accumulatedWidth > 0
          ? PRICE_RANGES[PRICE_RANGES.indexOf(range) - 1].max
          : 0;
      const rangePercentage = (minutes - prevMax) / (range.max - prevMax);
      return accumulatedWidth + rangePercentage * range.width;
    }
    accumulatedWidth += range.width;
  }
  return SLIDER_WIDTH;
}

function updateDisplay(minutes, smooth = false) {
  minutes = Math.max(0, Math.min(minutes, 100000));

  const formattedMinutes =
    minutes === 0
      ? "0 Минут"
      : minutes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  if (calculatorInput) {
    calculatorInput.value = formattedMinutes;
  }

  const currentRange =
    PRICE_RANGES.find((range) => minutes <= range.max) ||
    PRICE_RANGES[PRICE_RANGES.length - 1];
  const price = currentRange.price;
  const discount = currentRange.discount;

  if (totalPrice) {
    const totalPriceValue = price * minutes;
    const formattedPrice =
      totalPriceValue === 0
        ? "0 Рублей"
        : totalPriceValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    totalPrice.textContent = formattedPrice;
  }

  const position = calculatePosition(minutes);
  updatePositions(position, smooth);

  if (activePriceCounter) {
    activePriceCounter.textContent = price + " ₽";
  }
  if (activePriceCounterPercent) {
    activePriceCounterPercent.textContent = discount ? `-${discount}%` : "";
  }
}

function moveMicrophone(e, smooth = false) {
  if (!slider) return;
  const rect = slider.getBoundingClientRect();
  let position;
  if (isRotated) {
    position = e.clientY - rect.top;
    position = Math.max(0, Math.min(position, SLIDER_HEIGHT));
  } else {
    position = e.clientX - rect.left;
    position = Math.max(0, Math.min(position, SLIDER_WIDTH));
  }

  const minutes = calculateMinutes(position);
  updateDisplay(minutes, smooth);
}

if (microphone) {
  microphone.addEventListener("mousedown", (e) => {
    e.preventDefault();

    function onMouseMove(eMove) {
      moveMicrophone(eMove, false);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", onMouseMove);
      },
      { once: true }
    );
  });
}

if (slider) {
  slider.addEventListener("click", (e) => {
    moveMicrophone(e, true);
  });
}

function updateCalculatorValue(amount) {
  let currentMinutes = parseInt(calculatorInput.value.replace(/\D/g, ""), 10);

  if (isNaN(currentMinutes)) {
    currentMinutes = 0;
  }

  currentMinutes += amount;

  currentMinutes = Math.max(0, Math.min(currentMinutes, 100000));

  updateDisplay(currentMinutes);
}

let autoUpdateIntervalId = null;
let autoUpdateHoldTimeoutId = null;
let quadrupleSpeedTimeoutId = null;
let isMouseUp = false;

const updateInterval = 100;
const holdDelay = 500;
const quadrupleSpeedDelay = 3000;

function startUpdatingAuto(amount, multiplier = 1) {
  if (autoUpdateIntervalId !== null) return;
  autoUpdateIntervalId = setInterval(() => {
    updateCalculatorValue(amount * multiplier);
  }, updateInterval);
}

function stopUpdatingAuto() {
  if (autoUpdateIntervalId !== null) {
    clearInterval(autoUpdateIntervalId);
    autoUpdateIntervalId = null;
  }
  if (autoUpdateHoldTimeoutId !== null) {
    clearTimeout(autoUpdateHoldTimeoutId);
    autoUpdateHoldTimeoutId = null;
  }
  if (quadrupleSpeedTimeoutId !== null) {
    clearTimeout(quadrupleSpeedTimeoutId);
    quadrupleSpeedTimeoutId = null;
  }
}

function handleArrowMouseDown(amount) {
  updateCalculatorValue(amount);
  isMouseUp = false;

  autoUpdateHoldTimeoutId = setTimeout(() => {
    startUpdatingAuto(amount);

    quadrupleSpeedTimeoutId = setTimeout(() => {
      if (isMouseUp) return;

      stopUpdatingAuto();
      startUpdatingAuto(amount, 20);
    }, quadrupleSpeedDelay);
  }, holdDelay);
}

function handleArrowMouseUp() {
  isMouseUp = true;
  stopUpdatingAuto();
}

const leftArrow = document.querySelector(".change-total-price-left");
const rightArrow = document.querySelector(".change-total-price-right");
const priceLeftArrow = document.querySelector(".change-price-left");
const priceRightArrow = document.querySelector(".change-price-right");

if (leftArrow) {
  leftArrow.addEventListener("mousedown", () => handleArrowMouseDown(-1));
  leftArrow.addEventListener("mouseup", handleArrowMouseUp);
  leftArrow.addEventListener("mouseleave", handleArrowMouseUp);
}

if (rightArrow) {
  rightArrow.addEventListener("mousedown", () => handleArrowMouseDown(1));
  rightArrow.addEventListener("mouseup", handleArrowMouseUp);
  rightArrow.addEventListener("mouseleave", handleArrowMouseUp);
}

if (priceLeftArrow) {
  priceLeftArrow.addEventListener("mousedown", () => handleArrowMouseDown(-1));
  priceLeftArrow.addEventListener("mouseup", handleArrowMouseUp);
  priceLeftArrow.addEventListener("mouseleave", handleArrowMouseUp);
}

if (priceRightArrow) {
  priceRightArrow.addEventListener("mousedown", () => handleArrowMouseDown(1));
  priceRightArrow.addEventListener("mouseup", handleArrowMouseUp);
  priceRightArrow.addEventListener("mouseleave", handleArrowMouseUp);
}

if (leftArrow && rightArrow && priceLeftArrow && priceRightArrow) {
  leftArrow.addEventListener("selectstart", (e) => e.preventDefault());
  rightArrow.addEventListener("selectstart", (e) => e.preventDefault());
  priceLeftArrow.addEventListener("selectstart", (e) => e.preventDefault());
  priceRightArrow.addEventListener("selectstart", (e) => e.preventDefault());
}

function handleInputChange(e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value === "") {
    updateDisplay(0);
    return;
  }
  let minutes = Math.max(0, Math.min(parseInt(value, 10), 100000));
  e.target.value = minutes;
  updateDisplay(minutes);
}

if (calculatorInput) {
  calculatorInput.addEventListener("input", function (e) {
    if (this.value === "0 Минут") this.value = "";
    handleInputChange(e);
  });

  calculatorInput.addEventListener("focus", function () {
    if (this.value === "0 Минут") this.value = "";
  });

  calculatorInput.addEventListener("blur", function () {
    let value = this.value.replace(/\D/g, "");
    if (value === "") {
      this.value = "0 Минут";
      updateDisplay(0);
    } else {
      let minutes = Math.max(0, Math.min(parseInt(value, 10), 100000));
      this.value = minutes;
      updateDisplay(minutes);
    }
  });
}

updateSliderDimensions();

function animateDisplay() {
  const phases = [{ start: 1000, end: 0, duration: 1500 }];

  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
  let startTime;

  function updateAnimation(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsedTime = timestamp - startTime;

    if (elapsedTime >= totalDuration) {
      updateDisplay(phases[phases.length - 1].end);
      return;
    }

    let currentTime = 0;
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      if (elapsedTime < currentTime + phase.duration) {
        const phaseProgress = (elapsedTime - currentTime) / phase.duration;
        const currentValue = Math.round(
          phase.start + (phase.end - phase.start) * phaseProgress
        );
        updateDisplay(currentValue);
        break;
      }
      currentTime += phase.duration;
    }

    requestAnimationFrame(updateAnimation);
  }

  requestAnimationFrame(updateAnimation);
}

animateDisplay();

window.addEventListener("resize", () => {
  updateSliderDimensions();
  const currentPosition = parseFloat(microphone.style.left) || 0;
  const minutes = calculateMinutes(currentPosition);
  updateDisplay(minutes);
});

//-------------------------------------------------------TEXT ANIMATION--------------------------------------------------//
const phrases = [
  "вы хотите купить",
  "вы хотите приобрести",
  "вам необходимо",
  "вам потребуется",
  "вам нужно",
];

const typingElement = document.getElementById("typing-text");
const cursorElement = document.getElementById("cursor");
const typingElementReflection = document.getElementById(
  "typing-text-reflection"
);
const cursorElementReflection = document.getElementById("cursor-reflection");

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typePhrase() {
  const currentPhrase = phrases[phraseIndex];

  if (!isDeleting && charIndex <= currentPhrase.length) {
    typingElement.textContent = currentPhrase.substring(0, charIndex);
    typingElementReflection.textContent = typingElement.textContent;
    charIndex++;
    if (charIndex > currentPhrase.length) {
      setTimeout(() => {
        isDeleting = true;
        typePhrase();
      }, 10000);
    } else {
      setTimeout(typePhrase, 100);
    }
  } else if (isDeleting && charIndex > 0) {
    typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
    typingElementReflection.textContent = typingElement.textContent;
    charIndex--;
    setTimeout(typePhrase, 50);
  } else {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    charIndex = 0;
    setTimeout(typePhrase, 500);
  }
}

function blinkCursor() {
  const visibility =
    cursorElement.style.visibility === "visible" ? "hidden" : "visible";
  cursorElement.style.visibility = visibility;
  cursorElementReflection.style.visibility = visibility;
}

setInterval(blinkCursor, 530);

// Запуск анимации
typePhrase();

//------------------------------------------------------POP-UP----------------------------------------------//\

// Select buttons and modals
const loginBtn = document.querySelector(".login");
const modalOverlay = document.getElementById("modal-overlay");
const closeLoginModalBtn = document.getElementById("close-login-modal");
const closeRegisterModalBtn = document.getElementById("close-register-modal");

const togglePasswordBtn = document.getElementById("toggle-password");
const passwordInput = document.getElementById("password");

const toggleRegisterPasswordBtn = document.getElementById(
  "toggle-register-password"
);
const registerPasswordInput = document.getElementById("register-password");

const openRegisterBtn = document.getElementById("open-register");
const openLoginBtn = document.getElementById("open-login");

const openLoginFromRegisterBtn = document.getElementById(
  "open-login-from-register"
);
const openRegisterFromRegisterBtn = document.getElementById(
  "open-register-from-register"
);

const loginModal = document.getElementById("login-modal");
const registerModal = document.getElementById("register-modal");

// Function to open a modal
function openModal(modal) {
  modalOverlay.style.display = "flex";
  modalOverlay.classList.remove("blur-out");
  modal.style.display = "block";
}

// Function to close all modals
function closeModal() {
  loginModal.classList.add("modal-closing");
  registerModal.classList.add("modal-closing");
  modalOverlay.classList.add("blur-out");

  setTimeout(() => {
    modalOverlay.style.display = "none";
    loginModal.style.display = "none";
    registerModal.style.display = "none";

    loginModal.classList.remove("modal-closing");
    registerModal.classList.remove("modal-closing");
  }, 400); // Ensure this timeout matches your CSS animation duration
}

// Helper function to switch between modals
function switchModal(currentModal, targetModal) {
  currentModal.classList.add("modal-closing");
  setTimeout(() => {
    currentModal.style.display = "none";
    currentModal.classList.remove("modal-closing");

    openModal(targetModal);
  }, 400); // Ensure this timeout matches your CSS animation duration
}

// Event listeners for opening and closing modals
loginBtn.addEventListener("click", () => {
  openModal(loginModal);
});

closeLoginModalBtn.addEventListener("click", () => {
  closeModal();
});

closeRegisterModalBtn.addEventListener("click", () => {
  closeModal();
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// Event listeners for toggling password visibility
togglePasswordBtn.addEventListener("click", () => {
  togglePasswordVisibility(passwordInput, togglePasswordBtn);
});

toggleRegisterPasswordBtn.addEventListener("click", () => {
  togglePasswordVisibility(registerPasswordInput, toggleRegisterPasswordBtn);
});

// Function to toggle password visibility
function togglePasswordVisibility(passwordField, toggleBtn) {
  const type = passwordField.type === "password" ? "text" : "password";
  passwordField.type = type;

  const img = toggleBtn.querySelector("img");
  if (type === "text") {
    img.src = "./img/hidePassword.svg";
  } else {
    img.src = "./img/showPassword.svg";
  }
}

// Event listeners for switching modals
openRegisterBtn.addEventListener("click", () => {
  switchModal(loginModal, registerModal);
});

openLoginBtn.addEventListener("click", () => {
  switchModal(registerModal, loginModal);
});

// New event listeners for additional buttons
openLoginFromRegisterBtn.addEventListener("click", () => {
  switchModal(registerModal, loginModal);
});

openRegisterFromRegisterBtn.addEventListener("click", () => {
  // Optional: If you want to refresh the Register modal or perform another action
  // For now, we'll just ensure it's displayed
  if (registerModal.style.display !== "block") {
    openModal(registerModal);
  }
});

// Populate DOB selectors (unchanged)
const dobDaySelect = document.getElementById("dob-day");
const dobYearSelect = document.getElementById("dob-year");

for (let i = 1; i <= 31; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  dobDaySelect.appendChild(option);
}

const currentYear = new Date().getFullYear();
for (let i = currentYear; i >= 1900; i--) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  dobYearSelect.appendChild(option);
}

// Password strength indicator (unchanged)
const strengthIndicator = document.getElementById("strength-indicator");
const strengthText = document.getElementById("strength-text");

registerPasswordInput.addEventListener("input", () => {
  const password = registerPasswordInput.value;
  const strength = checkPasswordStrength(password);

  updateStrengthIndicator(strength);
});

function checkPasswordStrength(password) {
  const weakRegex = /^(?=.*[a-zA-Z]).{1,}$/;
  const mediumRegex =
    /^(?=.*[a-zA-Z])(?=.*[\d!@#$%^&*()_+=;'{}\[\]:;"'<>,.?/\\|-]).{6,}$/;
  const strongRegex =
    /^(?=.*[a-zA-Z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#+=_$%^&*<>./]).{8,}$/;

  if (strongRegex.test(password)) {
    return "strong";
  } else if (mediumRegex.test(password)) {
    return "medium";
  } else if (weakRegex.test(password)) {
    return "weak";
  } else {
    return "none";
  }
}

function updateStrengthIndicator(strength) {
  strengthIndicator.style.width = "0";
  strengthIndicator.classList.remove("weak", "medium", "strong");

  switch (strength) {
    case "strong":
      strengthIndicator.style.width = "100%";
      strengthIndicator.classList.add("strong");
      strengthText.textContent = "хороший пароль";
      break;
    case "medium":
      strengthIndicator.style.width = "50%";
      strengthIndicator.classList.add("medium");
      strengthText.textContent = "средний пароль";
      break;
    case "weak":
      strengthIndicator.style.width = "20%";
      strengthIndicator.classList.add("weak");
      strengthText.textContent = "слабый пароль";
      break;
    default:
      strengthIndicator.style.width = "0";
      strengthIndicator.classList.remove("weak", "medium", "strong");
      strengthText.textContent = "";
  }
}

// ------------------------------------- RESIZE INPUT------------------------------------------------//

calculatorInput.addEventListener("input", resizeInput);
resizeInput.call(calculatorInput);

function resizeInput(totalPrice) {}

//------------------------------------------LADDER NAV ------------------------------------------------//

//--------------------------------------------CALCULATOR BOX ANIMATION -----------------------------------//
document.addEventListener("DOMContentLoaded", function () {
  const calculatorBox = document.querySelector(".calculator-box");
  const buyButton = document.querySelector(".buy-button");

  calculatorBox.style.transition =
    "transform 0.5s ease-in-out, opacity 0.5s ease-in-out";

  function show() {
    setTimeout(function () {
      calculatorBox.style.opacity = "1";
      calculatorBox.style.transform = "scale(1)";

      buyButton.style.opacity = "1";
      buyButton.style.transform = "scale(1)";
    }, 100);
  }
  show();
});

//--------------------------------------------------WHEEL MICROPHONE MOVEMENT----------------------------------//

function createSliderOverlay() {
  const sliderBlock = document.querySelector(".price-slider-block");
  const slider = document.querySelector(".price-slider");
  const overlay = document.createElement("div");
  overlay.className = "slider-overlay";

  // Style the overlay
  overlay.style.position = "absolute";
  overlay.style.top = "-20%";
  overlay.style.left = "-35px"; // Align with the slider
  overlay.style.width = "calc(100%)"; // Extend width to match slider
  overlay.style.height = "100%";
  overlay.style.zIndex = "0"; // Ensure it's above other elements
  overlay.style.cursor = "default"; // Keep the default cursor
  overlay.style.pointerEvents = "none"; // Disable pointer events by default

  sliderBlock.style.position = "relative";
  sliderBlock.appendChild(overlay);

  let isScrolling = false;
  let scrollTimeout;

  sliderBlock.addEventListener("mouseenter", () => {
    overlay.style.pointerEvents = "auto"; // Enable pointer events on hover
  });

  sliderBlock.addEventListener("mouseleave", () => {
    overlay.style.pointerEvents = "none"; // Disable pointer events when not hovering
  });

  /* let SCROLL_SENSITIVITY = 0.0028;
    const SCROLL_TIMEOUT = 150; */

  function handleWheel(e) {
    e.preventDefault();

    const deltaY = e.deltaY;
    const changeAmount = deltaY > 0 ? -1 : 1;

    updateCalculatorValue(changeAmount);
  }

  [overlay, slider, calculatorInput, microphone].forEach((element) => {
    element.addEventListener("wheel", handleWheel);
  });
}

// Call this function after your existing initialization code
createSliderOverlay();

// ===================================================CURSOR-TRAIL--------------------------------------//
const coords = { x: 0, y: 0 };
const circles = document.querySelectorAll(".circle");
const colors = [
  "#B0B0B0",
  "#A0A0A0",
  "#909090",
  "#808080",
  "#707070",
  "#606060",
  "#505050",
  "#404040",
];

let animationStarted = false;
let firstMove = false;

// Настройка каждого круга
circles.forEach(function (circle, index) {
  circle.x = window.innerWidth / 2;
  circle.y = window.innerHeight / 2;
  const colorIndex = Math.floor(index / 20);
  circle.style.backgroundColor = colors[colorIndex % colors.length];
  circle.style.position = "absolute";
  circle.style.opacity = 0;
  circle.style.width = "5px";
  circle.style.height = "5px";
  circle.style.borderRadius = "50%";
});

window.addEventListener("mousemove", function (e) {
  if (!firstMove) {
    coords.x = e.clientX;
    coords.y = e.clientY;
    circles.forEach((circle) => {
      circle.x = coords.x;
      circle.y = coords.y;
      circle.style.opacity = 1;
    });
    firstMove = true;

    circles.forEach((circle) => {
      circle.style.transition = "opacity 0.3s ease";
      circle.style.opacity = 1;
    });
  }

  coords.x = e.clientX;
  coords.y = e.clientY;

  if (!animationStarted) {
    animationStarted = true;
    setTimeout(animateCircles, 100);
  }
});

function animateCircles() {
  let x = coords.x;
  let y = coords.y;

  circles.forEach(function (circle, index) {
    const nextCircle = circles[index - 1] || { x: coords.x, y: coords.y };

    circle.x += (nextCircle.x - circle.x) * 0.9;
    circle.y += (nextCircle.y - circle.y) * 0.9;

    const circleSize = parseFloat(circle.style.width);
    circle.style.left = `${Math.min(
      window.innerWidth - 20,
      Math.max(0, circle.x - circleSize / 2)
    )}px`;
    circle.style.top = `${Math.min(
      window.innerHeight - 10,
      Math.max(0, circle.y - circleSize / 2)
    )}px`;

    circle.style.transform = `scale(${
      (circles.length - index) / circles.length
    })`;
  });

  requestAnimationFrame(animateCircles);
}

// Button CLick //

function makeButtonClickable(button) {
  let lastClickTime = 0;
  const delay = 120;

  function handleMouseDown() {
    const currentTime = Date.now();
    if (currentTime - lastClickTime > delay) {
      button.classList.add("fast-click");
      const descendants = button.querySelectorAll("*");
      descendants.forEach((descendant) =>
        descendant.classList.add("fast-click")
      );
      lastClickTime = currentTime;
    }
  }

  function handleMouseUp() {
    setTimeout(() => {
      button.classList.remove("fast-click");
      const descendants = button.querySelectorAll("*");
      descendants.forEach((descendant) =>
        descendant.classList.remove("fast-click")
      );
    }, delay);
  }

  function handleMouseLeave() {
    button.classList.remove("fast-click");
    const descendants = button.querySelectorAll("*");
    descendants.forEach((descendant) =>
      descendant.classList.remove("fast-click")
    );
  }

  button.addEventListener("mousedown", handleMouseDown);
  button.addEventListener("mouseup", handleMouseUp);
  button.addEventListener("mouseleave", handleMouseLeave);
}

const paymentBtns = document.querySelectorAll(".payment-navigation-btn");
paymentBtns.forEach((button) => makeButtonClickable(button));

const activeBtn = document.querySelector(".payment-navigation-btn.active");
const activeText = document.querySelector(".btn-text.active");
makeButtonClickable(activeBtn);
makeButtonClickable(activeBtn);

const loginButton = document.querySelector(".login");
makeButtonClickable(loginButton);
const rateBtns = document
  .querySelectorAll(".rate-btn")
  .forEach((el) => makeButtonClickable(el));

const anotherButton = document.querySelector(".logo");
const logoImg = document.querySelector(".logo-img");
const buyBtn = document.querySelector(".card");
const priceLeft = document.querySelector(".change-price-left");
const priceRight = document.querySelector(".change-price-right");
const currencyBtn = document.querySelector(".currency-lang-nav");
const homeBtn = document.querySelector(".home-btn");
const nextArrow = document.querySelector(".next-arrow");
const loginPlatforms = document
  .querySelectorAll(".log_in_with.flip_item-back")
  .forEach((platform) => makeButtonClickable(platform));

if (anotherButton) {
  makeButtonClickable(anotherButton);
}
if (logoImg) {
  makeButtonClickable(logoImg);
}
if (buyBtn) {
  makeButtonClickable(buyBtn);
}
if (priceLeft) {
  makeButtonClickable(priceLeft);
}
if (priceRight) {
  makeButtonClickable(priceRight);
}
if (currencyBtn) {
  makeButtonClickable(currencyBtn);
}
if (homeBtn) {
  makeButtonClickable(homeBtn);
}
if (nextArrow) {
  makeButtonClickable(nextArrow);
}

const menuItems = document.querySelectorAll(".menu-item");
menuItems.forEach((i) => makeButtonClickable(i));

document
  .querySelectorAll(".modal-button")
  .forEach((i) => makeButtonClickable(i));
document
  .querySelectorAll(".modal-present")
  .forEach((i) => makeButtonClickable(i));

window.addEventListener("load", function () {
  const modalContent = document.querySelector(".modal-content");

  modalContent.classList.add("onload-animation");

  modalContent.addEventListener("animationend", function () {
    modalContent.classList.remove("onload-animation");
  });
});
const togglePassword = document.querySelector(".toggle-password-btn");
makeButtonClickable(togglePassword);

document.addEventListener("DOMContentLoaded", function () {
  function activateButtonGroup(buttonSelector, textSelector) {
    const buttons = document.querySelectorAll(buttonSelector);
    const btnTexts = document.querySelectorAll(textSelector);

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        buttons.forEach((btn) => btn.classList.remove("active"));
        btnTexts.forEach((btn) => btn.classList.remove("active"));

        this.classList.add("active");
        this.querySelector(textSelector).classList.add("active");
      });
    });
  }

  activateButtonGroup(".payment-navigation-btn", ".btn-text");
  activateButtonGroup(".rate-btn", ".main-price");
});
document.querySelectorAll(".card-wrap").forEach((card) => {
  const cardElement = card.querySelector(".card");

  card.addEventListener("mousemove", (e) => {
    const isModalOpen =
      document.querySelector(".modal-overlay").style.display !== "none";
    const isInModal =
      card.closest("#login-modal") || card.closest("#register-modal");

    const rect = cardElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = (mouseY / rect.height) * 30 - 15;
    const rotateY =
      isModalOpen || isInModal ? 0 : (mouseX / rect.width) * -30 + 15;
    cardElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  });

  card.addEventListener("mouseleave", () => {
    cardElement.style.transition = "transform 0.5s ease-out";
    cardElement.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
  });
});

const loginForm = document.querySelector(".modal");
// Form checker
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log("Отправка данных:", { email, password });
  });
}

// Nice-Select
$(document).ready(function () {
  $("select").niceSelect();
});

// -------------------------------------------------- Gift Mode ------------------------------------------------//

const giftButton = document.getElementById("gift");
const calculatorBox = document.querySelector(".calculator-box");
const typingBlock = document.querySelector(".typing-block");
const giftDescription = document.querySelector(".gift-description");
const minutesInput = document.querySelector(".calculator-value input");
const paymentNavigationButtons = document.querySelectorAll(
  ".payment-navigation-btn"
);
const cardSpans = document.querySelectorAll(".cards .card-content span");
const giftPostpayment = document.querySelector(".gift-postpayment");

if (!microphone) {
  console.error("Элемент .microphone не найден.");
}

let isGiftModeActive = false;
let resetTimer;

const activateGiftMode = () => {
  isGiftModeActive = true;
  console.log("Режим подарка активирован");

  if (calculatorBox) calculatorBox.style.display = "none";
  if (typingBlock) typingBlock.style.display = "none";
  if (giftDescription) giftDescription.style.display = "block";
  if (giftPostpayment) giftPostpayment.style.display = "none";

  updateCardText();

  startResetTimer();
};

const deactivateGiftMode = () => {
  isGiftModeActive = false;
  console.log("Режим подарка деактивирован");

  if (calculatorBox) calculatorBox.style.display = "block";
  if (typingBlock) typingBlock.style.display = "flex";
  if (giftDescription) giftDescription.style.display = "none";
  if (giftPostpayment) giftDescription.style.display = "none";
  updateCardText();
};

const updateCardText = () => {
  cardSpans.forEach((cardSpan) => {
    if (isGiftModeActive) {
      cardSpan.textContent = "Купить";
    } else {
      cardSpan.textContent = "Регистрация";
    }
  });
};

const resetBlocks = () => {
  console.log(
    "Сброс блоков: скрытие giftDescription и показ calculatorBox и typingBlock"
  );
  if (giftDescription) giftDescription.style.display = "none";
  if (calculatorBox) calculatorBox.style.display = "block";
  if (typingBlock) typingBlock.style.display = "none";
  if (giftPostpayment) giftPostpayment.style.display = "block";
};

const resetGiftMode = () => {
  if (isGiftModeActive) {
    deactivateGiftMode();
  }
  clearTimeout(resetTimer);
};

const startResetTimer = () => {
  if (resetTimer) {
    clearTimeout(resetTimer);
  }

  resetTimer = setTimeout(() => {
    resetBlocks();
  }, 8000);
};

if (giftButton) {
  giftButton.addEventListener("click", () => {
    if (!isGiftModeActive) {
      console.log("Кнопка подарка нажата: активация режима подарка");
      activateGiftMode();
    } else {
      console.log("Кнопка подарка нажата, но режим подарка уже активен");
    }
  });
}

if (cardSpans.length > 0) {
  cardSpans.forEach((cardSpan) => {
    const cardContent = cardSpan.parentElement;
    if (cardContent) {
      cardContent.addEventListener("click", () => {
        if (!isGiftModeActive) {
          console.log("Клик по карточке: активация режима подарка");
          activateGiftMode();
        }
      });
    }
  });
}

function moveMicrophone(e, smooth = false) {
  if (!slider) return;
  const rect = slider.getBoundingClientRect();
  let position;
  if (isRotated) {
    position = e.clientY - rect.top;
    position = Math.max(0, Math.min(position, SLIDER_HEIGHT));
  } else {
    position = e.clientX - rect.left;
    position = Math.max(0, Math.min(position, SLIDER_WIDTH));
  }

  const minutes = calculateMinutes(position);
  updateDisplay(minutes, smooth);

  if (isGiftModeActive) {
    console.log("Микрофон перемещён, сброс блоков");
    resetBlocks();
  }
}

function updatePositions(position, smooth = false) {
  if (microphone) {
    microphone.classList.toggle("smooth-transition", smooth);
    microphone.style.left = `${position}px`;
  }
}

if (minutesInput) {
  minutesInput.addEventListener("input", () => {
    console.log("Изменение значений минут, сброс режима подарка");
    resetGiftMode();
  });
}

if (paymentNavigationButtons.length > 0) {
  paymentNavigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.id !== "gift") {
        console.log(
          "Кнопка payment-navigation-btn нажата, сброс режима подарка"
        );
        resetGiftMode();
      }
    });
  });
}

if (microphone) {
  const microphonePositionObserver = new MutationObserver(() => {
    if (isGiftModeActive) {
      console.log("Позиция микрофона изменена, сброс блоков");
      resetBlocks();
    }
  });

  microphonePositionObserver.observe(microphone, {
    attributes: true,
    attributeFilter: ["style"],
  });
}
