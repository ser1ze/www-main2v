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

const INITIAL_PRICE_RANGES = [
  { max: 999, price: 4, widthPercentage: 23.8, discount: 0 },
  { max: 9999, price: 3, widthPercentage: 25.6, discount: 25 },
  { max: 49999, price: 2, widthPercentage: 26.2, discount: 50 },
  { max: 100000, price: 1.9, widthPercentage: 24.4, discount: 52.5 },
];

const PRICE_RANGES = [...INITIAL_PRICE_RANGES];

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
function getMaxMinutes() {
  if (PRICE_RANGES.length > 0) {
    return PRICE_RANGES[PRICE_RANGES.length - 1].max;
  }
  return 100000;
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
  return getMaxMinutes();
}
function setPriceRanges(newRanges) {
  PRICE_RANGES.splice(0, PRICE_RANGES.length, ...newRanges);
  updateSliderDimensions();
  updateDisplay(0, true);
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
  minutes = Math.max(0, Math.min(minutes, getMaxMinutes()));

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

    if (/^\d+$/.test(totalPrice.value)) {
      totalPrice.value = "";
    }
    totalPrice.value = formattedPrice;
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

updateSliderDimensions();
animateDisplay();

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

  currentMinutes = Math.max(0, Math.min(currentMinutes, getMaxMinutes()));

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
}
if (rightArrow) {
  rightArrow.addEventListener("mousedown", () => handleArrowMouseDown(1));
  rightArrow.addEventListener("mouseup", handleArrowMouseUp);
}
if (priceLeftArrow) {
  priceLeftArrow.addEventListener("mousedown", () => handleArrowMouseDown(-1));
  priceLeftArrow.addEventListener("mouseup", handleArrowMouseUp);
}
if (priceRightArrow) {
  priceRightArrow.addEventListener("mousedown", () => handleArrowMouseDown(1));
  priceRightArrow.addEventListener("mouseup", handleArrowMouseUp);
}

function calculateMinutesFromPrice(price) {
  for (let i = PRICE_RANGES.length - 1; i >= 0; i--) {
    const range = PRICE_RANGES[i];
    const minMinutes = i > 0 ? PRICE_RANGES[i - 1].max + 1 : 0;
    const minPrice = minMinutes * range.price;
    const maxPrice = range.max * range.price;

    if (price >= minPrice && price <= maxPrice) {
      return Math.floor(price / range.price);
    }
  }

  return 0;
}
function updateDisplay(minutes, smooth = false) {
  minutes = Math.max(0, Math.min(minutes, getMaxMinutes()));

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

    if (/^\d+$/.test(totalPrice.value)) {
      totalPrice.value = "";
    }
    totalPrice.value = formattedPrice;
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

if (totalPrice) {
  let timer;

  totalPrice.addEventListener("click", () => {
    if (totalPrice.value === "0 Рублей") {
      totalPrice.value = "";
    }
  });
  totalPrice.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value > 200000) {
      value = "200000";
    }

    if (value === "0") {
      e.target.value = "";
    } else {
      e.target.value = value;
    }

    clearTimeout(timer);
    timer = setTimeout(function () {
      if (value === "") {
        updateDisplay(0);
        return;
      }

      let totalValue = parseInt(value, 10);
      let totalMinutes = calculateMinutesFromPrice(totalValue);
      updateDisplay(totalMinutes);

      let formattedPrice = totalValue
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      e.target.value = formattedPrice;
    }, 2000);
  });

  totalPrice.addEventListener("blur", function () {
    let value = this.value.replace(/\D/g, "");
    if (value === "") {
      this.value = "0 рублей";
      updateDisplay(0);
    } else {
      let totalValue = Math.min(200000, parseInt(value, 10));
      let formattedPrice = totalValue
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      this.value = formattedPrice;
    }
  });
}

if (calculatorInput) {
  calculatorInput.addEventListener("input", function () {
    let minutes = parseInt(calculatorInput.value.replace(/\D/g, ""), 10);

    if (isNaN(minutes)) {
      minutes = 0;
    }

    minutes = Math.max(0, Math.min(minutes, getMaxMinutes()));
    updateDisplay(minutes);
  });

  calculatorInput.addEventListener("blur", function () {
    let value = this.value.replace(/\D/g, "");
    if (value === "") {
      this.value = "0 Минут";
      updateDisplay(0);
    } else {
      let minutes = Math.max(0, Math.min(parseInt(value, 10), getMaxMinutes()));
      this.value = minutes;
      updateDisplay(minutes);
    }
  });
}

updateSliderDimensions();
window.addEventListener("resize", updateSliderDimensions);
updateDisplay(0);

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

const loginBtn = document.querySelector(".login");
const modalOverlay = document.getElementById("modal-overlay");
const closeLoginModalBtn = document.getElementById("close-login-modal");
const closeRegisterModalBtn = document.getElementById("close-register-modal");
const closeModalButton = document.getElementById("close-modal");
const openLoginButton = document.getElementById("open-login");
const openRegisterButton = document.getElementById("open-register");
const modalContent = document.getElementById("modal-content");

loginBtn.addEventListener("click", () => {
  modalOverlay.style.display = "flex";
  showLoginForm();
});

closeModalButton.addEventListener("click", () => {
  modalOverlay.style.display = "none";
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = "none";
  }
});

function showLoginForm() {
  modalContent.innerHTML = `
    <form id="login-modal">
          <div class="input-wrapper">
            <div class="input-group">
              <input
                type="email"
                id="email"
                name="email"
                title=""
                placeholder="email"
                required
              />
              <label for="email" class="form-label">Email</label>
            </div>
            <div class="input-group">
              <input
                type="password"
                id="password"
                name="password"
                title=""
                placeholder="Пароль"
                required
                autocomplete="off"
              />
              <label for="password" class="form-label">Пароль</label>
              <button type="button" class="toggle-password-btn">
                <span class="toggle-password" id="toggle-password">
                  <img
                    class="toggle-password-icon"
                    src="./img/showPassword.svg"
                    alt="Показать/Скрыть пароль"
                  />
                </span>
              </button>
            </div>
          </div>

          <div class="forgot-password-container">
            <button type="button" class="forgot-password" id="forgot-password">
              Забыли пароль?
            </button>
          </div>

          <div class="btn-container">
            <div class="cards">
              <div class="card-wrap enter-wrap">
                <div class="card enter">
                  <div class="card-content enter-content">
                    <button class="submitBtn" type="submit">Войти</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="social-login">
            <h4 class="login-with">вход с помощью</h4>
            <div class="socials">
              <div class="log_in_with">
                <div class="row">
                  <!-- Google -->
                  <a
                    href="#"
                    class="log_in_item"
                    aria-label="Войти через Google"
                  >
                    <div class="log_in_item--inner">
                      <div class="flip_item-front">
                        <svg
                          width="27"
                          height="27"
                          viewBox="0 0 27 27"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clip-path="url(#clip0_732_1069)">
                            <path
                              d="M26.2954 10.9444H25.2442V10.8902H13.4992V16.1102H20.8744C19.7985 19.1489 16.9072 21.3302 13.4992 21.3302C9.1751 21.3302 5.66922 17.8243 5.66922 13.5002C5.66922 9.17608 9.1751 5.67019 13.4992 5.67019C15.4952 5.67019 17.3111 6.42318 18.6938 7.65314L22.385 3.96195C20.0542 1.78978 16.9366 0.450195 13.4992 0.450195C6.29236 0.450195 0.449219 6.29333 0.449219 13.5002C0.449219 20.7071 6.29236 26.5502 13.4992 26.5502C20.7061 26.5502 26.5492 20.7071 26.5492 13.5002C26.5492 12.6252 26.4592 11.7711 26.2954 10.9438Z"
                              fill="#FFC107"
                            />
                            <path
                              d="M1.95508 7.42607L6.24266 10.5705C7.4028 7.69817 10.2125 5.6702 13.5004 5.6702C15.4964 5.6702 17.3123 6.42318 18.695 7.65314L22.3862 3.96195C20.0554 1.78978 16.9378 0.450195 13.5004 0.450195C8.48791 0.450195 4.14095 3.28009 1.95508 7.42607Z"
                              fill="#FF3D00"
                            />
                            <path
                              d="M13.5006 26.5503C16.8714 26.5503 19.9342 25.2603 22.25 23.1625L18.211 19.7447C16.9008 20.7372 15.2721 21.3303 13.5006 21.3303C10.1063 21.3303 7.22418 19.1659 6.13842 16.1455L1.88281 19.4243C4.04259 23.6506 8.42869 26.5503 13.5006 26.5503Z"
                              fill="#4CAF50"
                            />
                            <path
                              d="M26.2962 10.9438H25.245V10.8896H13.5V16.1096H20.8752C20.3584 17.5693 19.4195 18.828 18.2084 19.7447L18.2104 19.7434L22.2494 23.1612C21.9636 23.4209 26.55 20.0246 26.55 13.4996C26.55 12.6246 26.46 11.7705 26.2962 10.9438Z"
                              fill="#1976D2"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_732_1069">
                              <rect
                                width="27"
                                height="27"
                                rx="5"
                                fill="white"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <div class="flip_item-back">
                        <span class="flip_item-back-text">Google</span>
                      </div>
                    </div>
                  </a>
                  <a
                    href="#"
                    class="log_in_item"
                    aria-label="Войти через Apple"
                  >
                    <div class="log_in_item--inner">
                      <div class="flip_item-front">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="21"
                          height="25"
                          viewBox="0 0 21 25"
                          fill="none"
                        >
                          <path
                            d="M20.3318 8.5225C20.1822 8.635 17.5404 10.0775 17.5404 13.285C17.5404 16.995 20.902 18.3075 21.0026 18.34C20.9871 18.42 20.4686 20.1375 19.2302 21.8875C18.126 23.4275 16.9729 24.965 15.2186 24.965C13.4643 24.965 13.0128 23.9775 10.9876 23.9775C9.01401 23.9775 8.31229 24.9975 6.70762 24.9975C5.10295 24.9975 3.98329 23.5725 2.69595 21.8225C1.20479 19.7675 0 16.575 0 13.545C0 8.685 3.26093 6.1075 6.47027 6.1075C8.17555 6.1075 9.59705 7.1925 10.6677 7.1925C11.6867 7.1925 13.2759 6.0425 15.216 6.0425C15.9512 6.0425 18.593 6.1075 20.3318 8.5225ZM14.295 3.985C15.0973 3.0625 15.6649 1.7825 15.6649 0.5025C15.6649 0.325 15.6494 0.145 15.6158 0C14.3104 0.0475 12.7574 0.8425 11.8209 1.895C11.0856 2.705 10.3994 3.985 10.3994 5.2825C10.3994 5.4775 10.4329 5.6725 10.4484 5.735C10.531 5.75 10.6651 5.7675 10.7993 5.7675C11.9705 5.7675 13.4436 5.0075 14.295 3.985Z"
                            fill="black"
                          ></path>
                        </svg>
                      </div>
                      <div class="flip_item-back">
                        <span class="flip_item-back-text">Apple</span>
                      </div>
                    </div>
                  </a>

                  <!-- Sberbank -->
                  <a
                    href="#"
                    class="log_in_item"
                    aria-label="Войти через СБЕР ID"
                  >
                    <div class="log_in_item--inner">
                      <div class="flip_item-front">
                        <svg
                          width="27"
                          height="26"
                          viewBox="0 0 27 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M23.3779 5.05078C23.9872 5.84921 24.5031 6.71663 24.915 7.63563L13.2301 16.3651L8.34668 13.2627V9.53035L13.2301 12.6328L23.3779 5.05078Z"
                            fill="#21A038"
                          />
                          <path
                            d="M3.36294 12.9998C3.36294 12.8323 3.36697 12.6659 3.37503 12.5005L0.415532 12.3535C0.405459 12.5679 0.399418 12.7843 0.399418 13.0028C0.398158 14.7095 0.729411 16.3997 1.37418 17.9763C2.01895 19.5531 2.96454 20.9852 4.1567 22.1906L6.25595 20.0642C5.33826 19.1379 4.61025 18.0369 4.11377 16.8246C3.61729 15.6122 3.36213 14.3123 3.36294 12.9998Z"
                            fill="url(#paint0_linear_732_1078)"
                          />
                          <path
                            d="M13.2272 3.00332C13.3923 3.00332 13.5565 3.00945 13.7197 3.01762L13.8678 0.0172752C13.6556 0.0070665 13.442 0.00196277 13.2272 0.00196277C11.5423 -0.000119562 9.87365 0.335107 8.31701 0.988393C6.76035 1.64168 5.34637 2.60016 4.15625 3.8088L6.25549 5.93629C7.16952 5.00595 8.25599 4.26788 9.45244 3.76454C10.6489 3.2612 11.9317 3.0025 13.2272 3.00332Z"
                            fill="url(#paint1_linear_732_1078)"
                          />
                          <path
                            d="M13.2276 22.9973C13.0624 22.9973 12.8982 22.9973 12.734 22.9841L12.5859 25.9834C12.7988 25.9943 13.0127 25.9998 13.2276 25.9998C14.9118 26.0015 16.5796 25.6661 18.1354 25.0126C19.6912 24.3591 21.1043 23.4005 22.2935 22.1919L20.1983 20.0654C19.2841 20.9953 18.1977 21.7329 17.0015 22.2361C15.8053 22.7392 14.5227 22.998 13.2276 22.9973Z"
                            fill="url(#paint2_linear_732_1078)"
                          />
                          <path
                            d="M18.7881 4.74707L21.2822 2.88398C19.0026 1.01319 16.157 -0.0051931 13.2236 1.99146e-05V3.0024C15.21 2.99991 17.1502 3.60826 18.7881 4.74707Z"
                            fill="url(#paint3_linear_732_1078)"
                          />
                          <path
                            d="M26.0549 13.0005C26.0565 12.2195 25.9891 11.4398 25.8534 10.6709L23.0924 12.7331C23.0924 12.8219 23.0924 12.9107 23.0924 13.0005C23.0931 14.3974 22.8042 15.7788 22.2444 17.0552C21.6846 18.3316 20.8663 19.4746 19.8428 20.41L21.8343 22.6407C23.165 21.4231 24.2284 19.9359 24.9554 18.2752C25.6826 16.6144 26.0571 14.8174 26.0549 13.0005Z"
                            fill="#21A038"
                          />
                          <path
                            d="M13.2279 22.9974C11.8495 22.9979 10.4864 22.705 9.22673 22.1377C7.96715 21.5704 6.83915 20.7413 5.91579 19.7041L3.71582 21.7213C4.917 23.0702 6.38451 24.148 8.02318 24.8851C9.66185 25.6221 11.4351 26.0019 13.2279 25.9998V22.9974Z"
                            fill="url(#paint4_linear_732_1078)"
                          />
                          <path
                            d="M6.61255 5.58998L4.62209 3.35938C3.29099 4.57664 2.22722 6.06386 1.49977 7.72458C0.772317 9.38529 0.397431 11.1824 0.399422 12.9994H3.36295C3.36233 11.6027 3.6513 10.2213 4.21109 8.94485C4.77089 7.66847 5.58904 6.52548 6.61255 5.58998Z"
                            fill="url(#paint5_linear_732_1078)"
                          />
                          <defs>
                            <linearGradient
                              id="paint0_linear_732_1078"
                              x1="4.75606"
                              y1="21.816"
                              x2="1.44042"
                              y2="12.3584"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop offset="0.14" stop-color="#F1E813" />
                              <stop offset="0.3" stop-color="#E6E418" />
                              <stop offset="0.58" stop-color="#C9DA26" />
                              <stop offset="0.89" stop-color="#A2CC39" />
                            </linearGradient>
                            <linearGradient
                              id="paint1_linear_732_1078"
                              x1="5.00239"
                              y1="4.33965"
                              x2="13.3699"
                              y2="1.19324"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop offset="0.06" stop-color="#0FA7DF" />
                              <stop offset="0.54" stop-color="#0098F8" />
                              <stop offset="0.92" stop-color="#0290EA" />
                            </linearGradient>
                            <linearGradient
                              id="paint2_linear_732_1078"
                              x1="12.3906"
                              y1="24.1877"
                              x2="21.8331"
                              y2="22.0828"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop offset="0.12" stop-color="#A2CC39" />
                              <stop offset="0.28" stop-color="#86C239" />
                              <stop offset="0.87" stop-color="#219F38" />
                            </linearGradient>
                            <linearGradient
                              id="paint3_linear_732_1078"
                              x1="12.6072"
                              y1="1.00558"
                              x2="20.6883"
                              y2="3.46625"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop offset="0.06" stop-color="#0290EA" />
                              <stop offset="0.79" stop-color="#0C89CA" />
                            </linearGradient>
                            <linearGradient
                              id="paint4_linear_732_1078"
                              x1="4.45922"
                              y1="21.3559"
                              x2="13.2634"
                              y2="24.6026"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop offset="0.13" stop-color="#F1E813" />
                              <stop offset="0.3" stop-color="#EAE616" />
                              <stop offset="0.53" stop-color="#D8DF1F" />
                              <stop offset="0.8" stop-color="#BAD52D" />
                              <stop offset="0.98" stop-color="#A2CC39" />
                            </linearGradient>
                            <linearGradient
                              id="paint5_linear_732_1078"
                              x1="1.50344"
                              y1="13.3629"
                              x2="5.1089"
                              y2="4.10832"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop offset="0.07" stop-color="#A2CC39" />
                              <stop offset="0.26" stop-color="#81C45E" />
                              <stop offset="0.92" stop-color="#0FA7DF" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div class="flip_item-back">
                        <span class="flip_item-back-text">СБЕР ID</span>
                      </div>
                    </div>
                  </a>

                  <!-- VKontakte -->

                  <!-- Yandex -->
                  <a
                    href="#"
                    class="log_in_item"
                    aria-label="Войти через Яндекс"
                  >
                    <div class="log_in_item--inner">
                      <div class="flip_item-front">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="21"
                          viewBox="0 0 14 21"
                          fill="none"
                        >
                          <path
                            d="M10.3343 2.83913H8.69638C5.69359 2.83913 4.11421 4.35592 4.11421 6.59222C4.11421 9.12021 5.20613 10.3047 7.44847 11.8232L9.30084 13.0678L3.97772 21H0L4.77716 13.9039C2.02963 11.9399 0.487465 10.0324 0.487465 6.80613C0.487465 2.76134 3.31476 0 8.67688 0H14V20.9806H10.3343V2.83913Z"
                            fill="#FC3F1D"
                          ></path>
                        </svg>
                      </div>
                      <div class="flip_item-back">
                        <span class="flip_item-back-text">Яндекс</span>
                      </div>
                    </div>
                  </a>
                  <a
                    href="#"
                    class="log_in_item"
                    aria-label="Войти через ВКонтакте"
                  >
                    <div class="log_in_item--inner">
                      <div class="flip_item-front">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="20"
                          viewBox="0 0 30 20"
                          fill="none"
                        >
                          <path
                            d="M16.3397 20C6.08985 20 0.243598 12.4925 0 0H5.13429C5.30294 9.16917 9.08798 13.0531 12.0861 13.8539V0H16.9208V7.90791C19.8814 7.56757 22.9916 3.96396 24.0409 0H28.8755C28.0698 4.88488 24.6969 8.48849 22.2984 9.96997C24.6969 11.1712 28.5384 14.3143 30 20H24.6781C23.5351 16.1962 20.6872 13.2533 16.9208 12.8529V20H16.3397Z"
                            fill="#0077FF"
                          ></path>
                        </svg>
                      </div>
                      <div class="flip_item-back" style="font-size: 14px">
                        <span class="flip_item-back-text">ВКонтакте</span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="terms">
            <span class="opacity">
              Используя AUDIO SECTOR, Вы соглашаетесь
            </span>
            <a href="/privacy-policy" target="_blank" class="terms-link">
              <br />с политикой конфиденциальности
            </a>
          </div>
        </form>
        
  `;
  document
    .querySelector(".toggle-password-btn")
    .addEventListener("mousedown", function (event) {
      const passwordField = document.getElementById("password");
      const passwordIcon = document.querySelector(".toggle-password-icon");

      event.preventDefault();
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
      cardElement.style.transform =
        "rotateX(0deg) rotateY(0deg) translateZ(0px)";
    });
  });

  const togglePasswordBtn = document.getElementById("toggle-password");
  const passwordInput = document.getElementById("password");

  const toggleRegisterPasswordBtn = document.getElementById(
    "toggle-register-password"
  );
  const registerPasswordInput = document.getElementById("register-password");

  togglePasswordBtn.addEventListener("click", (event) => {
    togglePasswordVisibility(passwordInput, togglePasswordBtn);
  });

  toggleRegisterPasswordBtn.addEventListener("click", (event) => {
    togglePasswordVisibility(registerPasswordInput, toggleRegisterPasswordBtn);
  });

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

  const togglePassword = document.querySelector(".toggle-password-btn");
  makeButtonClickable(togglePassword);
}

function showRegisterForm() {
  modalContent.innerHTML = `
     <form  id="register-modal">
          <div class="input-wrapper">
            <div class="input-group">
              <input
                type="email"
                id="register-email"
                placeholder="email"
                required
                title=""
              />
              <label for="register-email" class="form-label">Email</label>
            </div>

            <div class="input-group">
              <div class="password-wrapper">
                <input
                  type="password"
                  id="register-password"
                  placeholder="Пароль"
                  required
                  title=""
                />
                <label for="password" class="form-label">Пароль</label>
                <button type="button" class="toggle-password-btn">
                  <span class="toggle-password" id="toggle-register-password">
                    <img
                      class="toggle-password-icon"
                      src="./img/showPassword.svg"
                      alt="Показать/Скрыть пароль"
                    />
                  </span>
                </button>
              </div>
              <div id="password-strength" class="password-strength">
                <div id="strength-indicator" class="strength-indicator"></div>
                <span id="strength-text" class="strength-text"></span>
              </div>
            </div>

            <div class="input-group">
              <input
                type="text"
                id="username"
                placeholder="Имя пользователя"
                required
                title=""
              />
              <label for="username" class="form-label">Отображаемое имя</label>
            </div>

            <div class="input-group">
              <input
                type="text"
                id="nickname"
                placeholder="Ваш никнейм"
                required
                title=""
              />
              <label for="nickname" class="form-label">Ваш никнейм</label>
            </div>
            <div class="input-group">
              <div class="dob-selectors">
                <select id="dob-day" required title=""/>
                  <option selected="selected">День</option>
                </select>
                <select id="dob-month" required>
                  <option selected="selected">Месяц</option>
                  <option value="1">Январь</option>
                  <option value="2">Февраль</option>
                  <option value="3">Март</option>
                  <option value="4">Апрель</option>
                  <option value="5">Май</option>
                  <option value="6">Июнь</option>
                  <option value="7">Июль</option>
                  <option value="8">Август</option>
                  <option value="9">Сентябрь</option>
                  <option value="10">Октябрь</option>
                  <option value="11">Ноябрь</option>
                  <option value="12">Декабрь</option>
                </select>
                <select id="dob-year" required>
                  <option selected="selected">Год</option>
                </select>
              </div>
            </div>
          </div>
          <div class="btn-container">
            <div class="cards">
              <div class="card-wrap enter-wrap">
                <div class="card enter">
                  <div class="card-content enter-content">
                    <button class="submitBtn" type="submit">Продолжить</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="terms">
            <span class="opacity">
              Используя AUDIO SECTOR, Вы соглашаетесь
            </span>
            <a href="/privacy-policy" target="_blank" class="terms-link">
              <br />с политикой конфиденциальности
            </a>
          </div>
        </form>
  `;
  $(document).ready(function () {
    $("select").niceSelect();
  });
  document
    .querySelector(".toggle-password-btn")
    .addEventListener("mousedown", function (event) {
      const passwordField = document.getElementById("password");
      const passwordIcon = document.querySelector(".toggle-password-icon");

      event.preventDefault();
    });

  const passwordStrength = document.getElementById("password-strength");
  const strengthIndicator = document.getElementById("strength-indicator");
  const strengthText = document.getElementById("strength-text");
  const passwordInput = document.getElementById("register-password");

  passwordInput.addEventListener("focus", () => {
    passwordStrength.style.display = "block";
  });

  passwordInput.addEventListener("blur", () => {
    passwordStrength.style.display = "none";
  });

  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    const strength = checkPasswordStrength(password);

    updateStrengthIndicator(strength);
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
      cardElement.style.transform =
        "rotateX(0deg) rotateY(0deg) translateZ(0px)";
    });
  });

  function checkPasswordStrength(password) {
    const weakRegex = /^(?=.*[a-zA-Zа-яА-Я]).{1,}$/;
    const mediumRegex =
      /^(?=.*[a-zA-Zа-яА-Я])(?=.*[\d!@#$%^&*()_+=;'{}\[\]:;"'<>,.?/\\|-]).{6,}$/;
    const strongRegex =
      /^(?=.*[a-zA-Zа-яА-ЯёЁ])(?=.*[A-ZА-ЯЁ])(?=.*\d)(?=.*[!@#+=_\$%^&*<>./-]).{8,}$/;

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

  const togglePasswordBtn = document.getElementById("toggle-register-password");
  togglePasswordBtn.addEventListener("click", () => {
    togglePasswordVisibility(passwordInput, togglePasswordBtn);
  });

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
}

openLoginButton.addEventListener("click", () => {
  openLoginButton.classList.add("active");
  openRegisterButton.classList.remove("active");
  showLoginForm();
});

openRegisterButton.addEventListener("click", () => {
  openRegisterButton.classList.add("active");
  openLoginButton.classList.remove("active");
  showRegisterForm();
});

// ------------------------------------- RESIZE INPUT------------------------------------------------//

calculatorInput.addEventListener("input", resizeInput);
resizeInput.call(calculatorInput);

function resizeInput(totalPrice) {}

//------------------------------------------LADDER NAV ------------------------------------------------//

//--------------------------------------------CALCULATOR BOX ANIMATION -----------------------------------//
document.addEventListener("DOMContentLoaded", function () {
  const calculatorBox = document.querySelector(".calculator-box");

  calculatorBox.style.transition =
    "transform 0.5s ease-in-out, opacity 0.5s ease-in-out";

  function show() {
    setTimeout(function () {
      calculatorBox.style.opacity = "1";
      calculatorBox.style.transform = "scale(1)";
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

  overlay.style.position = "absolute";
  overlay.style.top = "-20%";
  overlay.style.left = "-35px";
  overlay.style.width = "calc(100%)";
  overlay.style.height = "100%";
  overlay.style.zIndex = "0";
  overlay.style.cursor = "default";
  overlay.style.pointerEvents = "none";

  sliderBlock.style.position = "relative";
  sliderBlock.appendChild(overlay);

  sliderBlock.addEventListener("mouseenter", () => {
    overlay.style.pointerEvents = "auto";
  });

  sliderBlock.addEventListener("mouseleave", () => {
    overlay.style.pointerEvents = "none";
  });

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
      console.log("кнопка нажата");
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

document
  .querySelectorAll(".log_in_item")
  .forEach((i) => makeButtonClickable(i));

window.addEventListener("load", function () {
  const modalContent = document.querySelector(".modal-content");

  modalContent.classList.add("onload-animation");

  modalContent.addEventListener("animationend", function () {
    modalContent.classList.remove("onload-animation");
  });
});
const forgotPassword = document.querySelector(".forgot-password");
makeButtonClickable(forgotPassword);

const switchModalsBtns = document.querySelectorAll(".switch-modals__btn");
switchModalsBtns.forEach((btn) => makeButtonClickable(btn));

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

// Nice-Select

// -------------------------------------------------- Gift Mode ------------------------------------------------//

const giftButton = document.getElementById("gift");
const timer = document.querySelector("#timer");
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
let startTime;
let timerRunning = false;

const activateGiftMode = () => {
  if (isGiftModeActive) return;

  isGiftModeActive = true;
  console.log("Режим подарка активирован");

  if (calculatorBox) calculatorBox.style.display = "none";
  if (typingBlock) typingBlock.style.display = "none";
  if (giftDescription) giftDescription.style.display = "block";
  if (giftPostpayment) giftPostpayment.style.display = "none";
  if (timer) timer.style.display = "block";

  updateCardText();

  resetTimerState();
  startResetTimer();
  startTimer();
};

const deactivateGiftMode = () => {
  if (!isGiftModeActive) return;

  isGiftModeActive = false;
  console.log("Режим подарка деактивирован");

  if (calculatorBox) calculatorBox.style.display = "block";
  if (typingBlock) typingBlock.style.display = "flex";
  if (giftDescription) giftDescription.style.display = "none";
  if (giftPostpayment) giftPostpayment.style.display = "none";
  if (timer) timer.style.display = "none";

  updateCardText();
  resetTimerState();
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
  if (isGiftModeActive) {
    if (giftDescription) giftDescription.style.display = "none";
    if (calculatorBox) calculatorBox.style.display = "block";
    if (typingBlock) typingBlock.style.display = "none";
    if (giftPostpayment) giftPostpayment.style.display = "block";
    if (timer) timer.style.display = "none";
  }
};

const resetGiftMode = () => {
  console.log("Сброс режима подарка");
  deactivateGiftMode();
  clearTimeout(resetTimer);
  resetTimerState();
};

const svg = document.getElementById("timer");
const circle = document.getElementById("progress");
const timeText = document.getElementById("time-text");
const radius = 65;
const circumference = 2 * Math.PI * radius;
const duration = 8000;

function updateTimer() {
  const elapsedTime = Date.now() - startTime;
  const remainingTime = Math.max(duration - elapsedTime, 0);
  const progress = remainingTime / duration;
  const offset = circumference * (1 - progress);
  circle.style.strokeDashoffset = offset;
  const seconds = Math.ceil(remainingTime / 1000);
  timeText.textContent = seconds;

  if (remainingTime <= 1000) {
    const opacity = progress;
    svg.style.opacity = opacity;
  }

  if (remainingTime <= 0) {
    console.log(
      "Таймер истек, сбрасываем блоки, но не деактивируем режим подарка"
    );
    resetBlocks();
  } else {
    requestAnimationFrame(updateTimer);
  }
}

function startTimer() {
  if (!timerRunning) {
    svg.style.opacity = 1;
    startTime = Date.now();
    timerRunning = true;
    requestAnimationFrame(updateTimer);
    console.log("Таймер запущен");
  }
}

function startResetTimer() {
  if (resetTimer) {
    clearTimeout(resetTimer);
  }

  resetTimer = setTimeout(() => {
    resetBlocks();
  }, 8000);
}

function resetTimerState() {
  timerRunning = false;
  clearTimeout(resetTimer);
}

if (giftButton) {
  giftButton.addEventListener("click", () => {
    if (!isGiftModeActive) {
      console.log("Кнопка подарка нажата: активация режима подарка");
      activateGiftMode();
    } else {
      console.log("Режим подарка уже активен, ничего не делаем.");
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
        if (isGiftModeActive) {
          resetGiftMode();
        }
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

$(function () {
  $(".draggable").draggable({
    cancel: "input,textarea,button,select,option,a,.btn-container",

    scroll: false,
  });
});

// Nav Menu
const buttons = document.querySelectorAll(".rate-btn");
const prevArrow = document.querySelector(".prev-arrow");
const priceSlider = document.querySelector(".price-slider");
const priceParagraphs = priceSlider.querySelectorAll("p");

let activeIndex = 0;
const initialPrices = ["icon", "4 ₽", "3 ₽", "2 ₽"];
let currentPrices = [...initialPrices];
let prevArrowVisible = true;

let priceHistory = [];

const priceMap = {
  "4 ₽": [{ max: 999, price: 4, widthPercentage: 100, discount: 0 }],
  "3 ₽": [{ max: 9999, price: 3, widthPercentage: 100, discount: 25 }],
  "2 ₽": [{ max: 49999, price: 2, widthPercentage: 100, discount: 50 }],
  "1.9 ₽": [{ max: 99999, price: 1.9, widthPercentage: 100, discount: 52.5 }],
  "1.8 ₽": [{ max: 199999, price: 1.8, widthPercentage: 100, discount: 55 }],
  "1.7 ₽": [{ max: 299999, price: 1.7, widthPercentage: 100, discount: 57.5 }],
  "1.6 ₽": [{ max: 399999, price: 1.6, widthPercentage: 100, discount: 60 }],
  "1.5 ₽": [{ max: 499999, price: 1.5, widthPercentage: 100, discount: 62.5 }],
  "1.4 ₽": [{ max: 599999, price: 1.4, widthPercentage: 100, discount: 65 }],
  "1.3 ₽": [{ max: 699999, price: 1.3, widthPercentage: 100, discount: 67.5 }],
  "1.2 ₽": [{ max: 799999, price: 1.2, widthPercentage: 100, discount: 70 }],
  "1.1 ₽": [{ max: 899999, price: 1.1, widthPercentage: 100, discount: 72.5 }],
  "1 ₽": [{ max: 1000000, price: 1, widthPercentage: 100, discount: 75 }],
};

const priceRanges = {
  "4 ₽": { min: 0, max: 999 },
  "3 ₽": { min: 1000, max: 9999 },
  "2 ₽": { min: 10000, max: 49999 },
  "1.9 ₽": { min: 50000, max: 99999 },
  "1.8 ₽": { min: 100000, max: 199999 },
  "1.7 ₽": { min: 200000, max: 299999 },
  "1.6 ₽": { min: 300000, max: 399999 },
  "1.5 ₽": { min: 400000, max: 499999 },
  "1.4 ₽": { min: 500000, max: 599999 },
  "1.3 ₽": { min: 600000, max: 699999 },
  "1.2 ₽": { min: 700000, max: 799999 },
  "1.1 ₽": { min: 800000, max: 899999 },
  "1 ₽": { min: 900000, max: Infinity },
};

function formatNumber(num) {
  return num.toLocaleString("ru-RU");
}

function updatePriceSlider() {
  const selectedPrice = currentPrices[activeIndex];

  if (selectedPrice === "icon") {
    return;
  }

  const selectedRange = priceRanges[selectedPrice];

  if (!selectedRange) {
    console.error(`Диапазон не найден для тарифа: ${selectedPrice}`);
    return;
  }

  if (selectedPrice !== "icon" && priceMap[selectedPrice]) {
    setPriceRanges(priceMap[selectedPrice]);
  }

  const minPrice = selectedRange.min;
  const maxPrice = selectedRange.max;

  if (selectedPrice === "1 ₽") {
    priceParagraphs[1].textContent = formatNumber(minPrice);
    priceParagraphs[3].textContent = "";
  } else {
    priceParagraphs[1].textContent = formatNumber(minPrice);
    priceParagraphs[3].textContent = formatNumber(maxPrice);
  }

  priceParagraphs[0].style.display = "none";
  priceParagraphs[2].style.display = "none";
  priceParagraphs[4].style.display = "none";
  priceParagraphs[1].style.display = "block";
  priceParagraphs[3].style.display = "block";
}

function resetPriceSlider() {
  priceParagraphs[0].style.display = "block";
  priceParagraphs[1].style.display = "block";
  priceParagraphs[2].style.display = "block";
  priceParagraphs[3].style.display = "block";
  priceParagraphs[4].style.display = "block";

  priceParagraphs[1].textContent = formatNumber(1000);
  priceParagraphs[2].textContent = formatNumber(10000);
  priceParagraphs[3].textContent = formatNumber(50000);
}

function updatePrices() {
  buttons.forEach((button, index) => {
    const priceSpan = button.querySelector(".main-price");
    const rangeSpan = button.querySelector(".price-range");

    if (priceSpan) {
      if (currentPrices[index] === "icon") {
        priceSpan.innerHTML = "";
      } else {
        priceSpan.textContent = currentPrices[index];
        if (rangeSpan) {
          const range = priceRanges[currentPrices[index]];
          rangeSpan.textContent =
            currentPrices[index] === "1 ₽"
              ? `от ${formatNumber(range.min)}`
              : `${formatNumber(range.min)} - ${formatNumber(range.max)}`;
        }
      }
    }
  });

  if (currentPrices[1] === "1.2 ₽" && buttons.length > 2) {
    nextArrow.style.display = "none";
  } else {
    buttons[buttons.length - 1].style.display = "block";
    nextArrow.style.display = "block";
  }
}

function switchPrices() {
  buttons.forEach((button, index) => {
    button.classList.remove("active");
    if (index === activeIndex) {
      button.classList.add("active");
    }
  });

  updatePriceSlider();
}

function updateDecreasingPrices() {
  const newPrices = [];
  let basePrice = parseFloat(currentPrices[3]);

  while (basePrice >= 1) {
    newPrices.push(
      `${
        basePrice % 1 === 0 ? parseInt(basePrice, 10) : basePrice.toFixed(1)
      } ₽`
    );
    basePrice = parseFloat((basePrice - 0.1).toFixed(1));
  }

  if (!newPrices.includes("1 ₽")) {
    newPrices.push("1 ₽");
  }

  currentPrices = ["icon", ...newPrices];

  updatePrices();
}

function resetToInitialPrices() {
  currentPrices = [...initialPrices];
  activeIndex = 0;
  updatePrices();
  switchPrices();
  resetPriceSlider();
  setPriceRanges(INITIAL_PRICE_RANGES);
  updatePrevArrowVisibility();
}

function updatePrevArrowVisibility() {
  if (parseFloat(currentPrices[1]) <= 3 && !prevArrowVisible) {
    prevArrow.style.display = "block";
    prevArrowVisible = true;
  } else if (parseFloat(currentPrices[1]) > 3) {
    prevArrow.style.display = "none";
    prevArrowVisible = false;
  }
}

nextArrow.addEventListener("click", function () {
  if (activeIndex === 3) {
    updateDecreasingPrices();
  }

  if (activeIndex < buttons.length - 1) {
    activeIndex++;
  } else {
    activeIndex = 0;
  }

  switchPrices();
  updatePrevArrowVisibility();

  priceHistory.push({
    prices: [...currentPrices],
    activeIndex,
    lastButtonDisplay: buttons[buttons.length - 1].style.display,
    nextArrowDisplay: nextArrow.style.display,
    savedPriceRanges: PRICE_RANGES.map((range) => ({ ...range })),
  });
});

prevArrow.addEventListener("click", function () {
  if (priceHistory.length > 0) {
    const previousState = priceHistory.pop();
    currentPrices = [...previousState.prices];
    activeIndex = previousState.activeIndex;

    setPriceRanges(previousState.savedPriceRanges);

    buttons.forEach((btn) => btn.classList.remove("active"));
    buttons[activeIndex].classList.add("active");

    buttons[buttons.length - 1].style.display = previousState.lastButtonDisplay;
    nextArrow.style.display = previousState.nextArrowDisplay;

    updatePrices();
    switchPrices();
    updatePrevArrowVisibility();
    updateDisplay(0);
  } else {
    buttons.forEach((btn) => btn.classList.remove("active"));
    activeIndex = buttons.length - 1;
    buttons[activeIndex].classList.add("active");
  }
});

buttons.forEach((button, index) => {
  button.addEventListener("click", function () {
    if (currentPrices[index] === "icon") {
      resetToInitialPrices();
      updateDisplay(0);
      return;
    }

    const clickedIndex = Array.from(buttons).indexOf(this);

    if (activeIndex !== clickedIndex) {
      priceHistory.push({
        prices: [...currentPrices],
        activeIndex,
        lastButtonDisplay: buttons[buttons.length - 1].style.display,
        nextArrowDisplay: nextArrow.style.display,
      });

      activeIndex = clickedIndex;
      buttons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      updatePrices();
      switchPrices();
    }
  });
});

updatePrices();
updatePrevArrowVisibility();
updatePriceSlider();
