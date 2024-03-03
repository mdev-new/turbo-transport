const DEG_TO_RAD = Math.PI / 180
const EARTH_RADIUS = 6371;

// pA - [lat, lon]
// pB - [lat, lon]
export function gpsDistanceBetween(pA, pB) {

  const [lat1, lon1] = pA;
  const [lat2, lon2] = pB;

  const dLat = (lat2-lat1) * DEG_TO_RAD;
  const dLon = (lon2-lon1) * DEG_TO_RAD;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return EARTH_RADIUS * c;
}