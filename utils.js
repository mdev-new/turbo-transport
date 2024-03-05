import osmtogeojson from 'osmtogeojson'
import crawler from 'crawler-request'


export const DEG_TO_RAD = Math.PI / 180
const EARTH_RADIUS = 6371;

// Haversine
// pA, pB -> [lat, lon]
// http://www.movable-type.co.uk/scripts/latlong.html
export function gpsDistanceBetween(pA, pB) {

  // These get converted to radians directly in the calculations.
  const [lat1, lon1] = pA;
  const [lat2, lon2] = pB;

  const dLat = (lat2-lat1) * DEG_TO_RAD;
  const dLon = (lon2-lon1) * DEG_TO_RAD;

  // square of half the chord length between the points
  const a =
      Math.pow(Math.sin(dLat/2), 2)
      + Math.pow(Math.sin(dLon/2), 2)
      * Math.cos(lat1 * DEG_TO_RAD)
      * Math.cos(lat2 * DEG_TO_RAD);

  // angular distance in radians
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return EARTH_RADIUS * c;
}

// pA, pB -> [lat, lon]
// returns [lat, lon] of midpoint
// http://www.movable-type.co.uk/scripts/latlong.html
export function midpoint(pA, pB) {

  // These get converted to radians directly in the calculations.
  const [lat1, lon1] = pA;
  const [lat2, lon2] = pB;

  const l2cos = Math.cos(lat2 * DEG_TO_RAD)

  const Bx = l2cos * Math.cos((lon2 - lon1) * DEG_TO_RAD)
  const By = l2cos * Math.sin((lon2 - lon1) * DEG_TO_RAD)

  const mid_lat = Math.atan2(
      Math.sin(lat1 * DEG_TO_RAD)
      + Math.sin(lat2 * DEG_TO_RAD),
      Math.sqrt(
          Math.pow(Math.cos(lat1 * DEG_TO_RAD)+Bx, 2)
          + Math.pow(By, 2)
      )
  );

  const mid_lon = lon1 * DEG_TO_RAD + Math.atan2(By, Math.cos(lat1 * DEG_TO_RAD) + Bx);

  return [mid_lat, mid_lon]
}

export function fetch_geojson(query, callback) {
  const options = {
    flatProperties: true
  }

  fetch(query)
    .then(response => response.json())
    .then(json => callback(osmtogeojson(json, options)))
}

export function fetch_buses(address, apikey, callback) {
  fetch(address, {
    headers: {
        "Accept": "*/*",
        "Accept-Language": "cs,sk;q=0.8,en-US;q=0.5,en;q=0.3",
        "Content-Type": "text/plain;charset=UTF-8"
    },
    body: `{\"key\":\"${apikey}\"}`,
    method: "POST",
  })
    .then(res => res.json())
    .then(json => callback(json));

}

export function fetch_timetable(filename) {
  crawler(`https://www.dpmp.cz/download/transport_line_cs/${filename}`)
    .then(response => {
      console.log(response.text)
    })
}