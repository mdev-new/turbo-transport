import osmtogeojson from 'osmtogeojson'
import crawler from 'crawler-request'


export const DEG_TO_RAD = Math.PI / 180
const EARTH_RADIUS = 6371; // km
const EARTH_CIRC = 40075; // km

export const to_deg = (rad) => rad * 180 / Math.PI
export const to_rad = (deg) => deg * Math.PI / 180

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

  return [mid_lat, mid_lon].map(to_deg)
}

export function fetch_geojson(query, callback) {
  const options = {
    flatProperties: true
  }

  fetch(query)
    .then(response => response.json())
    .then(json => callback(osmtogeojson(json, options)))
}

export function fetch_buses(apikey, callback) {
  fetch("https://online.dpmp.cz/api/buses", {
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

export function isNodeAt(nodes, point) {
  const [lat, lon] = point;

  for (const node of nodes) {
    if (node.lat === lat && node.lon === lon) {
      return node;
    }
  }

  return null;
}

// returns the closest node and the distance to it IN METERS
export function findClosestNode(nodes, point) {
  let min = 9999999999999;
  let minIdx = 0;
  for(let i = 0; i < nodes.length; i++) {
    const n = nodes[i]
    const dist = gpsDistanceBetween(point, [n.lat, n.lon]) * 1000
    if(min >= dist) {
      min = dist;
      minIdx = i;
    }
  }

  return [nodes[minIdx], min]
}


// overlapping pairs
// [1, 2, 3, 4] -> [[1, 2], [2, 3], [3, 4]]
export function overlapping_pairs(arr) {
  let result = []
  for (let i = 1; i < arr.length; i++) {
    result.push([arr[i-1], arr[i]])
  }

  return result
}

function cross(a, b) {
  const [a1, a2, a3] = a;
  const [b1, b2, b3] = b;

  return [ a2 * b3 - a3 * b2, a3 * b1 - a1 * b3, a1 * b2 - a2 * b1 ]
}

function dot(a, b) {
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }
  return result;
}

function makeXYZ(point) {
  const [lat, lng] = point;
  return [
    Math.sin(lat)*Math.cos(lng),
    Math.sin(lng),
    Math.cos(lat)*Math.cos(lng)
  ]
}

function div(v1, number) {
  let newVec = v1.slice()
  for (let i = 0; i < v1.length; i++) {
    newVec[i] /= number;
  }

  return newVec
}

// https://math.stackexchange.com/questions/993236/calculating-a-perpendicular-distance-to-a-line-when-using-coordinates-latitude
export function perpendicularDistance(point, lineA, lineB) {

  const C = makeXYZ(point)
  const A = makeXYZ(lineA)
  const B = makeXYZ(lineB)

  const n = cross(A, B)
  const N = div(n, Math.sqrt(dot(n, n)))

  const dist = (90 * DEG_TO_RAD) - Math.abs(Math.acos(dot(C, N)))
  const dist_a_b = Math.acos(dot(A, B))

  return [dist * EARTH_CIRC, dist_a_b * EARTH_CIRC]
}

export function perpendicularDistance2(c, a, b) {
  const [latA, lonA] = a;
  const [latB, lonB] = b;
  const [latC, lonC] = c;

  const y = Math.sin(lonC - lonA) * Math.cos(latC);
  const x = Math.cos(latA) * Math.sin(latC) - Math.sin(latA) * Math.cos(latC) * Math.cos(latC - latA);
  const bearing1 = 360 - ((to_deg(Math.atan2(y, x)) + 360) % 360);

  const y2 = Math.sin(lonB - lonA) * Math.cos(latB);
  const x2 = Math.cos(latA) * Math.sin(latB) - Math.sin(latA) * Math.cos(latB) * Math.cos(latB - latA);
  const bearing2 = 360 - ((to_deg(Math.atan2(y2, x2)) + 360) % 360);

  const lat1Rads = to_rad(latA);
  const lat3Rads = to_rad(latC);
  const dLon = to_rad(lonC - lonA);

  const distanceAC = Math.acos(Math.sin(lat1Rads) * Math.sin(lat3Rads)+Math.cos(lat1Rads)*Math.cos(lat3Rads)*Math.cos(dLon)) * EARTH_RADIUS;
  const min_distance = Math.abs(Math.asin(Math.sin(distanceAC/6371)*Math.sin(to_rad(bearing1)-to_rad(bearing2))) * EARTH_RADIUS);

  return min_distance
}
