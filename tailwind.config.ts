import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 상승 (빨강) - 한국식 등락률 표시용
        up: '#ff4757',
        'up-light': '#ff6b7a',
        'up-dark': '#ee3344',
        
        // 하락 (파랑) - 한국식 등락률 표시용
        down: '#3742fa',
        'down-light': '#5352ed',
        'down-dark': '#2f3ae6',
        
        // 일반 성공/위험 색상 (원래대로 복원)
        success: '#22c55e',  // 초록
        danger: '#ef4444',   // 빨강
        warning: '#f59e0b',  // 노랑
        
        // 중립/액센트
        neutral: '#9198a1',
        accent: '#58a6ff',
        'accent-hover': '#79b8ff',
        
        // Primary 색상
        primary: {
          500: '#58a6ff',
          600: '#4493e6',
        },
      },
      backgroundColor: {
        'bg-primary': '#0d1117',
        'bg-secondary': '#161b22',
        'bg-card': '#1c2128',
        'bg-hover': '#21262d',
      },
      textColor: {
        'text-primary': '#e6edf3',
        'text-secondary': '#9198a1',
        'text-muted': '#6e7681',
      },
      borderColor: {
        'border': '#30363d',
        'border-subtle': '#21262d',
      },
    },
  },
  plugins: [],
};

export default config;
