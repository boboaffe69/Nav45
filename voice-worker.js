/* NAV45 voice worker: runs the Piper neural voice in a background thread,
   so generating speech never freezes the map (important at 10× / 50× preview speed). */
importScripts('vendor/piper-tts.js');

let session = null;
let sessionId = null;

self.onmessage = async (e) => {
  const { id, type, voiceId, text } = e.data;
  try {
    if (type === 'load') {
      if (!session || sessionId !== voiceId) {
        try { self.PiperTTS.TtsSession._instance = null; } catch (_) { /* ignore */ }
        session = await self.PiperTTS.TtsSession.create({
          voiceId,
          progress: (p) => self.postMessage({ id, type: 'progress', loaded: p.loaded, total: p.total }),
        });
        sessionId = voiceId;
      }
      self.postMessage({ id, type: 'done' });
    } else if (type === 'predict') {
      if (!session) throw new Error('voice not loaded');
      const blob = await session.predict(text);
      self.postMessage({ id, type: 'done', blob });
    }
  } catch (err) {
    self.postMessage({ id, type: 'error', error: String((err && err.message) || err) });
  }
};
