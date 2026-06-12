import { PARKS, isValidPark, buildDay } from '../data/parkData.js';

// GET /api/parks  -> the list of parks for the dropdown
export function listParks(req, res) {
  res.json({ parks: PARKS });
}

// GET /api/days?park=hs&date=2026-07-30  -> generated lineup + films
export function getDay(req, res) {
  const { park, date } = req.query;

  if (!park || !isValidPark(park)) {
    return res.status(400).json({ error: 'Unknown or missing park' });
  }
  // Expect YYYY-MM-DD and confirm it's a real date.
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    return res.status(400).json({ error: 'Date must be a valid YYYY-MM-DD' });
  }

  res.json(buildDay(park, date));
}
