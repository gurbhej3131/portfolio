// Theme toggle
document.body.classList.add("dark-mode");
// ================= 3D Project Carousel =================
const ring = document.getElementById("ring");
const cards = document.querySelectorAll(".card3d");

const total = cards.length;

// Responsive radius: smaller screens need a tighter cylinder so cards
// don't fly off past the edges of the viewport.
function getRadius() {
    const w = window.innerWidth;
    if (w <= 480) return 160;
    if (w <= 768) return 220;
    if (w <= 991) return 300;
    if (w <= 1200) return 360;
    return 400;
}

let radius = getRadius();
let rotation = 0;

// Position cards around cylinder
function positionCards() {
    cards.forEach((card, i) => {
        let angle = (360 / total) * i;

        gsap.set(card, {
            rotationY: angle,
            transformOrigin: `50% 50% ${-radius}px`,
            z: radius,
        });
    });
}

positionCards();

function updateCards() {
    cards.forEach((card, i) => {
        let angle = ((360 / total) * i + rotation) % 360;

        if (angle < 0) angle += 360;

        let diff = Math.abs(angle);
        if (diff > 180) diff = 360 - diff;

        let opacity = Math.max(0, 1 - diff / 90);

        gsap.set(card, {
            opacity: opacity,
            scale: 0.8 + opacity * 0.2,
            zIndex: Math.round(opacity * 100),
        });
    });
}

// Initial tilt
gsap.set(ring, {
    rotationX: -8,
    rotationY: 0,
});

// Rotate on scroll only while the carousel is in view
const sceneWrap = document.querySelector(".carousel-scene-wrap");

sceneWrap.addEventListener(
    "wheel",
    (e) => {
        e.preventDefault();
        rotation += e.deltaY * 0.18;

        gsap.to(ring, {
            rotationY: rotation,
            duration: 1,
            ease: "power3.out",
            onUpdate: updateCards,
        });
    },
    {
        passive: false,
    },
);

// Drag to rotate (mouse + touch)
let isDragging = false;
let startX = 0;
let startRotation = 0;

function dragStart(x) {
    isDragging = true;
    startX = x;
    startRotation = rotation;
}

function dragMove(x) {
    if (!isDragging) return;
    rotation = startRotation + (x - startX) * 0.5;
    gsap.set(ring, {
        rotationY: rotation,
    });
    updateCards();
}

function dragEnd() {
    isDragging = false;
}

sceneWrap.addEventListener("mousedown", (e) => dragStart(e.clientX));
window.addEventListener("mousemove", (e) => dragMove(e.clientX));
window.addEventListener("mouseup", dragEnd);

sceneWrap.addEventListener(
    "touchstart",
    (e) => dragStart(e.touches[0].clientX),
    {
        passive: true,
    },
);
sceneWrap.addEventListener(
    "touchmove",
    (e) => dragMove(e.touches[0].clientX),
    {
        passive: true,
    },
);
sceneWrap.addEventListener("touchend", dragEnd);

// Subtle tilt on mouse move (only over the carousel)
sceneWrap.addEventListener("mousemove", (e) => {
    const rect = sceneWrap.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    let y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;

    gsap.to(ring, {
        rotationX: -3 - y,
        rotationZ: x * 0.15,
        duration: 0.8,
        ease: "power2.out",
    });
});

updateCards();

// Floating animation
cards.forEach((card, index) => {
    gsap.to(card, {
        y: -10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        duration: 2 + index * 0.25,
    });
});

window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("loader").classList.add("hide");
    },2500);
});

// Recalculate the carousel radius when the viewport size/orientation changes
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const newRadius = getRadius();
        if (newRadius !== radius) {
            radius = newRadius;
            positionCards();
        }
        updateCards();
    }, 200);
});