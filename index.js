import { AStar } from './AStar-generic.js'
import { gpsDistanceBetween, fetch_geojson, fetch_buses } from './utils.js'
import { OVERPASS_REQUEST, DPMP_APIKEY } from './constants.js' 

// overlapping pairs
// [1, 2, 3, 4] -> [[1, 2], [2, 3], [3, 4]]
function overlapping_pairs(array) {
  return array.map((_, i, array) => [array[i], array[i+1]])
}

/*
TODO:
 - Path splitting and joining
 - Search
*/

// This is the "Node"
class Stop {
  lat = 0.0;
  lon = 0.0;
  name = "";
  connections = [];

  constructor(lat, lon, name) {
    this.lat = lat;
    this.lon = lon;
    this.name = name;
  }

  addConnection(edge) {
    this.connections.push(edge)
  }
}

// This is the "edge"
class Path {
  path = [];
  pubtran_lines = [];
  meanOfStransport = "";
  length = 0.0;
  begin = null; // Start node
  end = null; // End node

  constructor(path, meanOfStransport, beginNode, endNode, lines = []) {
    this.meanOfStransport = meanOfStransport;
    this.path = path;
    this.pubtran_lines = lines;

    this.begin = beginNode
    this.end = endNode

    const sumDistance = (accum, current) =>
      accum + gpsDistanceBetween(current[0].toReversed(), current[1].toReversed())

    this.length = overlapping_pairs(path).reduce(sumDistance, 0)
  }
}


// I need to track the current time somehow - i don't
// the current time is just start_time+sum(taken_edges.map(e => e.cost))

class PathSearch extends AStar {
  constructor(graph, walk_speed, bus_snapshot) {
    super(graph)
    this.walk_speed = walk_speed
    this.bus_snapshot = bus_snapshot
  }

  /*
    nodeA: 1st node(/string if name of node)
    nodeB: 2nd node
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
    return node.connections;
  }

  // the weight will basically be the time
  edge_cost(edge) {
    if(edge.meanOfStransport == 'foot') {
      return edge.length / this.walk_speed
    } else if(edge.meanOfStransport == 'public') {
      // todo use live data

      // lets calc in hours
      const wait_time = 2/60;
      const ride_time = edge.length / /* speed, let's say avg 35kmh */ 35;

      return wait_time+ride_time

    } else if(edge.meanOfStransport == 'train') {
      // todo use live data

      // lets calc in hours
      const wait_time = 2/60;
      const ride_time = edge.length / /* speed, let's say avg 35kmh */ 35;

      return wait_time+ride_time

    } else if(edge.meanOfStransport == 'link_bus') {
      // todo use live data

      // lets calc in hours
      const wait_time = 2/60;
      const ride_time = edge.length / /* speed, let's say avg 35kmh */ 35;

      return wait_time+ride_time

    }
  }

  projected_cost(edge) {
    
  }
}

function parse_geo(geo) {

  let nodes = []
  let edges = []

  const features = geo.features;

  const points = features.filter(feature => feature.geometry.type === 'Point')
  const line_strings = features.filter(feature => feature.geometry.type === 'Point')
  const multiline_strings = features.filter(feature => feature.geometry.type === 'MultiLineString')

  nodes = points.map(point => {
    const coords = point.geometry.coordinates

    if(point.properties.public_transport === 'platform') {
      return new Stop(coords[1], coords[0], point.properties.name)
    }

    return null
  }).filter(n => n !== null)

  // for (const feature of geo.features) {

  //   const properties = feature.properties
  //   const geometry = feature.geometry

  //   const coords = geometry.coordinates

  //   //console.log(properties, geometry)

  //   //console.log(feature)

  //   switch(geometry.type) {

  //     case 'LineString': {
  //       if (
  //         ['footway', 'pedestrian', 'path', 'steps', 'sidewalk', 'cycleway', 'service', 'residential', 'living_street']
  //           .includes(properties.highway)
  //       ) {
  //         const edge = new Path(coords, 'foot')
  //         edges.push(edge)
  //       }

  //       break;
  //     }

  //     case 'Point': {

  //       if(properties.public_transport === 'platform') {
  //         const node = new Stop(coords[1], coords[0], properties.name)
  //         nodes.push(node)
  //       }

  //       break;
  //     }

  //     case 'MultiLineString': {
  //       if(properties.type === 'route' || properties.route !== undefined) {
  //         const edge = new Path(/* todo coords */[], 'public', [properties.ref])
  //         edges.push(edge)
  //       }

  //       break;
  //     }

  //     case 'Polygon':
  //     default: break;
  //   }

  // }

  // todo connect nodes with edges
  for(let i = 0; i < nodes.length; i++) {
    //nodes[i].connections.push(new Edge())
  }

  return nodes

}

// This is the main procedure.
fetch_geojson(OVERPASS_REQUEST, (geojson) => {

  const nodes = parse_geo(geojson)
  //console.log(nodes, edges)

  const searcher = new PathSearch(nodes)

  const start = "Namesti republiky"
  const end = "Strossova"
  const path = searcher.search(start, end)
  //console.log(path)

})
