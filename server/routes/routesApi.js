import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/plan', async (req, res) => {
  const { originLat, originLon, destLat, destLon } = req.query;

  if (!originLat || !originLon || !destLat || !destLon) {
    return res.status(400).json({ error: 'originLat, originLon, destLat, destLon are required' });
  }

  try {
    const tomtomUrl = `https://api.tomtom.com/routing/1/calculateRoute/${originLat},${originLon}:${destLat},${destLon}/json`;
    const routeRes = await axios.get(tomtomUrl, {
      params: { key: process.env.TOMTOM_API_KEY, traffic: true }
    });

    const summary = routeRes.data.routes[0].summary;

    res.json({
      distanceMeters: summary.lengthInMeters,
      travelTimeSeconds: summary.travelTimeInSeconds,
      trafficDelaySeconds: summary.trafficDelayInSeconds
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch route data' });
  }
});

export default router;