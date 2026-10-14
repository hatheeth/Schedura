import express from "express";
import cors from "cors";
import auth from "./src/routes/authRoute.js";
import user from "./src/routes/userRoute.js";
import resource from "./src/routes/resourcesRoute.js";
import reservation from "./src/routes/reservationRoute.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: ["http://localhost:3000", ""],
  methods: ["GET", "POST", "PUT", "DELETE, PATCH"],
  credentials: true
}));
app.use(express.json());


app.use('/auth', auth);
app.use('/user', user);
app.use('/resource', resource);
app.use('/reservation', reservation);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});