window.VisionVoice = (() => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let active = false;
  let onResult = () => {};
  let onError = () => {};
  function speak(text, lang, volume=1) {
    return new Promise(resolve => {
      if (!("speechSynthesis" in window)) { resolve(false); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang && lang !== "auto" ? lang : "en-US";
      utterance.volume = Math.max(0, Math.min(1, Number(volume) || 1));
      utterance.rate = 1.05;
      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);
      window.speechSynthesis.speak(utterance);
    });
  }
  function listen(language, resultCallback, errorCallback) {
    if (!Recognition) throw new Error("Speech recognition is not available in this browser. Try Chrome or Edge.");
    stopListening();
    onResult = resultCallback;
    onError = errorCallback || (()=>{});
    recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language && language !== "auto" ? language : (navigator.language || "en-US");
    recognition.onresult = event => {
      const last = event.results[event.results.length - 1];
      if (last?.isFinal && last[0]?.transcript) onResult(last[0].transcript.trim());
    };
    recognition.onerror = event => {
      if (event.error !== "no-speech" && event.error !== "aborted") onError(event.error);
    };
    recognition.onend = () => {
      if (active) { try { recognition.start(); } catch {} }
    };
    active = true;
    recognition.start();
  }
  function stopListening() {
    active = false;
    if (recognition) { recognition.onend = null; try { recognition.stop(); } catch {} }
    recognition = null;
  }
  function stopSpeaking() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }
  return {speak,listen,stopListening,stopSpeaking};
})();
