const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const turf = require("@turf/turf");

const app = express();
const PORT = 3550;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/api/check-multiple-points", (req, res) => {
  const { polygonCoords, points } = req.body;

  if (!polygonCoords || !Array.isArray(points)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const coordinates = polygonCoords.map((p) => [p.lng, p.lat]);

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coordinates.push(first);
  }

  let polygon;
  try {
    polygon = turf.polygon([coordinates]);
  } catch (err) {
    console.error("Invalid polygon:", err.message);
    return res.status(400).json({ error: "Invalid polygon format" });
  }

  // Check each point
  const results = points.map((pt) => {
    const point = turf.point([pt.lng, pt.lat]);
    return { ...pt, isInside: turf.booleanPointInPolygon(point, polygon) };
  });

  res.json({ results });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
