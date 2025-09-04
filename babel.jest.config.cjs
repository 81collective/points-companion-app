// Babel configuration for Jest testing only
// Keeping this separate so Next.js can use SWC in production builds

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-transform-modules-commonjs', { loose: true }],
  ],
};
