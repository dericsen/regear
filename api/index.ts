import express from "express";

const app = express();

app.use(express.json());

app.post("/api/auth/register", (req, res) => {
  const { username, email } = req.body;

  res.json({
    success: true,
    user: {
      username,
      email
    }
  });
});

export default app;
