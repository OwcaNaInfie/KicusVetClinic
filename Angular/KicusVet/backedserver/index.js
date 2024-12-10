const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config();

const serviceAccount = require("./firebase-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://kicusvet-default-rtdb.europe-west1.firebasedatabase.app/",
});

const db = admin.database();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/add-object", async (req, res) => {
  const { path, data } = req.body;

  if (!path || !data) {
    return res.status(400).json({ error: "Path and data are required" });
  }

  try {
    const id = data.id || db.ref(path).push().key;
    await db.ref(`${path}/${id}`).set(data);
    res.status(201).json({ id, message: "Object added successfully" });
  } catch (error) {
    console.error("Error adding object:", error);
    res.status(500).json({ error: "Failed to add object" });
  }
});

app.get("/patients/:uid", async (req, res) => {
  const uid = req.params.uid;

  try {
    const snapshot = await db.ref(`patients/${uid}`).once("value");
    if (snapshot.exists()) {
      res.status(200).json(snapshot.val());
    } else {
      res.status(404).json({ error: "Patient not found" });
    }
  } catch (error) {
    console.error("Error fetching patient data:", error);
    res.status(500).json({ error: "Failed to fetch patient data" });
  }
});

app.get("/doctors/:uid", async (req, res) => {
  const uid = req.params.uid;

  try {
    const snapshot = await db.ref(`doctors/${uid}`).once("value");
    if (snapshot.exists()) {
      res.status(200).json(snapshot.val());
    } else {
      res.status(404).json({ error: "Doctor not found" });
    }
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    res.status(500).json({ error: "Failed to fetch doctor data" });
  }
});

app.get("/list/:path", async (req, res) => {
  const path = req.params.path;

  try {
    const snapshot = await db.ref(path).once("value");
    if (snapshot.exists()) {
      const data = snapshot.val();
      const objectList = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));
      res.status(200).json(objectList);
    } else {
      res.status(404).json({ error: "No data found at the specified path" });
    }
  } catch (error) {
    console.error("Error fetching object list:", error);
    res.status(500).json({ error: "Failed to fetch object list" });
  }
});

app.put("/update/:path/:id", async (req, res) => {
  const { path, id } = req.params;
  const data = req.body;

  try {
    await db.ref(`${path}/${id}`).update(data);
    res.status(200).json({ message: "Object updated successfully" });
  } catch (error) {
    console.error("Error updating object:", error);
    res.status(500).json({ error: "Failed to update object" });
  }
});
app.delete(
  "/delete/patients/:patientId/animals/:animalId",
  async (req, res) => {
    const { patientId, animalId } = req.params;
    console.log(
      "Deleting animal. Patient ID:",
      patientId,
      "Animal ID:",
      animalId
    );

    try {
      const snapshot = await db.ref(`patients/${patientId}`).once("value");
      if (!snapshot.exists()) {
        console.log("Patient not found");
        return res.status(404).json({ error: "Patient not found" });
      }

      const patient = snapshot.val();
      console.log("Patient data:", patient);

      patient.animals.splice(animalId, 1);
      await db
        .ref(`patients/${patientId}`)
        .update({ animals: patient.animals });

      res.status(200).json({ message: "Animal deleted successfully" });
    } catch (error) {
      console.error("Error deleting animal:", error);
      res.status(500).json({ error: "Failed to delete animal" });
    }
  }
);
app.delete("/delete/:path/:id", async (req, res) => {
  const { path, id } = req.params;

  try {
    await db.ref(`${path}/${id}`).remove();
    res.status(200).json({ message: "Object deleted successfully" });
  } catch (error) {
    console.error("Error deleting object:", error);
    res.status(500).json({ error: "Failed to delete object" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.get("/list/doctors", async (req, res) => {
  try {
    const snapshot = await db.ref("doctors").once("value");
    const doctors = snapshot.exists()
      ? Object.entries(snapshot.val()).map(([id, value]) => ({
          id,
          ...value,
        }))
      : [];
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

app.get("/list/appointments", async (req, res) => {
  try {
    const snapshot = await db.ref("appointments").once("value");
    const appointments = snapshot.exists()
      ? Object.entries(snapshot.val()).map(([id, value]) => ({
          id,
          ...value,
        }))
      : [];
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});
