const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 70,
    speed: 5,
    texture: new Image(),
    shootingSpeed: 1,
};
player.texture.src = 'path_to_player_image.png';

const bullets = [];
let enemies = [];
let bonuses = [];
let score = 0;
let level = 1;
let gameStarted = false;

const enemyTextures = [
    'path_to_enemy_image_1.png',
    'path_to_enemy_image_2.png',
    'path_to_enemy_image_3.png',
    'path_to_enemy_image_4.png',
    'path_to_enemy_image_5.png',
    'path_to_enemy_image_6.png',
    'path_to_enemy_image_7.png',
];

const bonusTextures = [
    'path_to_bonus_image.png',
];

const backgroundMusic = new Audio('path_to_background_music.ogg');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

let scores = {};
const enemyNames = ["Синий", "Красный", "Желтый", "Фиолетовый", "Зеленый", "Оранджевый", "Белый"];

function playBackgroundMusic() {
    backgroundMusic.play();
}

function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

function createEnemy() {
    const randomTextureIndex = Math.floor(Math.random() * enemyTextures.length);
    const enemyTexture = new Image();
    enemyTexture.src = enemyTextures[randomTextureIndex];

    const enemyName = enemyNames[randomTextureIndex];

    return {
        x: Math.random() * canvas.width,
        y: 0,
        size: 40,
        speed: 3 + level * 0.5,
        texture: enemyTexture,
        name: enemyName,
    };
}

function createBonus() {
    const randomTextureIndex = Math.floor(Math.random() * bonusTextures.length);
    const bonusTexture = new Image();
    bonusTexture.src = bonusTextures[randomTextureIndex];

    return {
        x: Math.random() * canvas.width,
        y: 0,
        size: 30,
        bonusType: 'speedUp',
        texture: bonusTexture,
        speed: 3, // Скорость движения бонуса вниз
    };
}

function applyBonus(player, bonus) {
    if (bonus.bonusType === 'speedUp') {
        player.shootingSpeed = 10;

        setTimeout(() => {
            player.shootingSpeed = 1;
        }, 5000);
    }
}

let shootingInterval;
let canShoot = true;

function handleShooting() {
    if (canShoot) {
        bullets.push({ x: player.x, y: player.y });
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
        }, 100 / player.shootingSpeed);
    }
}

function update() {
    if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "30px 'Arial', cursive";
        ctx.fillText("Нажми ЛКМ, чтобы начать", canvas.width / 2 - 200, canvas.height / 2);
        return requestAnimationFrame(update);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawBullets();
    drawEnemies();
    drawBonuses();

    handleShooting();

    if (Math.random() < 0.02 + level * 0.005) {
        enemies.push(createEnemy());
    }

    if (Math.random() < 0.005) {
        bonuses.push(createBonus());
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 15;
    
        let enemyKilled = false; // Флаг, указывающий, что враг был убит этой пулей
    
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (checkBulletCollision(bullets[i], enemies[j])) {
                bullets.splice(i, 1);
                // Увеличиваем общий счёт только если враг не был убит этой пулей ранее
                if (!enemyKilled) {
                    score++;
                    enemyKilled = true;
                }
                // Увеличиваем счёт для конкретного типа врага
                scores[enemies[j].name] = (scores[enemies[j].name] || 0) + 1;
                enemies.splice(j, 1);
                break;
            }
        }
    }   
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemy.speed;

        if (!checkCollision(player, enemy)) {
            drawEnemies();
        } else {
            stopBackgroundMusic();
            alert(`ТЫ ПРОСРАЛ! Настрелял фрагов: ${getTotalScore()} ЛВЛ: ${level}`);
            document.location.reload();
            return;
        }
    }

    for (let i = bonuses.length - 1; i >= 0; i--) {
        const bonus = bonuses[i];
        bonus.y += 3;

        if (checkCollision(player, bonus)) {
            applyBonus(player, bonus);
            bonuses.splice(i, 1);
        }
    }

    ctx.fillStyle = "white";
    ctx.font = "20px 'Arial', cursive";
    ctx.fillText("Фраги: " + score, 10, 30);
    ctx.fillText("Твой лвл: " + level, 10, 60);

    if (score >= level * 10) {
        level++;
        enemies = [];
    }

    // Вывод счета врагов
    let yOffset = 100;
    for (const enemyName of enemyNames) {
        const enemyScore = scores[enemyName] || 0;
        ctx.fillText(`${enemyName}: ${enemyScore}`, 10, yOffset);
        yOffset += 20;
    }

    requestAnimationFrame(update);
}

function getTotalScore() {
    let totalScore = 0;
    for (const enemyName of enemyNames) {
        const enemyScore = scores[enemyName] || 0;
        totalScore += enemyScore;
    }
    return totalScore;
}

function drawPlayer() {
    ctx.drawImage(player.texture, player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
}

function drawBullets() {
    ctx.fillStyle = "yellow";
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemy.texture, enemy.x - enemy.size / 2, enemy.y - enemy.size / 2, enemy.size, enemy.size);
    });
}

function drawBonuses() {
    bonuses.forEach(bonus => {
        ctx.drawImage(bonus.texture, bonus.x - bonus.size / 2, bonus.y - bonus.size / 2, bonus.size, bonus.size);
    });
}

function checkCollision(player, enemy) {
    const distance = Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2);
    return distance < player.size / 2 + enemy.size / 2;
}

function checkBulletCollision(bullet, enemy) {
    const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
    return distance < 5 + enemy.size / 2;
}

playBackgroundMusic();

document.addEventListener("mousemove", event => {
    player.x = event.clientX;
    player.y = event.clientY;
});

document.addEventListener("mousedown", () => {
    gameStarted = true;
    handleShooting();
    shootingInterval = setInterval(handleShooting, 100 / player.shootingSpeed);
});

document.addEventListener("mouseup", () => {
    clearInterval(shootingInterval);
});

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
});

canvas.addEventListener('touchmove', (event) => {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;

    player.x += deltaX;
    player.y += deltaY;

    touchStartX = touchX;
    touchStartY = touchY;
});


update();
