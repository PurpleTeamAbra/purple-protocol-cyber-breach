let selectedOperative = ""; 
let operativeRole = "";
let score = 0;
let level = 1;
let traceLevel = 0;
let isPlaying = false;

let canvas, ctx;
let targetX = 200;
let targetY = 150;
let targetRadius = 20;
let targetSpeedX = 2.5;
let targetSpeedY = 2.0;

// Array to store active defensive attackers (ICE Drones)
let attackers = [];

function selectOperative(name, role) {
  selectedOperative = name;
  operativeRole = role || "OPERATIVE";
  
  document.getElementById("active-op").innerText = `${name} [${operativeRole}]`;
  document.getElementById("character-select").classList.add("hidden");
  document.getElementById("sub-title").innerText = `LEVEL ${level} - BREACH IN PROGRESS...`;
  document.getElementById("game-screen").classList.remove("hidden");

  canvas = document.getElementById("cyberCanvas");
  ctx = canvas.getContext("2d");

  // Reset game state
  isPlaying = true;
  traceLevel = 0;
  score = 0;
  level = 1;
  targetSpeedX = 2.5;
  targetSpeedY = 2.0;

  spawnAttackers();

  document.addEventListener("keydown", handleKeyPress);
  gameLoop();
}

function spawnAttackers() {
  attackers = [];
  // Spawn red ICE drones based on current level
  for (let i = 0; i < level + 1; i++) {
    attackers.push({
      x: Math.random() * (canvas.width - 40) + 20,
      y: Math.random() * (canvas.height - 40) + 20,
      dx: (Math.random() - 0.5) * (3 + level),
      dy: (Math.random() - 0.5) * (3 + level),
      radius: 12
    });
  }
}

function handleKeyPress(e) {
  if (e.code === "KeyR" && !isPlaying) {
    location.reload();
    return;
  }

  if (e.code === "Space" && isPlaying) {
    score += 10;
    document.getElementById("score").innerText = score;
    
    // Level up every 50 points
    if (score >= level * 50) {
      level++;
      targetSpeedX *= 1.2;
      targetSpeedY *= 1.2;
      spawnAttackers(); // Spawn extra red attackers on level up!
      document.getElementById("sub-title").innerText = `LEVEL ${level} - ICE COUNTERMEASURES ACTIVATED!`;
    }
    
    // Teleport main node to new location
    targetX = Math.floor(Math.random() * (canvas.width - 60)) + 30;
    targetY = Math.floor(Math.random() * (canvas.height - 60)) + 30;
  }
}

function gameLoop() {
  if (!isPlaying) return;

  // Clear canvas background
  ctx.fillStyle = "#050515";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Increase trace level over time
  traceLevel += 0.08;

  // CHECK FOR GAME OVER (TRACE REACHES 100%)
  if (traceLevel >= 100) {
    isPlaying = false;
    document.getElementById("sub-title").innerText = "SYSTEM LOCKDOWN TRIGGERED!";

    // Red tint overlay
    ctx.fillStyle = "rgba(255, 0, 55, 0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Red Lockdown Title Text
    ctx.fillStyle = "#ff0033";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff0033";
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("SYSTEM LOCKDOWN: BREACH FAILED", canvas.width / 2, canvas.height / 2 - 10);

    // Cyan Restart Prompt
    ctx.fillStyle = "#00ffcc";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#00ffcc";
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillText("PRESS 'R' TO RESTART SYSTEM", canvas.width / 2, canvas.height / 2 + 25);
    return;
  }

  // 1. Move and draw target node (Purple)
  targetX += targetSpeedX;
  targetY += targetSpeedY;

  if (targetX - targetRadius < 0 || targetX + targetRadius > canvas.width) targetSpeedX *= -1;
  if (targetY - targetRadius < 0 || targetY + targetRadius > canvas.height) targetSpeedY *= -1;

  ctx.fillStyle = "#a855f7";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "#a855f7";
  ctx.beginPath();
  ctx.arc(targetX, targetY, targetRadius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Move and draw Red Attackers (ICE Drones)
  attackers.forEach((att) => {
    att.x += att.dx;
    att.y += att.dy;

    if (att.x - att.radius < 0 || att.x + att.radius > canvas.width) att.dx *= -1;
    if (att.y - att.radius < 0 || att.y + att.radius > canvas.height) att.dy *= -1;

    // Draw Red Attacker
    ctx.fillStyle = "#ff0055";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ff0055";
    ctx.beginPath();
    ctx.arc(att.x, att.y, att.radius, 0, Math.PI * 2);
    ctx.fill();

    // Check collision between Red Attacker and Main Target Node
    let dist = Math.hypot(att.x - targetX, att.y - targetY);
    if (dist < att.radius + targetRadius) {
      traceLevel += 0.3; // Rapidly spike trace level on attack!
    }
  });

  // Reset text properties
  ctx.textAlign = "left";
  ctx.fillStyle = "#00ffcc";
  ctx.shadowBlur = 0;
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillText(`IDS TRACE: ${Math.floor(traceLevel)}% | WARNING: DEFENSIVE ICE ACTIVE`, 20, 30);

  requestAnimationFrame(gameLoop);
}
// Mobile touch support
const mobileBtn = document.getElementById("tap-action-btn");
if (mobileBtn) {
    mobileBtn.addEventListener("click", () => {
        if (!isPlaying) {
            // Restarts the game if it's over
            selectOperative(selectedOperative, operativeRole);
        } else {
            // Triggers the breach action
            if (typeof handleBreachAction === "function") {
                handleBreachAction();
            }
        }
    });
}
/ Cross-platform tap and click support for mobile and desktop canvas
const gameCanvas = document.getElementById("cyberCanvas");
if (gameCanvas) {
    gameCanvas.addEventListener("click", () => {
        if (!isPlaying) {
            // Restarts the game if it's over
            selectOperative(selectedOperative, operativeRole);
        } else {
            // Triggers the breach action
            if (typeof handleBreachAction === "function") {
                handleBreachAction();
            }
        }
    });
}