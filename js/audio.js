/* Tiny synthesized sound effects with Web Audio. No files to ship.
   The context is created on the first user gesture (browser rule). */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  let ctx = null;
  let master = null;
  let lastShot = 0;

  function ensure() {
    if (ctx) {
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    return ctx;
  }

  function enabled() {
    return ZSR.State && ZSR.State.settings.sound;
  }

  function tone(freq, dur, type, vol, slideTo) {
    const c = ensure();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, c.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.3, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g).connect(master);
    o.start();
    o.stop(c.currentTime + dur + 0.02);
  }

  function noise(dur, vol, filterFreq, slideTo) {
    const c = ensure();
    if (!c) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(filterFreq || 1200, c.currentTime);
    if (slideTo) f.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol || 0.3, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(f).connect(g).connect(master);
    src.start();
  }

  const SFX = {
    shoot() {
      const now = performance.now();
      if (now - lastShot < 40) return; // spread shots share one sound
      lastShot = now;
      noise(0.06, 0.25, 2400, 400);
      tone(520, 0.06, "square", 0.12, 180);
    },
    heavy() {
      const now = performance.now();
      if (now - lastShot < 40) return;
      lastShot = now;
      noise(0.12, 0.4, 1400, 120);
      tone(150, 0.12, "sawtooth", 0.18, 50);
    },
    bow() {
      tone(220, 0.16, "triangle", 0.22, 110); // the string
      noise(0.18, 0.12, 3000, 600); // the arrow
    },
    equip() {
      tone(1200, 0.03, "square", 0.08);
      setTimeout(() => tone(700, 0.05, "square", 0.1), 60);
    },
    zap() {
      // a robot dog's zap (js/robodog.js): a bright crackle
      noise(0.08, 0.18, 5200, 2400);
      tone(1400, 0.07, "square", 0.09, 2200);
    },
    hit() {
      tone(240, 0.05, "triangle", 0.2, 120);
    },
    poof() {
      noise(0.28, 0.35, 900, 120);
      tone(300, 0.2, "sine", 0.15, 80);
    },
    crunch() {
      noise(0.25, 0.5, 300, 60);
      tone(90, 0.3, "sawtooth", 0.3, 40);
    },
    pickup() {
      tone(660, 0.08, "square", 0.2);
      setTimeout(() => tone(990, 0.12, "square", 0.2), 70);
    },
    correct() {
      tone(523, 0.12, "triangle", 0.3);
      setTimeout(() => tone(659, 0.12, "triangle", 0.3), 110);
      setTimeout(() => tone(784, 0.25, "triangle", 0.3), 220);
    },
    wrong() {
      tone(200, 0.25, "sawtooth", 0.2, 120);
    },
    haven() {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.22, "triangle", 0.28), i * 110));
    },
    buy() {
      tone(880, 0.07, "square", 0.2);
      setTimeout(() => tone(1320, 0.1, "square", 0.2), 60);
    },
    gameover() {
      [392, 330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.35, "sawtooth", 0.25), i * 220));
    },
    click() {
      tone(900, 0.04, "square", 0.08);
    },
    // fishing at River Landing: the cast's whip and plop, a bite's splash, the bell on a propped rod, the reel
    cast() {
      noise(0.22, 0.16, 2600, 500);
      setTimeout(() => tone(320, 0.08, "sine", 0.18, 160), 380);
    },
    splash() {
      noise(0.3, 0.32, 1800, 300);
      tone(180, 0.12, "sine", 0.16, 90);
    },
    bell() {
      tone(1568, 0.25, "triangle", 0.2);
      setTimeout(() => tone(1568, 0.3, "triangle", 0.16), 160);
    },
    reel() {
      for (let i = 0; i < 6; i++) setTimeout(() => tone(1400 + (i % 2) * 200, 0.025, "square", 0.06), i * 45);
    },
    scream() {
      // a screamer spotted you: a rising shriek over a hiss
      tone(700, 0.5, "sawtooth", 0.18, 1500);
      noise(0.5, 0.25, 3200, 1800);
    },
    alarm() {
      // a building alarm: two hard tones, over and over while it rings
      tone(880, 0.32, "square", 0.16);
      setTimeout(() => tone(660, 0.32, "square", 0.16), 420);
    },
  };

  ZSR.Audio = {
    unlock: ensure,
    play(name) {
      if (!enabled()) return;
      try {
        if (SFX[name]) SFX[name]();
      } catch (e) {
        /* audio is never worth crashing over */
      }
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
