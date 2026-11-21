import os
from flask import Flask, request, jsonify, send_from_directory
from groq import Groq

app = Flask(__name__, static_folder=None)
client = None

def get_client():
    global client
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise RuntimeError("GROQ_API_KEY is missing. Add it in Render Environment Variables.")
    if client is None:
        client = Groq(api_key=key)
    return client

@app.get("/")
def home():
    return send_from_directory(".", "index.html")

@app.get("/<path:filename>")
def static_files(filename):
    allowed = {"style.css", "script.js", "assistant.js", "camera.js", "voice.js", "languages.js"}
    if filename not in allowed:
        return jsonify({"error": "Not found"}), 404
    return send_from_directory(".", filename)

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

@app.post("/api/vision")
def vision():
    body = request.get_json(silent=True) or {}
    image = body.get("image", "")
    question = str(body.get("question", ""))[:1200]
    language = str(body.get("language", "auto"))[:40]
    if not image:
        return jsonify({"error": "No camera image received."}), 400

    model = os.environ.get("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
    language_instruction = (
        "Reply in the language requested by the user. If language is auto, reply in the same language as the user's question; "
        "for an initial observation, use simple English."
        if language == "auto" else f"Reply in the language associated with locale {language}."
    )
    system_prompt = (
        "You are a concise visual assistant for a blind or low-vision user. "
        "Describe only what is reasonably visible in the supplied image. "
        "Prioritize potentially important nearby obstacles and orientation clues, but do not estimate exact distances unless clearly measurable. "
        "Never say a path is safe, never instruct the user to walk forward or cross a road, and never replace a cane, guide dog, or human mobility support. "
        "If an obstacle may be present, use cautious wording such as 'There appears to be...' and advise the user to stop and check using their normal mobility technique. "
        "Do not invent objects, locations, text, or directions. Keep the spoken answer short, direct, and useful. "
        + language_instruction
    )
    user_text = question or "Briefly describe the visible surroundings and any obvious potential hazards. Be concise."
    try:
        result = get_client().chat.completions.create(
            model=model,
            temperature=0.2,
            max_tokens=130,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": [
                    {"type": "text", "text": user_text},
                    {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + image}}
                ]}
            ]
        )
        answer = result.choices[0].message.content or ""
        return jsonify({"answer": answer})
    except Exception as exc:
        # Avoid returning secrets or internal stack traces to the browser.
        app.logger.exception("Groq vision request failed")
        return jsonify({"error": "Vision request failed. Check your Groq model setting and Render logs."}), 502

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")), debug=False)
