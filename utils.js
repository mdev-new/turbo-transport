import osmtogeojson from 'osmtogeojson'
import crawler from 'crawler-request'


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

export function fetch_geojson(query, callback) {
  const options = {
    flatProperties: true
  }

  fetch(addr).then(response => response.json()).then(json => callback(osmtogeojson(json, options)))
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

export function fetch_timetables() {
  crawler("https://www.dpmp.cz/download/transport_line_cs/1701790512_cs_01_slovany_20231210.pdf").then(response => {
    console.log(response.text)
  })
}