/* Global JavaScript for the cherry blossom birthday surprise pages */

// ---------- Petal animation ----------
function startPetals() {
    const canvas = document.getElementById('petalCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const petals = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function createPetal() {
        return {
            x: Math.random() * w,
            y: -20,
            size: 5 + Math.random() * 10,
            speed: 1 + Math.random() * 2,
            drift: (Math.random() - 0.5) * 1.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02
        };
    }

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = 'rgba(255,182,193,0.8)'; // light pink
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.6, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function update() {
        ctx.clearRect(0, 0, w, h);
        if (petals.length < 120) petals.push(createPetal());
        petals.forEach((p, idx) => {
            p.y += p.speed;
            p.x += p.drift;
            p.rotation += p.rotationSpeed;
            if (p.y > h + 20) petals[idx] = createPetal();
            drawPetal(p);
        });
        requestAnimationFrame(update);
    }
    update();
}

// ---------- Page 1 logic (puzzle) ----------
function setupPuzzlePage() {
    const checkBtn = document.getElementById('checkPuzzle');
    const unlockSection = document.getElementById('unlockSection');
    const unlockBtn = document.getElementById('unlockButton');
    const puzzleEl = document.getElementById('puzzle');
    const size = 3;
    const imgSrc = 'puzzle.JPG'; // image file in project (match actual repo filename)
    let tiles = [];
    let emptyIndex = size*size - 1;

    // initialize tiles array to sequential order
    function initTiles() {
        tiles = Array.from({length: size*size}, (_, i) => i);
        emptyIndex = size*size - 1;
    }

    function renderTiles() {
        puzzleEl.innerHTML = '';
        tiles.forEach((val, idx) => {
            const div = document.createElement('div');
            div.className = 'tile';
            div.dataset.index = val;
            if (idx === emptyIndex) {
                div.classList.add('empty');
            } else {
                const x = (val % size) * 100;
                const y = Math.floor(val / size) * 100;
                div.style.backgroundImage = `url(${imgSrc})`;
                div.style.backgroundPosition = `-${x}px -${y}px`;
            }
            div.addEventListener('click', () => moveTile(idx));
            puzzleEl.appendChild(div);
        });
    }

    function moveTile(idx) {
        const rowEmpty = Math.floor(emptyIndex / size);
        const colEmpty = emptyIndex % size;
        const rowIdx = Math.floor(idx / size);
        const colIdx = idx % size;
        if (Math.abs(rowEmpty - rowIdx) + Math.abs(colEmpty - colIdx) !== 1) return;
        [tiles[idx], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[idx]];
        emptyIndex = idx;
        renderTiles();
        checkSolved();
    }

    function shuffle() {
        for (let i = 0; i < 200; i++) {
            const possible = [];
            const candidates = [emptyIndex-1, emptyIndex+1, emptyIndex-size, emptyIndex+size];
            candidates.forEach(j => {
                if (j >= 0 && j < size*size) {
                    const re = Math.floor(emptyIndex / size);
                    const ce = emptyIndex % size;
                    const rj = Math.floor(j / size);
                    const cj = j % size;
                    if (Math.abs(re - rj) + Math.abs(ce - cj) === 1) possible.push(j);
                }
            });
            if (possible.length) moveTile(possible[Math.floor(Math.random()*possible.length)]);
        }
    }

    function checkSolved() {
        let solved = true;
        tiles.forEach((v, i) => { if (v !== i) solved = false; });
        if (solved) {
            unlockSection.classList.remove('hidden');
            unlockSection.querySelector('.animation').classList.add('glow');
            setTimeout(() => {
                unlockSection.querySelector('.animation').classList.remove('glow');
            }, 1000);
        }
        return solved;
    }

    initTiles();
    renderTiles();
    shuffle();

    checkBtn.addEventListener('click', () => {
        if (!checkSolved()) {
            alert('The puzzle is not solved yet! Keep going.');
        }
    });
    unlockBtn.addEventListener('click', () => {
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.href = 'letter.html'; }, 800);
    });

    const music = document.getElementById('backgroundMusic');
    const toggle = document.getElementById('toggleMusic');
    toggle.addEventListener('click', () => {
        if (music.paused) { music.play(); toggle.textContent = '🔇'; }
        else { music.pause(); toggle.textContent = '🎵'; }
    });
}

// ---------- Page 2 logic (lamp reveal) ----------
function setupLetterPage() {
    const lampMask = document.getElementById('lampMask');
    const lampIcon = document.getElementById('lamp');
    const letterContainer = document.getElementById('letterContainer');
    const lastBtn = document.getElementById('lastSurprise');
    let revealProgress = 0;
    let visitedAreas = [];

    function trackReveal(x, y) {
        // simple heuristic: count unique grid cells under lamp
        const gridSize = 50;
        const gx = Math.floor(x / gridSize);
        const gy = Math.floor(y / gridSize);
        const key = gx + ',' + gy;
        if (!visitedAreas.includes(key)) {
            visitedAreas.push(key);
            revealProgress = visitedAreas.length;
        }
        if (revealProgress > 100) {
            lastBtn.classList.remove('hidden');
        }
    }

    // position lamp initially in top-left corner
    const initX = 80, initY = 80;
    lampMask.style.setProperty('--x', initX + 'px');
    lampMask.style.setProperty('--y', initY + 'px');
    lampIcon.style.left = initX + 'px';
    lampIcon.style.top = initY + 'px';
    trackReveal(initX, initY);

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        lampMask.style.setProperty('--x', x + 'px');
        lampMask.style.setProperty('--y', y + 'px');
        lampIcon.style.left = x + 'px';
        lampIcon.style.top = y + 'px';
        trackReveal(x, y);
    });
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        lampMask.style.setProperty('--x', x + 'px');
        lampMask.style.setProperty('--y', y + 'px');
        lampIcon.style.left = x + 'px';
        lampIcon.style.top = y + 'px';
        trackReveal(x, y);
    }, {passive:true});

    lastBtn.addEventListener('click', () => {
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.href = 'surprise.html'; }, 800);
    });
}

// ---------- Page 3 logic (boxes) ----------
function setupBoxesPage() {
    const box1 = document.getElementById('box1');
    const box2 = document.getElementById('box2');
    const finalMessage = document.getElementById('finalMessage');
    let opened = 0;

    function openBox(box, imgId) {
        if (box.classList.contains('open')) return;
        box.classList.add('open');
        opened++;
        if (opened >= 2) {
            finalMessage.classList.remove('hidden');
        }
    }

    box1.addEventListener('click', () => openBox(box1));
    box2.addEventListener('click', () => openBox(box2));
}

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    startPetals();
    const page = document.body.id;
    if (page === 'page1') setupPuzzlePage();
    else if (page === 'page2') setupLetterPage();
    else if (page === 'page3') setupBoxesPage();
});
