import express from "express";
import cors from "cors";
import auth from "./src/routes/authRoute.js"

const app = express();


app.use(express.json());

// Parse URL‑encoded form data (optional)
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ["http://localhost:3000", ""],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

app.use('/auth', auth);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});