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

let SLIDER_WIDTH = 1125; // Default width, will be updated based on window size
let SLIDER_HEIGHT = 0; // Will be used for the rotated slider
let isRotated = false; // Flag to check if the slider is rotated

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

function calculatePrice(minutes) {
  for (let range of PRICE_RANGES) {
    if (minutes <= range.max) {
      return range.price;
    }
  }
  return PRICE_RANGES[PRICE_RANGES.length - 1].price;
}

function calculateDiscount(minutes) {
  for (let range of PRICE_RANGES) {
    if (minutes <= range.max) {
      return range.discount;
    }
  }
  return PRICE_RANGES[PRICE_RANGES.length - 1].discount;
}

let lastActiveIndex = -1;
let activatedIndices = [];

function calculateTotalPrice(minutes) {
  let total = 0;
  let remainingMinutes = minutes;

  for (let i = 0; i < PRICE_RANGES.length; i++) {
    const range = PRICE_RANGES[i];
    const prevMax = i > 0 ? PRICE_RANGES[i - 1].max : 0;
    const rangeMinutes = range.max - prevMax;

    if (remainingMinutes > rangeMinutes) {
      total += rangeMinutes * range.price;
      remainingMinutes -= rangeMinutes;
    } else {
      total += remainingMinutes * range.price;
      remainingMinutes = 0;
      break;
    }
  }

  return total;
}

function updateDisplay(minutes, smooth = false) {
  minutes = Math.max(0, Math.min(minutes, 100000));

  const formattedMinutes =
    minutes === 0
      ? "0 Минут"
      : minutes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  if (calculatorInput) {
    calculatorInput.value = formattedMinutes;
    if (typeof resizeInput === 'function') {
      resizeInput.call(calculatorInput);
    }
  }

  const currentRange =
    PRICE_RANGES.find((range) => minutes <= range.max) ||
    PRICE_RANGES[PRICE_RANGES.length - 1];
  const price = currentRange.price;
  const discount = currentRange.discount;

  if (totalPrice) {
    const totalPriceValue = calculateTotalPrice(minutes);
    const formattedPrice =
      totalPriceValue === 0
        ? "0 Рублей"
        : totalPriceValue
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

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

let timeoutId = null;

function startUpdating(amount) {
  updateCalculatorValue(amount);
  timeoutId = setTimeout(() => {
    startUpdating(amount);
  }, 100);
}

function stopUpdating() {
  clearTimeout(timeoutId);
}

const leftArrow = document.querySelector(".change-price-left");
const rightArrow = document.querySelector(".change-price-right");
const doubleLeftArrow = document.querySelector(".change-price-left-double");
const doubleRightArrow = document.querySelector(".change-price-right-double");

const changeTotalPriceLeft = document.querySelector(".change-total-price-left");
const changeTotalPriceRight = document.querySelector(".change-total-price-right");

let intervalId = null;
let holdTimeoutId = null;
let quadrupleSpeedTimeoutId = null;

const updateInterval = 100; 
const holdDelay = 500; 
const quadrupleSpeedDelay = 3000; 
const normalAmount = 1; 
const quadrupleAmount = 20; 

/**
 * 
 * @param {number} amount 
 * @param {number} multiplier 
 */
function startUpdatingAuto(amount, multiplier = 1) {
  if (intervalId !== null) return; 
  intervalId = setInterval(() => {
    updateCalculatorValue(amount * multiplier);
  }, updateInterval);
}

function stopUpdatingAuto() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (holdTimeoutId !== null) {
    clearTimeout(holdTimeoutId);
    holdTimeoutId = null;
  }
  if (quadrupleSpeedTimeoutId !== null) {
    clearTimeout(quadrupleSpeedTimeoutId);
    quadrupleSpeedTimeoutId = null;
  }
}

/**
 * 
 * @param {number} amount 
 */
function handleArrowMouseDown(amount) {
  
  updateCalculatorValue(amount);

 
  holdTimeoutId = setTimeout(() => {
    startUpdatingAuto(amount);

   
    quadrupleSpeedTimeoutId = setTimeout(() => {
      stopUpdatingAuto(); 
      startUpdatingAuto(amount, quadrupleAmount); 
    }, quadrupleSpeedDelay);
  }, holdDelay);
}


function handleArrowMouseUp() {
  stopUpdatingAuto();
}

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

if (doubleLeftArrow) {
  doubleLeftArrow.addEventListener("click", () => updateCalculatorValue(-10));
}
if (doubleRightArrow) {
  doubleRightArrow.addEventListener("click", () => updateCalculatorValue(10));
}

if (leftArrow && rightArrow) {
  leftArrow.addEventListener("selectstart", (e) => e.preventDefault());
  rightArrow.addEventListener("selectstart", (e) => e.preventDefault());
}

/**
 * 
 * @param {Event} e 
 */
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

/**
 * 
 * @param {number} amount
 */
function adjustTotalPrice(amount) {
    let currentTotalPrice = parseInt(totalPrice.textContent.replace(/\D/g, ''), 10);

    if (isNaN(currentTotalPrice)) {
        currentTotalPrice = 0;
    }

    let newTotalPrice = currentTotalPrice + amount;

  
    newTotalPrice = Math.max(0, Math.min(newTotalPrice, calculateTotalPrice(100000))); 

    let newMinutes = calculateMinutesFromTotalPrice(newTotalPrice);

    
    newMinutes = Math.max(0, Math.min(newMinutes, 100000));

    updateDisplay(newMinutes);
}

function calculateMinutesFromTotalPrice(desiredTotalPrice) {
    let remainingPrice = desiredTotalPrice;
    let calculatedMinutes = 0;

    for (let i = 0; i < PRICE_RANGES.length; i++) {
        const range = PRICE_RANGES[i];
        const prevMax = i > 0 ? PRICE_RANGES[i - 1].max : 0;
        const rangeMinutes = range.max - prevMax;
        const rangePrice = range.price;
        const rangeTotalPrice = rangeMinutes * rangePrice;

        if (remainingPrice >= rangeTotalPrice) {
            calculatedMinutes += rangeMinutes;
            remainingPrice -= rangeTotalPrice;
        } else {
            calculatedMinutes += Math.floor(remainingPrice / rangePrice);
            remainingPrice = 0;
            break;
        }
    }

    return Math.round(calculatedMinutes);
}

if (changeTotalPriceLeft) {
    changeTotalPriceLeft.addEventListener("click", () => adjustTotalPrice(-10)); 

    let totalPriceIntervalId = null;
    let totalPriceHoldTimeoutId = null;
    let totalPriceQuadrupleSpeedTimeoutId = null;

    const totalPriceUpdateInterval = 100; 
    const totalPriceHoldDelay = 500; 
    const totalPriceQuadrupleSpeedDelay = 3000; 
    const totalPriceNormalAmount = -10; 
    const totalPriceQuadrupleAmount = -50;

    function startTotalPriceUpdatingAuto(amount, multiplier = 1) {
      if (totalPriceIntervalId !== null) return; 
      totalPriceIntervalId = setInterval(() => {
          adjustTotalPrice(amount * multiplier);
      }, totalPriceUpdateInterval);
    }

    function stopTotalPriceUpdatingAuto() {
      if (totalPriceIntervalId !== null) {
          clearInterval(totalPriceIntervalId);
          totalPriceIntervalId = null;
      }
      if (totalPriceHoldTimeoutId !== null) {
          clearTimeout(totalPriceHoldTimeoutId);
          totalPriceHoldTimeoutId = null;
      }
      if (totalPriceQuadrupleSpeedTimeoutId !== null) {
          clearTimeout(totalPriceQuadrupleSpeedTimeoutId);
          totalPriceQuadrupleSpeedTimeoutId = null;
      }
    }

    changeTotalPriceLeft.addEventListener("mousedown", () => {
        adjustTotalPrice(totalPriceNormalAmount);
        totalPriceHoldTimeoutId = setTimeout(() => {
            startTotalPriceUpdatingAuto(totalPriceNormalAmount);

            totalPriceQuadrupleSpeedTimeoutId = setTimeout(() => {
                stopTotalPriceUpdatingAuto(); 
                startTotalPriceUpdatingAuto(totalPriceQuadrupleAmount); 
            }, totalPriceQuadrupleSpeedDelay);
        }, totalPriceHoldDelay);
    });

    changeTotalPriceLeft.addEventListener("mouseup", stopTotalPriceUpdatingAuto);
    changeTotalPriceLeft.addEventListener("mouseleave", stopTotalPriceUpdatingAuto);
}

if (changeTotalPriceRight) {
    changeTotalPriceRight.addEventListener("click", () => adjustTotalPrice(10)); 

    let totalPriceIntervalIdRight = null;
    let totalPriceHoldTimeoutIdRight = null;
    let totalPriceQuadrupleSpeedTimeoutIdRight = null;

    const totalPriceUpdateIntervalRight = 100; 
    const totalPriceHoldDelayRight = 500; 
    const totalPriceQuadrupleSpeedDelayRight = 3000; 
    const totalPriceNormalAmountRight = 10; 
    const totalPriceQuadrupleAmountRight = 50;

    function startTotalPriceUpdatingAutoRight(amount, multiplier = 1) {
      if (totalPriceIntervalIdRight !== null) return; 
      totalPriceIntervalIdRight = setInterval(() => {
          adjustTotalPrice(amount * multiplier);
      }, totalPriceUpdateIntervalRight);
    }

    function stopTotalPriceUpdatingAutoRight() {
      if (totalPriceIntervalIdRight !== null) {
          clearInterval(totalPriceIntervalIdRight);
          totalPriceIntervalIdRight = null;
      }
      if (totalPriceHoldTimeoutIdRight !== null) {
          clearTimeout(totalPriceHoldTimeoutIdRight);
          totalPriceHoldTimeoutIdRight = null;
      }
      if (totalPriceQuadrupleSpeedTimeoutIdRight !== null) {
          clearTimeout(totalPriceQuadrupleSpeedTimeoutIdRight);
          totalPriceQuadrupleSpeedTimeoutIdRight = null;
      }
    }

    changeTotalPriceRight.addEventListener("mousedown", () => {
        adjustTotalPrice(totalPriceNormalAmountRight);
        totalPriceHoldTimeoutIdRight = setTimeout(() => {
            startTotalPriceUpdatingAutoRight(totalPriceNormalAmountRight);

            totalPriceQuadrupleSpeedTimeoutIdRight = setTimeout(() => {
                stopTotalPriceUpdatingAutoRight(); 
                startTotalPriceUpdatingAutoRight(totalPriceQuadrupleAmountRight); 
            }, totalPriceQuadrupleSpeedDelayRight);
        }, totalPriceHoldDelayRight);
    });

    changeTotalPriceRight.addEventListener("mouseup", stopTotalPriceUpdatingAutoRight);
    changeTotalPriceRight.addEventListener("mouseleave", stopTotalPriceUpdatingAutoRight);
}

/**
 * 
 * @param {number} minutes 
 * @returns {number} totalPrice
 */
function calculateTotalPrice(minutes) {
  let total = 0;
  let remainingMinutes = minutes;

  for (let i = 0; i < PRICE_RANGES.length; i++) {
    const range = PRICE_RANGES[i];
    const prevMax = i > 0 ? PRICE_RANGES[i - 1].max : 0;
    const rangeMinutes = range.max - prevMax;

    if (remainingMinutes > rangeMinutes) {
      total += rangeMinutes * range.price;
      remainingMinutes -= rangeMinutes;
    } else {
      total += remainingMinutes * range.price;
      remainingMinutes = 0;
      break;
    }
  }

  return total;
}

updateSliderDimensions();

function animateDisplay() {
  const phases = [{ start: 1000, end: 0, duration: 1500 }];

  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
  let startTime;

  function update(timestamp) {
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

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
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
const loginBtn = document.querySelector('.login');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.getElementById('close-modal');
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');
const modal = document.querySelector('.modal');

loginBtn.addEventListener('click', function() {
    modalOverlay.style.display = 'flex';
});

closeModal.addEventListener('click', function() {
    modal.classList.add('modal-closing'); 
    setTimeout(function() {
        modalOverlay.style.display = 'none'; 
        modal.classList.remove('modal-closing');
    }, 400); 
});

modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) { 
        closeModal.click(); 
    }
});

togglePassword.addEventListener('click', function() {
    const password = passwordInput.value;

    if (passwordInput.type === 'password') {
        passwordInput.setAttribute('type', 'text');
        passwordInput.value = password;
        togglePassword.textContent = '🙈';
    } else {
        passwordInput.setAttribute('type', 'password');
        passwordInput.value = password;
        togglePassword.textContent = '👁️';
    }
});


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
    const rect = cardElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = (mouseY / rect.height) * 30 - 15;
    const rotateY = (mouseX / rect.width) * -30 + 15;

    cardElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`; // Add translateZ for depth
  });

  card.addEventListener("mouseleave", () => {
    cardElement.style.transition = "transform 0.5s ease-out";
    cardElement.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
  });
});
