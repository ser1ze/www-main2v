// ----------------------------------------------------------------CURRENCY--------------------------------------------------------------------//
const currencyElement = document.querySelector('.currency');
const currencyChangeWindow = document.querySelector('.currency-change-window');

// Get all currency options
const dollarOption = document.querySelector('.dollar');
const euroOption = document.querySelector('.euro');
const rubleOption = document.querySelector('.ruble');

function selectCurrency(currency) {
    updateCurrencyDisplay(currency);
    updateCurrencyOptions(currency);
    toggleCurrencyWindow(); // Close the window after selection
  }

// Get all currency display images
const rubleDisplay = document.querySelector('.currency-display img[alt="рубль"]');
const euroDisplay = document.querySelector('.currency-display img[alt="евро"]');
const dollarDisplay = document.querySelector('.currency-display img[alt="доллар"]');

dollarOption.addEventListener('click', () => selectCurrency('dollar'));
euroOption.addEventListener('click', () => selectCurrency('euro'));
rubleOption.addEventListener('click', () => selectCurrency('ruble'));

// Function to toggle the currency change window
function toggleCurrencyWindow() {
  currencyChangeWindow.classList.toggle('hide');
  if (!currencyChangeWindow.classList.contains('hide')) {
    // Add animate class after a small delay to ensure the window is visible
    setTimeout(() => {
      currencyChangeWindow.classList.add('animate');
    }, 50);
  } else {
    currencyChangeWindow.classList.remove('animate');
  }
}

// Function to update the currency display
function updateCurrencyDisplay(selectedCurrency) {
  rubleDisplay.classList.add('hide');
  euroDisplay.classList.add('hide');
  dollarDisplay.classList.add('hide');

  if (selectedCurrency === 'ruble') {
    rubleDisplay.classList.remove('hide');
  } else if (selectedCurrency === 'euro') {
    euroDisplay.classList.remove('hide');
  } else if (selectedCurrency === 'dollar') {
    dollarDisplay.classList.remove('hide');
  }
}

// Function to update the currency options
function updateCurrencyOptions(selectedCurrency) {
  rubleOption.classList.add('hide');
  euroOption.classList.add('hide');
  dollarOption.classList.add('hide');

  if (selectedCurrency !== 'ruble') {
    rubleOption.classList.remove('hide');
  }
  if (selectedCurrency !== 'euro') {
    euroOption.classList.remove('hide');
  }
  if (selectedCurrency !== 'dollar') {
    dollarOption.classList.remove('hide');
  }

  document.querySelectorAll('.currency-change-window > div:not(.hide) .currency-text').forEach(text => {
    text.style.transition = 'none';
    text.style.transform = 'translateY(100%)';
    text.offsetHeight; 
    text.style.transition = 'transform 0.3s ease-out';
    text.style.transform = 'translateY(0)';
  });
}

// Add click event listener to the currency element


// Add click event listeners to currency options
dollarOption.addEventListener('click', () => {
  updateCurrencyDisplay('dollar');
  updateCurrencyOptions('dollar');
  toggleCurrencyWindow();
});

euroOption.addEventListener('click', () => {
  updateCurrencyDisplay('euro');
  updateCurrencyOptions('euro');
  toggleCurrencyWindow();
});

rubleOption.addEventListener('click', () => {
  updateCurrencyDisplay('ruble');
  updateCurrencyOptions('ruble');
  toggleCurrencyWindow();
});

// Close the currency window when clicking outside of it
document.addEventListener('click', (event) => {
  if (!currencyElement.contains(event.target) && !currencyChangeWindow.contains(event.target)) {
    currencyChangeWindow.classList.add('hide');
    currencyChangeWindow.classList.remove('animate');
  }
});

// ----------------------------------------------------------MICROPHONE--------------------------------------------------------//
const slider = document.querySelector('.price-slider');
const microphone = document.querySelector('.microphone');
const totalPrice = document.querySelector('.price-display-box h1');
const priceCounters = document.querySelectorAll('.price-top .price-counter');
const priceCountersPercent = document.querySelectorAll('.price-bottom .price-counter-percent');
const activePriceCounter = document.querySelector('.microphone .price-counter-active');
const activePriceCounterPercent = document.querySelector('.microphone .price-counter-active:last-child');
const calculatorInput = document.querySelector('.calculator-value input');
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

// Add the styles to the document
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
    { max: 100000, price: 2, widthPercentage: 24.4, discount: 60 }
];

function updateSliderDimensions() {
  const windowWidth = window.innerWidth;
  if (windowWidth >= 1001) {
      SLIDER_WIDTH = 1125;
      isRotated = false;
  } else if (windowWidth <= 1000 && windowWidth > 700) {
      SLIDER_WIDTH = 920; // Adjust this value as needed
      isRotated = false;
  } else if (windowWidth <= 700 && windowWidth > 480) {
      SLIDER_WIDTH = 700; // Adjust this value as needed
      isRotated = false;
  } else if (windowWidth <= 480 && windowWidth > 425) {
      SLIDER_WIDTH = 340; // Adjust this value as needed
      isRotated = false;
  } else {
      SLIDER_WIDTH = 340;
      SLIDER_HEIGHT = 460;
      isRotated = true;
  }

  // Recalculate widths for each range
  let totalPercentage = PRICE_RANGES.reduce((sum, range) => sum + range.widthPercentage, 0);
  PRICE_RANGES.forEach(range => {
      range.width = (range.widthPercentage / totalPercentage) * SLIDER_WIDTH;
  });
}

function updatePositions(position, smooth = false) {

    
    if (microphone) {
        microphone.classList.toggle('smooth-transition', smooth);
        microphone.style.left = `${position}px`;
    }
}

function calculateMinutes(position) {
  let accumulatedWidth = 0;
  for (let range of PRICE_RANGES) {
      if (position <= accumulatedWidth + range.width) {
          const relativePosition = position - accumulatedWidth;
          const rangePercentage = relativePosition / range.width;
          const prevMax = accumulatedWidth > 0 ? PRICE_RANGES[PRICE_RANGES.indexOf(range) - 1].max : 0;
          return Math.round(prevMax + (range.max - prevMax) * rangePercentage);
      }
      accumulatedWidth += range.width;
  }
  return 100000; // Max value
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

function updateDisplay(minutes, smooth = false) {
  minutes = Math.max(0, Math.min(minutes, 100000));
  if (calculatorInput) {
      calculatorInput.value = minutes;
      resizeInput.call(calculatorInput);
  }
  
  const currentRange = PRICE_RANGES.find(range => minutes <= range.max) || PRICE_RANGES[PRICE_RANGES.length - 1];
  const price = currentRange.price;
  const discount = currentRange.discount;

  if (totalPrice) {
      const formattedPrice = (price * minutes).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      totalPrice.textContent = formattedPrice;
  }

  const position = calculatePosition(minutes);
  updatePositions(position, smooth);

  if (activePriceCounter) {
      activePriceCounter.textContent = price + ' ₽';
  }
  if (activePriceCounterPercent) {
      activePriceCounterPercent.textContent = discount ? `-${discount}%` : '';
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
          const prevMax = accumulatedWidth > 0 ? PRICE_RANGES[PRICE_RANGES.indexOf(range) - 1].max : 0;
          const rangePercentage = (minutes - prevMax) / (range.max - prevMax);
          return accumulatedWidth + (rangePercentage * range.width);
      }
      accumulatedWidth += range.width;
  }
  return SLIDER_WIDTH;
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
    
    // Directly update microphone position for instant movement
    updatePositions(position, smooth);
    
    const minutes = calculateMinutes(position);
    updateDisplay(minutes, smooth);
}

if (microphone) {
    microphone.addEventListener('mousedown', (e) => {
        e.preventDefault();
        
        function onMouseMove(e) {
            moveMicrophone(e, false);  // No smooth transition during drag
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', onMouseMove);
        }, { once: true });
    });
}

if (slider) {
    slider.addEventListener('click', (e) => {
        moveMicrophone(e, true);  // Smooth transition on direct slider click
    });
}

function updateCalculatorValue(changeAmount) {
  let currentMinutes = parseInt(calculatorInput.value, 10);
  currentMinutes += changeAmount;
  currentMinutes = Math.max(0, Math.min(currentMinutes, 100000));
  updateDisplay(currentMinutes, true);
}

document.querySelectorAll('.image-container').forEach(container => {
  const images = container.querySelectorAll('img');
  
  container.addEventListener('mouseenter', () => {
    images[0].classList.add('hide:hover');
    images[1].classList.remove('hide:hover');
  });

  container.addEventListener('mouseleave', () => {
    images[0].classList.remove('hide:hover');
    images[1].classList.add('hide:hover');
  });
});

// Keep your existing code
const leftArrow = document.querySelector('.change-price-left');
const rightArrow = document.querySelector('.change-price-right');
const doubleLeftArrow = document.querySelector('.change-price-left-double');
const doubleRightArrow = document.querySelector('.change-price-right-double');

let intervalId = null;
let timeoutId = null;
const updateInterval = 100; // 10 times per second
const holdDelay = 500; // 0.5 seconds
const updateAmount = 1;

function startUpdating(amount) {
    if (intervalId === null) {
        intervalId = setInterval(() => {
            updateCalculatorValue(amount);
        }, updateInterval);
    }
}

function stopUpdating() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
}

function handleMouseDown(amount) {
    // Immediate update on mouse down
    updateCalculatorValue(amount);
    
    timeoutId = setTimeout(() => {
        startUpdating(amount);
    }, holdDelay);
}

function handleMouseUp() {
    stopUpdating();
}

if (doubleLeftArrow) doubleLeftArrow.addEventListener('click', () => updateCalculatorValue(-10));
if (doubleRightArrow) doubleRightArrow.addEventListener('click', () => updateCalculatorValue(10));

if (leftArrow) {
    leftArrow.addEventListener('mousedown', () => handleMouseDown(-updateAmount));
    leftArrow.addEventListener('mouseup', handleMouseUp);
    leftArrow.addEventListener('mouseleave', handleMouseUp);
}

if (rightArrow) {
    rightArrow.addEventListener('mousedown', () => handleMouseDown(updateAmount));
    rightArrow.addEventListener('mouseup', handleMouseUp);
    rightArrow.addEventListener('mouseleave', handleMouseUp);
}

// Prevent text selection during rapid clicking
leftArrow.addEventListener('selectstart', (e) => e.preventDefault());
rightArrow.addEventListener('selectstart', (e) => e.preventDefault());

function handleInputChange(e) {
    let minutes = parseInt(e.target.value, 10);
    if (isNaN(minutes) || minutes < 1) {
        minutes = 0;
    } else if (minutes > 100000) {
        minutes = 100000;
    }
    updateDisplay(minutes);
}

// Add event listener for the input field
if (calculatorInput) {
    calculatorInput.addEventListener('input', handleInputChange);
    calculatorInput.addEventListener('blur', function() {
        this.value = Math.max(0, Math.min(parseInt(this.value, 10) || 0, 100000));
    });
}
// Initialize
updateSliderDimensions();
function animateDisplay() {
    const phases = [
      { start: 1000, end: 0, duration: 1500 }
    ];
    
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
          const currentValue = Math.round(phase.start + (phase.end - phase.start) * phaseProgress);
          updateDisplay(currentValue);
          break;
        }
        currentTime += phase.duration;
      }
  
      requestAnimationFrame(update);
    }
  
    requestAnimationFrame(update);
  }
  
  // Usage
  animateDisplay();

// Add event listener for window resize
window.addEventListener('resize', () => {
    updateSliderDimensions();
    updateDisplay(calculateMinutes(
        parseFloat(microphone.style.left)));
});

//-------------------------------------------------------TEXT ANIMATION--------------------------------------------------//
const phrases = [
    "вы хотите купить",
    "вы хотите приобрести",
    "вам необходимо",
    "вам потребуется",
    "вам нужно"
  ];
  
  const typingElement = document.getElementById('typing-text');
  const cursorElement = document.getElementById('cursor');
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  function typePhrase() {
    const currentPhrase = phrases[phraseIndex];
    
    if (!isDeleting && charIndex <= currentPhrase.length) {
      typingElement.textContent = currentPhrase.substring(0, charIndex);
      charIndex++;
      if (charIndex > currentPhrase.length) {
        setTimeout(() => {
          isDeleting = true;
          typePhrase();
        }, 10000); // Wait for 10 seconds before deleting
      } else {
        setTimeout(typePhrase, 100); // Typing speed
      }
    } else if (isDeleting && charIndex > 0) {
      typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      setTimeout(typePhrase, 50); // Deleting speed
    } else {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      charIndex = 0;
      setTimeout(typePhrase, 500); // Pause before typing next phrase
    }
  }
  
  // Cursor blinking effect
  function blinkCursor() {
    cursorElement.style.visibility = (cursorElement.style.visibility === 'visible') ? 'hidden' : 'visible';
  }
  
  setInterval(blinkCursor, 530); // Blink every 530ms for a more natural feel
  
  // Start the animation
  typePhrase();


  //------------------------------------------------------POP-UP----------------------------------------------//
  let loggedIn = false;

  // Wait for the DOM to be fully loaded before attaching event listeners
  // document.addEventListener('DOMContentLoaded', () => {
  //     const buyButton = document.querySelector('.buy-button');
  //     const modal = document.getElementById('loginModal');
  //     const closeBtn = document.querySelector('.close');
  //     const body = document.body;
  
  //     function openModal() {
  //         modal.style.display = 'flex';
  //         body.classList.add('modal-open');
  //     }
  
  //     function closeModal() {
  //         modal.style.display = 'none';
  //         body.classList.remove('modal-open');
  //     }
  
  //     buyButton.addEventListener('click', () => {
  //         if (!loggedIn) {
  //             openModal();
  //         } else {
  //             // Proceed with the purchase logic
  //             console.log('User is logged in. Proceeding with purchase...');
  //         }
  //     });
  
  //     closeBtn.addEventListener('click', closeModal);
  
  //     window.addEventListener('click', (event) => {
  //         if (event.target === modal) {
  //             closeModal();
  //         }
  //     });
  // });


  // ------------------------------------- RESIZE INPUT------------------------------------------------//

calculatorInput.addEventListener('input', resizeInput); 
resizeInput.call(calculatorInput); 

function resizeInput(totalPrice) {
}

//------------------------------------------LADDER NAV ------------------------------------------------//


//--------------------------------------------CALCULATOR BOX ANIMATION -----------------------------------//
document.addEventListener('DOMContentLoaded', function() {
  const calculatorBox = document.querySelector('.calculator-box');
  const buyButton = document.querySelector('.buy-button');
  const balance = document.querySelector(".balance")

 
  
  calculatorBox.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
  balance.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
  

  function show() {
     
      setTimeout(function() {
          calculatorBox.style.opacity = '1';
          calculatorBox.style.transform = 'scale(1)';
          balance.style.opacity = "1"
          balance.style.transform = "scale(1)"
          buyButton.style.opacity = '1';
          buyButton.style.transform = 'scale(1)';
      }, 100);

      
    
  }
show()
 
});


  //--------------------------------------------------WHEEL MICROPHONE MOVEMENT----------------------------------//

  function createSliderOverlay() {
    const sliderBlock = document.querySelector('.price-slider-block');
    const slider = document.querySelector('.price-slider');
    const overlay = document.createElement('div');
    overlay.className = 'slider-overlay';
    
    // Style the overlay
    overlay.style.position = 'absolute';
    overlay.style.top = '-20%';
    overlay.style.left = '-35px';  // Align with the slider
    overlay.style.width = 'calc(100%)';  // Extend width to match slider
    overlay.style.height = '100%';
    overlay.style.zIndex = '0';  // Ensure it's above other elements
    overlay.style.cursor = 'default';  // Keep the default cursor
    overlay.style.pointerEvents = 'none';  // Disable pointer events by default

    sliderBlock.style.position = 'relative';
    sliderBlock.appendChild(overlay);

    let isScrolling = false;
    let scrollTimeout;

    sliderBlock.addEventListener('mouseenter', () => {
        overlay.style.pointerEvents = 'auto';  // Enable pointer events on hover
    });

    sliderBlock.addEventListener('mouseleave', () => {
        overlay.style.pointerEvents = 'none';  // Disable pointer events when not hovering
    });

    /* let SCROLL_SENSITIVITY = 0.0028;
    const SCROLL_TIMEOUT = 150; */
    
    function handleWheel(e) { 
      e.preventDefault();
  
      const deltaY = e.deltaY;
      const changeAmount = deltaY > 0 ? -1 : 1; 
  
      updateCalculatorValue(changeAmount);
  }
  
  
  [overlay, slider, calculatorInput, microphone].forEach(element => {
      element.addEventListener('wheel', handleWheel);
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
  "#404040"  
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
  circle.style.width = "10px";  
  circle.style.height = "10px"; 
  circle.style.borderRadius = "50%"; 
});

window.addEventListener("mousemove", function(e) {
  if (!firstMove) {
    coords.x = e.clientX;
    coords.y = e.clientY;
    circles.forEach(circle => {
      circle.x = coords.x;
      circle.y = coords.y;
      circle.style.opacity = 1; 
    });
    firstMove = true;

    circles.forEach(circle => {
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
    circle.style.left = `${Math.min(window.innerWidth - circleSize, Math.max(0, circle.x - circleSize / 2))}px`;
    circle.style.top = `${Math.min(window.innerHeight - circleSize, Math.max(0, circle.y - circleSize / 2))}px`;

   
    circle.style.transform = `scale(${(circles.length - index) / circles.length})`;
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
          button.classList.add('fast-click');
          const descendants = button.querySelectorAll('*');
          descendants.forEach(descendant => descendant.classList.add('fast-click'));
          lastClickTime = currentTime;
      }
  }

  function handleMouseUp() {
      setTimeout(() => {
          button.classList.remove('fast-click');
          const descendants = button.querySelectorAll('*');
          descendants.forEach(descendant => descendant.classList.remove('fast-click'));
      }, delay);
  }

  function handleMouseLeave() {
      button.classList.remove('fast-click');
      const descendants = button.querySelectorAll('*');
      descendants.forEach(descendant => descendant.classList.remove('fast-click'));
  }

  button.addEventListener('mousedown', handleMouseDown);
  button.addEventListener('mouseup', handleMouseUp);
  button.addEventListener('mouseleave', handleMouseLeave);
}

const paymentBtns = document.querySelectorAll(".payment-navigation-btn");
paymentBtns.forEach(button => makeButtonClickable(button));

const activeBtn = document.querySelector(".payment-navigation-btn.active")
const activeText = document.querySelector(".btn-text.active")
makeButtonClickable(activeBtn)
makeButtonClickable(activeBtn)

const loginButton = document.querySelector('.login');
makeButtonClickable(loginButton);

const anotherButton = document.querySelector('.logo'); 
const logoImg = document.querySelector('.logo-img'); 
const buyBtn = document.querySelector(".card");
const priceLeft = document.querySelector('.change-price-left');
const priceRight = document.querySelector('.change-price-right');
const currencyBtn = document.querySelector('.currency-lang-nav');


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
  makeButtonClickable(currencyBtn)
}

const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach((i) => makeButtonClickable(i));

document.querySelectorAll('.modal-button').forEach((i) => makeButtonClickable(i))
document.querySelectorAll('.modal-present').forEach((i) => makeButtonClickable(i))


window.addEventListener('load', function() {
  const modalContent = document.querySelector('.modal-content');

  modalContent.classList.add('onload-animation');

  modalContent.addEventListener('animationend', function() {

      modalContent.classList.remove('onload-animation');

  });
});

document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.payment-navigation-btn');
  const btnTexts = document.querySelectorAll('.btn-text');

  buttons.forEach(button => {
    button.addEventListener('click', function () {
      
    
      buttons.forEach(btn => {
        btn.classList.remove('active');
      });
      btnTexts.forEach(btn => {
        btn.classList.remove('active');
      });

 
      this.classList.add('active');
      this.querySelector('.btn-text').classList.add('active');
    });
  });
});
document.querySelectorAll('.card-wrap').forEach(card => {
  const cardElement = card.querySelector('.card');

  card.addEventListener('mousemove', (e) => {
      const rect = cardElement.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const rotateX = ((mouseY / rect.height) * 30) - 15;
      const rotateY = ((mouseX / rect.width) * -30) + 15;

      cardElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`; // Add translateZ for depth
  });

  card.addEventListener('mouseleave', () => {
      cardElement.style.transition = 'transform 0.5s ease-out';
      cardElement.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)'; 
  });
});
