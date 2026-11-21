(() => {
  const $ = id => document.getElementById(id);
  const video = $("camera");
  const startButton = $("startButton");
  const stopButton = $("stopButton");
  const askButton = $("askButton");
  const questionInput = $("questionInput");
  const languageSelect = $("languageSelect");
  const volumeRange = $("volumeRange");
  let running = false;

  function addMessage(text, kind="assistant") {
    const empty = document.querySelector(".empty-message");
    if (empty) empty.remove();
    const item = document.createElement("div");
    item.className = `message ${kind}`;
    item.textContent = text;
    $("messages").appendChild(item);
    $("messages").scrollTop = $("messages").scrollHeight;
  }
  function setStatus(text) { $("status").textContent = text; }
  function currentLanguage() { return languageSelect.value; }

  VisionAssistant.setCallbacks({message:addMessage});

  async function start() {
    if (running) return;
    startButton.disabled = true;
    setStatus("Starting…");
    try {
      await VisionCamera.start(video);
      video.style.display = "block";
      $("cameraPlaceholder").style.display = "none";
      $("cameraState").textContent = "CAMERA ACTIVE";
      document.querySelector(".live-dot").classList.add("active");
      running = true;
      stopButton.disabled = false;
      askButton.disabled = false;
      setStatus("Assistant active");
      addMessage("Assistant started. I will describe what I can see. Please keep using your usual mobility aid.", "assistant");
      VisionAssistant.start(video, currentLanguage(), Number(volumeRange.value));
      try {
        VisionVoice.listen(currentLanguage(), text => {
          addMessage(text, "user");
          VisionAssistant.ask(text);
        }, error => addMessage("Voice input: " + error, "system"));
      } catch (error) {
        addMessage(error.message, "system");
      }
    } catch (error) {
      addMessage(error.message || "Could not start the camera.", "system");
      setStatus("Camera unavailable");
    } finally {
      startButton.disabled = false;
    }
  }
  function stop() {
    running = false;
    VisionAssistant.stop();
    VisionVoice.stopListening();
    VisionVoice.stopSpeaking();
    VisionCamera.stop(video);
    video.style.display = "none";
    $("cameraPlaceholder").style.display = "block";
    $("cameraState").textContent = "CAMERA OFF";
    document.querySelector(".live-dot").classList.remove("active");
    stopButton.disabled = true;
    askButton.disabled = true;
    setStatus("Ready");
    addMessage("Assistant stopped. Camera and microphone listening have ended.", "system");
  }
  async function askTyped() {
    const text = questionInput.value.trim();
    if (!text) return;
    questionInput.value = "";
    addMessage(text, "user");
    await VisionAssistant.ask(text);
  }
  startButton.addEventListener("click", start);
  stopButton.addEventListener("click", stop);
  askButton.addEventListener("click", askTyped);
  questionInput.addEventListener("keydown", event => { if (event.key === "Enter") askTyped(); });
  $("clearButton").addEventListener("click", () => {
    $("messages").innerHTML = '<p class="empty-message">Your assistant\\'s observations and replies will appear here.</p>';
  });
  languageSelect.addEventListener("change", () => {
    if (running) addMessage("Language setting changed. Restart the assistant to apply it to speech recognition.", "system");
  });
  window.addEventListener("beforeunload", () => {
    VisionAssistant.stop(); VisionVoice.stopListening(); VisionCamera.stop(video);
  });
})();
