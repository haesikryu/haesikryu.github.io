/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./rag-chat/**/*.{tsx,ts,jsx,js}",
    "./components/**/*.{tsx,ts,jsx,js}",
  ],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
  // Chirpy 기본 유틸과 충돌 방지: 모든 클래스에 접두사를 쓰지 않고, 루트에만 스코프
  corePlugins: {
    preflight: false,
  },
};
