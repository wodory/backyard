const config = {
  plugins: {
    '@tailwindcss/postcss': {
      config: './tailwind.config.js',
      mode: 'css'
    },
    autoprefixer: {},
  },
};

export default config;
