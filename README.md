# Vision AI

A flat-file accessible web app prototype: every project file is in the project root. No nested folders.

## Render setup

- Runtime: Python 3
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Environment variable: `GROQ_API_KEY` = your Groq API key
- Optional environment variable: `GROQ_VISION_MODEL` = your account's vision-capable Groq model ID

The default model is `meta-llama/llama-4-scout-17b-16e-instruct`. If it is unavailable on your Groq account, set `GROQ_VISION_MODEL` to a currently supported vision model shown in your Groq console.

## Local run

```bash
pip install -r requirements.txt
# Set GROQ_API_KEY in your shell environment first.
python app.py
```

Open `http://localhost:5000`.

## Important

- Camera access requires HTTPS in production (Render provides HTTPS) or localhost during local testing.
- Browser speech recognition support varies; Chrome/Edge generally provide the best support. Available voices depend on the user's device and operating system.
- "Auto-detect" uses the browser's current locale for speech recognition and asks the model to match the user's language where possible. It is not guaranteed to support every language.
- This prototype samples camera images every 3 seconds; it is not continuous video understanding.
- This is not a certified mobility aid. It can miss obstacles, misidentify scenes, and cannot reliably determine whether a route is safe. Users should continue using their established mobility aids.
- Camera images are sent to the configured Groq service for analysis. Do not use this with people who have not consented to being recorded or analyzed.
