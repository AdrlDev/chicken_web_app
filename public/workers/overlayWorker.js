importScripts(); // optional if you want imports

let canvas = null;
let ctx = null;
let width = 640;
let height = 360;
let dpr = 1;

let tracks = [];
let latestDetections = [];
let stats = {};

const maxTrackAgeMs = 800;
const smoothingFactor = 0.35;

// Simple stable color generator
function stableColor(label) {
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
        hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}deg 80% 60%)`;
}

// Simple roundRect
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

self.onmessage = (ev) => {
    const data = ev.data;
    if (!data) return;

    switch (data.type) {
        case "init":
            canvas = data.canvas;
            dpr = self.devicePixelRatio || 1;
            ctx = canvas.getContext("2d");
            width = canvas.width / dpr;
            height = canvas.height / dpr;
            ctx.scale(dpr, dpr);
            break;

        case "resize":
            width = data.width;
            height = data.height;
            if (canvas && ctx) {
                canvas.width = Math.round(width * dpr);
                canvas.height = Math.round(height * dpr);
                ctx = canvas.getContext("2d");
                ctx.scale(dpr, dpr);
            }
            break;

        case "frame":
            latestDetections = data.detections || [];
            break;

        case "stats":
            stats = data.stats || {};
            break;
    }
};

// Simple draw loop
function drawLoop() {
    if (!ctx || !canvas) {
        setTimeout(drawLoop, 16);
        return;
    }

    // clear
    ctx.clearRect(0, 0, width, height);

    // draw detections
    latestDetections.forEach((t) => {
        const [x1, y1, x2, y2] = t.bbox;
        const w = x2 - x1;
        const h = y2 - y1;
        const color = stableColor(t.label);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, Math.min(4, Math.round(Math.max(1, h / 80))));
        roundRect(ctx, x1, y1, w, h, 6, false, true);
        const conf = t.confidence ? `${Math.round(t.confidence * 100)}%` : "";
        const labelText = `${t.label} ${conf}`.trim();
        const fontSize = Math.max(Math.min(h / 5, 18), 10);
        ctx.font = `bold ${fontSize}px Inter, Arial`;
        const textWidth = ctx.measureText(labelText).width + 8;
        const textHeight = fontSize + 6;
        const radius = Math.min(6, textHeight / 2);
        ctx.fillStyle = `rgba(255,255,255,0.8)`;
        roundRect(ctx, x1, y1 - textHeight, textWidth, textHeight, radius, true, false);
        ctx.fillStyle = "#000";
        ctx.fillText(labelText, x1 + 4, y1 - 4);
    });

    setTimeout(drawLoop, 16);
}

drawLoop();
