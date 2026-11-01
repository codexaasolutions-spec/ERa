import('./server/dist/index.js').catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
