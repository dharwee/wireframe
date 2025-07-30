# 🧠 Wireframe to Code – AI-Powered UI Generator

Convert hand-drawn wireframes into clean, responsive React + Tailwind CSS code using AI.

---

## ✨ Features

- 🖼️ Upload wireframe image or sketch
- 🤖 Choose from multiple LLMs: **DeepSeek**, **Google Gemini**, **Meta LLaMA**
- 💻 Instantly get React + Tailwind code for the layout
- 📦 Copy or download generated code
- ☁️ Supabase backend for file storage and API key management

---

## 🛠 Tech Stack

| Technology      | Usage                                      |
|-----------------|---------------------------------------------|
| Next.js         | App structure & server-side rendering       |
| React.js        | Component-based UI                          |
| TypeScript      | Type safety & cleaner code                  |
| Tailwind CSS    | Utility-first styling                       |
| Supabase        | File storage & API key database             |
| DeepSeek AI     | LLM for code generation                     |
| Google Gemini   | Google’s LLM for wireframe interpretation   |
| Meta LLaMA      | Meta’s LLM for contextual code generation   |

---


## 🧑‍💻 How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/wireframe-to-code.git
cd wireframe-to-code

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a `.env.local` file and add your Supabase and API keys
cp .env.example .env.local

# 4. Run the app
npm run dev
