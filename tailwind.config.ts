import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#E58FB2',
        ink: '#20131a',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(229,143,178,.22)',
      },
    },
  },
  plugins: [],
};

export default config;
