<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1soLO5CtvvQEifb-xYfrqHbTsrATidsax

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

----------------------------------------------------------------------------------------------

# Cómo obtener la `GEMINI_API_KEY` para tu proyecto

La `GEMINI_API_KEY` es una clave de la **Gemini API de Google (Google AI Studio)**. No viene dentro del proyecto: debes generarla en tu cuenta de Google y luego colocarla en el archivo `.env.local`.

---

## 1. Entrar a Google AI Studio

1. Abre: **https://aistudio.google.com**
2. Inicia sesión con tu cuenta de Google.
3. Acepta los términos si es la primera vez.

---

## 2. Ir a la sección de API Keys

Dentro de AI Studio:

1. Busca en el menú izquierdo la sección **“API keys”**.
2. Verás un listado de llaves existentes y un botón **“Create API key”** o **“Get API key”**.

---

## 3. Crear la Gemini API Key

1. Haz clic en **“Create API key”**.
2. Elige si deseas:
   - Crear un **nuevo proyecto**, o  
   - Usar un **proyecto existente de Google Cloud**.
3. Se generará una clave del tipo:


**Esa es tu `GEMINI_API_KEY`.**  
No la compartas ni la subas a GitHub.

---

## 4. Colocarla en tu proyecto Next.js

En la carpeta de tu proyecto, crea o edita el archivo `.env.local`:

```env
GEMINI_API_KEY=TU_CLAVE_AQUI


## 5. Finalmente ejecuta la app

npm install
npm run dev
