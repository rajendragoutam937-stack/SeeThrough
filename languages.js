// Browser speech support varies by device, browser and language.
window.VisionLanguages = {
  supported: ["en-US","hi-IN","te-IN","ta-IN","bn-IN","mr-IN","ur-PK","es-ES","fr-FR","de-DE","ar-SA","zh-CN","ja-JP","pt-BR","ru-RU"],
  languageName(code) {
    try { return new Intl.DisplayNames([code], {type:"language"}).of(code) || code; }
    catch { return code || "the detected language"; }
  }
};
