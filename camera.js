window.VisionCamera = (() => {
  let stream = null;
  async function start(video) {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access requires HTTPS or localhost and a supported browser.");
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 960 }, height: { ideal: 540 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    return true;
  }
  function capture(video, quality=0.68) {
    if (!stream || video.readyState < 2 || !video.videoWidth) return null;
    const maxWidth = 768;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d", {willReadFrequently:false});
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality).split(",")[1];
  }
  function stop(video) {
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null;
    if (video) { video.pause(); video.srcObject = null; }
  }
  return {start,capture,stop};
})();
