// אלמנטים מה-DOM
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameOverText = document.getElementById('game-over-text');
const gameOverTitle = document.getElementById('game-over-title');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// משתני מצב המשחק
let score = 0;
let lives = 3;
let gameActive = false;
let playerX = window.innerWidth / 2;
const playerSpeed = 30;

// רשימת פריטים: אחוז סיכוי, סוג (טוב/רע), ואמוג'י
const itemsConfig = [
    { emoji: '🥛', type: 'bad' },  // חלב
    { emoji: '🧀', type: 'bad' },  // גבינה
    { emoji: '🍦', type: 'bad' },  // גלידה
    { emoji: '🍕', type: 'bad' },  // פיצה
    { emoji: '💊', type: 'good' }, // לקטאז
    { emoji: '🌾', type: 'good' }  // חלב שיבולת שועל
];

// איוונטים לכפתורים
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// תנועת מקלדת
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    if (e.key === 'ArrowLeft') {
        movePlayer(-playerSpeed);
    } else if (e.key === 'ArrowRight') {
        movePlayer(playerSpeed);
    }
});

// תמיכה בטאץ' / קליקים (למשחק מהנייד)
gameContainer.addEventListener('click', (e) => {
    if (!gameActive) return;
    const clickX = e.clientX;
    if (clickX < window.innerWidth / 2) {
        movePlayer(-playerSpeed); // קליק בצד שמאל
    } else {
        movePlayer(playerSpeed);  // קליק בצד ימין
    }
});

function movePlayer(amount) {
    playerX += amount;
    // חסימת יציאה מגבולות המסך
    if (playerX < 30) playerX = 30;
    if (playerX > window.innerWidth - 30) playerX = window.innerWidth - 30;
    player.style.left = playerX + 'px';
}

function startGame() {
    // איפוס נתונים
    score = 0;
    lives = 3;
    gameActive = true;
    playerX = window.innerWidth / 2;
    player.style.left = playerX + 'px';
    player.textContent = '🪖';
    scoreDisplay.textContent = score;
    updateLivesDisplay();

    // הסתרת מסכים
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    // ניקוי חפצים ישנים אם נשארו
    document.querySelectorAll('.item').forEach(item => item.remove());

    // תחילת לולאות הייצור של החפצים
    spawnLoop();
}

function updateLivesDisplay() {
    livesDisplay.textContent = '❤️'.repeat(lives) || '🤢';
}

function spawnLoop() {
    if (!gameActive) return;

    createItem();

    // ככל שהניקוד עולה, קצב נפילת החפצים מתגבר (מינימום חצי שנייה)
    const nextSpawnDelay = Math.max(500, 1200 - (score * 20));
    setTimeout(spawnLoop, nextSpawnDelay);
}

function createItem() {
    const itemEl = document.createElement('div');
    itemEl.classList.add('item');

    // בחירת פריט רנדומלי מהרשימה
    const config = itemsConfig[Math.floor(Math.random() * itemsConfig.length)];
    itemEl.textContent = config.emoji;
    itemEl.dataset.type = config.type;

    // מיקום אופקי רנדומלי
    const randomX = Math.random() * (window.innerWidth - 40) + 20;
    itemEl.style.left = randomX + 'px';
    itemEl.style.top = '-50px';

    gameContainer.appendChild(itemEl);

    // לוגיקת הנפילה של הפריט הספציפי הזה
    let currentTop = -50;
    const fallSpeed = Math.random() * 3 + 3 + (score * 0.1); // מהירות משתנה שעולה עם הזמן

    function fall() {
        if (!gameActive) {
            itemEl.remove();
            return;
        }

        currentTop += fallSpeed;
        itemEl.style.top = currentTop + 'px';

        // בדיקת התנגשות עם השחקן
        if (checkCollision(itemEl)) {
            handleCollision(config.type);
            itemEl.remove();
            return;
        }

        // אם עבר את גבול המסך התחתון
        if (currentTop > window.innerHeight) {
            itemEl.remove();
            return;
        }

        requestAnimationFrame(fall);
    }

    requestAnimationFrame(fall);
}

function checkCollision(item) {
    const itemRect = item.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    // זיהוי חפיפה בסיסי בין ריבועי האלמנטים
    return !(
        itemRect.top > playerRect.bottom ||
        itemRect.bottom < playerRect.top ||
        itemRect.right < playerRect.left ||
        itemRect.left > playerRect.right
    );
}

function handleCollision(type) {
    if (type === 'good') {
        score += 10;
        scoreDisplay.textContent = score;
        
        // אפקט ויזואלי קטן של הצלחה
        player.style.transform = 'translateX(-50%) scale(1.2)';
        setTimeout(() => player.style.transform = 'translateX(-50%) scale(1)', 100);
    } else {
        lives--;
        updateLivesDisplay();
        
        // אפקט ויזואלי של פגיעה
        player.textContent = '🤢';
        setTimeout(() => { if(gameActive) player.textContent = '🪖'; }, 400);

        if (lives <= 0) {
            endGame();
        }
    }
}

function endGame() {
    gameActive = false;
    player.textContent = '☠️';
    
    // קביעת טקסט הסיום לפי ההישג
    if (score >= 100) {
        gameOverTitle.textContent = "🏆 אשפית הלקטאז!";
        gameOverText.innerHTML = `כל הכבוד המפקדת! שרדת את ארוחת הערב בגבורה והשגת <b>${score} נקודות</b>.<br>הבטן שלך שקטה ויציבה ב-100%!`;
    } else {
        gameOverTitle.textContent = "התראת לקטוז! 🤢";
        gameOverText.innerHTML = `הבטן נכנעה ללקטוז... המשמרת הופסקה באמצע.<br>השגת <b>${score} נקודות</b>.<br>קחי 2 כדורי לקטאז ונתראה בלו"ז הבא!`;
    }

    gameOverScreen.classList.remove('hidden');
}
