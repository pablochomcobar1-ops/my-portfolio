import { createContext, useContext, useEffect, useRef, useState } from "react";

const MUSIC_VOLUME = 0.25; // 0 = silent, 1 = full volume
const EFFECTS_VOLUME = 0.35;

const SoundContext = createContext(null);

// ---------- Sound building blocks ----------

// A reverb "echo", like sound in a large hall
function makeImpulse(ctx, seconds) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }
  return buffer;
}

// Sends a sound to the speakers, and a bit of it through the reverb
function output(e, node) {
  node.connect(e.master);
  node.connect(e.reverb);
}

// One bell-like note
function tone(e, freq, start, duration, volume, type = "sine") {
  const osc = e.ctx.createOscillator();
  const gain = e.ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  // Quick attack, then a long smooth fade
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  output(e, gain);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

// A soft wind-like whoosh that sweeps from one pitch to another
function whoosh(e, start, duration, fromHz, toHz) {
  const length = Math.floor(e.ctx.sampleRate * duration);
  const buffer = e.ctx.createBuffer(1, length, e.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const noise = e.ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = e.ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.5;
  filter.frequency.setValueAtTime(fromHz, start);
  filter.frequency.exponentialRampToValueAtTime(toHz, start + duration);

  const gain = e.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.15, start + duration * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  noise.connect(filter);
  filter.connect(gain);
  output(e, gain);
  noise.start(start);
  noise.stop(start + duration);
}

// Musical notes (in Hz): C, E, G across a few octaves
const RISING = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
const FALLING = [...RISING].reverse();

const SOUNDS = {
  hover: (e) => {
    const t = e.ctx.currentTime;
    tone(e, 2093, t, 0.5, 0.04);
    tone(e, 3136, t + 0.05, 0.4, 0.025);
  },
  reveal: (e) => {
    const t = e.ctx.currentTime;
    whoosh(e, t + 0.25, 1.4, 300, 3500);
    RISING.forEach((f, i) => tone(e, f, t + 0.35 + i * 0.07, 1.6, 0.1));
    tone(e, 130.81, t + 0.35, 2.2, 0.15, "triangle"); // deep warm tone
  },
  cover: (e) => {
    const t = e.ctx.currentTime;
    whoosh(e, t, 1.1, 3500, 300);
    FALLING.forEach((f, i) => tone(e, f, t + i * 0.08, 1.2, 0.07));
    tone(e, 1046.5, t + 1.1, 1.5, 0.08); // final chime
  },
};

// ---------- The provider ----------

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const engine = useRef(null);
  const music = useRef(null);

  // Created on the first click (browsers require a click before any sound)
  const getEngine = () => {
    if (!engine.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();

      const master = ctx.createGain();
      master.gain.value = EFFECTS_VOLUME;
      master.connect(ctx.destination);

      const reverb = ctx.createConvolver();
      reverb.buffer = makeImpulse(ctx, 2.2);
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      reverb.connect(wet);
      wet.connect(master);

      engine.current = { ctx, master, reverb };
    }
    return engine.current;
  };

  const getMusic = (e) => {
    if (!music.current) {
      const audio = new Audio("/sounds/music.mp3");
      audio.loop = true;
      // Route the music through Web Audio so volume fades work on every phone
      const source = e.ctx.createMediaElementSource(audio);
      const gain = e.ctx.createGain();
      gain.gain.value = 0;
      source.connect(gain);
      gain.connect(e.ctx.destination);
      music.current = { audio, gain };
    }
    return music.current;
  };

  const fadeMusic = (to, seconds) => {
    const e = engine.current;
    const m = music.current;
    if (!e || !m) return;
    const now = e.ctx.currentTime;
    m.gain.gain.cancelScheduledValues(now);
    m.gain.gain.setValueAtTime(m.gain.gain.value, now);
    m.gain.gain.linearRampToValueAtTime(to, now + seconds);
  };

  const toggle = async () => {
    const e = getEngine();
    if (e.ctx.state === "suspended") await e.ctx.resume();
    const m = getMusic(e);

    if (!enabledRef.current) {
      enabledRef.current = true;
      setEnabled(true);
      m.audio.play().catch(() => {}); // no music file? effects still work
      fadeMusic(MUSIC_VOLUME, 1.5);
    } else {
      enabledRef.current = false;
      setEnabled(false);
      fadeMusic(0, 0.8);
      setTimeout(() => {
        if (!enabledRef.current) m.audio.pause();
      }, 850);
    }
  };

  const play = (name) => {
    if (!enabledRef.current || !engine.current) return;
    SOUNDS[name]?.(engine.current);
  };

  // Pause the music when the visitor switches tabs, resume when they come back
  useEffect(() => {
    const onVisibility = () => {
      const m = music.current;
      if (!m || !enabledRef.current) return;
      if (document.hidden) m.audio.pause();
      else m.audio.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
