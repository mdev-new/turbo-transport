
import osmtogeojson from 'osmtogeojson'
import { AStar } from './AStar-generic.js'
import { gpsDistanceBetween } from './utils.js'

class Edge {
  meanOfStransport = "";
  length = 0.0;
  path = [];
  lines = [];

  constructor(path, meanOfStransport, lines = []) {
    this.meanOfStransport = meanOfStransport;
    this.path = path;

    let posAccum = 0.0;
    for (let i = 0; i < path.length - 1; i++) {
      posAccum += gpsDistanceBetween(path[i].toReversed(), path[i+1].toReversed()) // compute straight line distance
    }

    this.length = posAccum
  }
}

class Node {
  //edges = []; // todo think: why? why not compute at search time?
  lat = 0.0;
  lon = 0.0;
  name = "";

  constructor(lat, lon, name = ""/*, neighboring_edges*/) {
    this.lat = lat;
    this.lon = lon;
    this.name = name;
    //this.edges = neighboring_edges;
  }
}


// I need to track the current time somehow

class MySearch extends AStar {
  constructor(nodes, edges, walk_speed, bus_snapshot) {
    super(nodes, edges)
    this.walk_speed = walk_speed
    this.bus_snapshot = bus_snapshot
  }

  /*
    nodeA: 1st node (or a string, in case of the param being the nodes' name)
    nodeB: 2nd node (or a string, in case of the param being the nodes' name)
   */
  compare_nodes(nodeA, nodeB) {

    if(typeof(nodeA) == typeof(nodeB)) {

      return nodeA === nodeB

    } else if(typeof(nodeA) === 'string') {

      return nodeA === nodeB.properties.name

    } else if(typeof(nodeB) === 'string') {

      return nodeB === nodeA.properties.name

    }
  }

  neighbours(node) {
    // todo return nodes at the ends of edges
  }

  // the weight will basically be the time
  edge_cost(edge) {
    if(edge.meanOfStransport == 'foot') {
      return edge.length / this.walk_speed // s = vt -> t = s/v
    } else if(edge.meanOfStransport == 'public') {
      // we're going by public transport, todo use live data

      // lets calc in hours
      const wait_time = 2/60;
      const ride_time = edge.length / /* speed, let's say avg 35kmh */ 35;

      return wait_time+ride_time

    }
  }
}

// generate this with overpass turbo (export->raw data from overpass api->copy link addr)
const addr = "https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%0A%0A%28%0A%20%20nwr%5B%22highway%22%3D%22footway%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22pedestrian%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22path%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22service%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22residential%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22living_street%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22steps%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22sidewalk%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20%2F%2Fnwr%5B%22highway%22%3D%22crossing%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22cycleway%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20%2F%2Fnwr%5B%22route%22%3D%22foot%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%29%3B%0Aout%20geom%3B%20%2F%2F%20print%20results%0A%0A%28%0Anwr%5B%22type%22%3D%22route%22%5D%5B%22route%22%3D%22trolleybus%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0Anwr%5B%22type%22%3D%22route%22%5D%5B%22route%22%3D%22bus%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%29%3B%0Aout%20geom%3B%0A%0A%28%0Anwr%5B%22public_transport%22%3D%22platform%22%5D%5B%22bus%22%3D%22yes%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0Anwr%5B%22public_transport%22%3D%22stop_position%22%5D%5B%22bus%22%3D%22yes%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0Anwr%5B%22public_transport%22%3D%22stop_area%22%5D%5B%22bus%22%3D%22yes%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0Anwr%5B%22public_transport%22%3D%22station%22%5D%5B%22bus%22%3D%22yes%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%29%3B%0Aout%20geom%3B"

function get_geojson(query, callback) {

  if(true) {

    const options = {
      flatProperties: true
    }

    fetch(addr).then(response => response.json()).then(json => callback(osmtogeojson(json, options)))

  } else {
    import('./result.json', { assert: { type: "json" } }).then(imported => callback(imported.default))
  }
}


function parse_geo(geojson) {

  let nodes = []
  let edges = []

  for (const feature of geojson.features) {

    const properties = feature.properties
    const geometry = feature.geometry

    const coords = geometry.coordinates

    //console.log(properties, geometry)

    //console.log(feature)

    switch(geometry.type) {

      case 'LineString': {
        if (
          ['footway', 'pedestrian', 'path', 'steps', 'sidewalk', 'cycleway', 'service', 'residential', 'living_street']
          .includes(properties.highway)
        ) {
          const edge = new Edge(coords, 'foot')
          edges.push(edge)
        }

        break;
      }

      case 'Point': {

        if(properties.public_transport === 'platform') {
          const node = new Node(coords[1], coords[0], properties.name)
          nodes.push(node)
        }

        break;
      }

      case 'MultiLineString': {
        if(properties.type === 'route' || properties.route !== undefined) {
          const edge = new Edge(/* todo coords */[], 'public', [properties.ref])
          edges.push(edge)
        }

        break;
      }

      case 'Polygon':
      default: break;
    }

  }

  return [nodes, edges]

}


get_geojson(addr, (geojson) => {

  //console.log(geojson)

  // todo parse geojson to a list of nodes & edges

  const [nodes, edges] = parse_geo(geojson)
  //console.log(nodes, edges)

  const searcher = new MySearch(nodes, edges)

  const start = "Namesti republiky"
  const end = "Strossova"

  const path = searcher.search(start, end)
  //console.log(path)

})
