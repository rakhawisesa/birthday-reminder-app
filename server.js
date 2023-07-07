const express = require("express");
const cors = require("cors");

const app = express();

const corsOption = {
    origin: "http://localhost:8080"
};

app.use(cors(corsOption));

app.use(express.json());

app.use(express.urlencoded({extended: true}));

const db = require("./models");

db.sequelize.sync()
    .then(() => {
        console.log("Synced DB");

        require("./routes/index.routes")(app);

        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("Failed to sync DB : " + error.message);
    });