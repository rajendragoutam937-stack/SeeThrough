window.VisionAssistant = (() => {
  let busy = false;
  let lastObservation = "";
  let lastObservationAt = 0;
  let timer = null;
  let video = null;
  let callbacks = {};
  let running = false;
  let language = "auto";
  let volume = 1;

  function setCallbacks(value) { callbacks = value; }
  function say(text, kind="assistant") {
    callbacks.message?.(text, kind);
  }
  async function requestVision(question, announce=true) {
    if (busy || !running) return;
    const image = window.VisionCamera.capture(video);
    if (!image) return;
    busy = true;
    try {
      const response = await fetch("/api/vision", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({image, question: question || "", language})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The vision service could not respond.");
      const answer = (data.answer || "").trim();
      if (!answer) return;
      const now = Date.now();
      const repeated = answer.toLowerCase() === lastObservation.toLowerCase();
      if (announce && !question && repeated && now - lastObservationAt < 15000) return;
      lastObservation = answer;
      lastObservationAt = now;
      say(answer, "assistant");
      await window.VisionVoice.speak(answer, language, volume);
    } catch (error) {
      say(error.message || "I could not analyze the camera image.", "system");
    } finally {
      busy = false;
    }
  }
  function start(videoElement, selectedLanguage, selectedVolume) {
    video = videoElement;
    language = selectedLanguage || "auto";
    volume = selectedVolume ?? 1;
    running = true;
    timer = setInterval(() => requestVision("", true), 3000);
    requestVision("Briefly describe the visible surroundings. Prioritize obvious potential hazards, but do not claim that any path is safe.", true);
  }
  async function ask(question) {
    if (!running) return say("Please start the assistant first.", "system");
    if (!question.trim()) return;
    window.VisionVoice.stopSpeaking();
    await requestVision(question + " Answer the user's question using the current camera image. Be concise. If distance or safety cannot be determined reliably, say so.", false);
  }
  function stop() {
    running = false;
    if (timer) clearInterval(timer);
    timer = null;
    busy = false;
  }
  return {setCallbacks,start,ask,stop};
})();
