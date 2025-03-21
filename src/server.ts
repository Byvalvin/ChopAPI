import app from './app';

if (process.env.IS_DEV==="True"){
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

}
export default app;
