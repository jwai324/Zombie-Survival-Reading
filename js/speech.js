/* Read-aloud via the browser's built-in speech synthesis. */
(function (root) {
  "use strict";
  const ZSR = (root.ZSR = root.ZSR || {});

  const synth = root.speechSynthesis;
  let voice = null;

  function pickVoice() {
    if (!synth) return null;
    const voices = synth.getVoices();
    if (!voices.length) return null;
    const en = voices.filter((v) => /^en/i.test(v.lang));
    const preferred = en.find((v) => /Google US English|Samantha|Karen|Daniel|Natural|Aria|Jenny/i.test(v.name));
    return preferred || en[0] || voices[0];
  }
  if (synth) {
    voice = pickVoice();
    synth.onvoiceschanged = () => {
      voice = pickVoice();
    };
  }

  ZSR.Speech = {
    available: !!synth,
    speak(text) {
      if (!synth || !text) return;
      synth.cancel();
      const clean = String(text).replace(/\s+/g, " ").trim();
      const u = new SpeechSynthesisUtterance(clean);
      if (voice) u.voice = voice;
      const grade = (ZSR.State && ZSR.State.settings.grade) || 3;
      u.rate = grade <= 2 ? 0.85 : grade <= 4 ? 0.92 : 1.0;
      u.pitch = 1.05;
      synth.speak(u);
    },
    stop() {
      if (synth) synth.cancel();
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
