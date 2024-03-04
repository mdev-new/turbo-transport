import { AStar, Graph } from './AStar-generic.js'
import { gpsDistanceBetween, fetch_geojson } from './utils.js'
import { OVERPASS_REQUEST, DPMP_APIKEY } from './constants.js' 

/*
TODO:
 - Join edges?
  - todo make search be aware that if it finds an end of an edge it can transition into another one
 - Build the actual graph
*/

class MyGraph extends Graph {

  constructor(stations, ways) {

    // todo process info to `this.nodes` & `this.edges`

  }

}

class Path {
  meanOfStransport = "";
  length = 0.0;
  path = [];
  lines = [];

  constructor(path, meanOfStransport, lines = []) {
    this.meanOfStransport = meanOfStransport;
    this.path = path;

    let posAccum = 0.0;
    for (let i = 0; i < path.length - 1; i++) {
      // compute straight line distance
      posAccum += gpsDistanceBetween(path[i].toReversed(), path[i+1].toReversed())
    }

    this.length = posAccum
  }
}

class Station {
  lat = 0.0;
  lon = 0.0;
  name = "";
  connections = [];

  constructor(lat, lon, name = "") {
    this.lat = lat;
    this.lon = lon;
    this.name = name;
  }
}


// I need to track the current time somehow

class MySearch extends AStar {
  constructor(graph, walk_speed, bus_snapshot) {
    super(graph)
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
      return edge.length / this.walk_speed // the time it takes to walk the edge
    } else if(edge.meanOfStransport == 'public') {
      // we're going by public transport
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
          const edge = new Path(coords, 'foot')
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
          const edge = new Path(/* todo coords */[], 'public', [properties.ref])
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

// This is the main procedure.
fetch_geojson(OVERPASS_REQUEST, (geojson) => {

  const [nodes, edges] = parse_geo(geojson)
  //console.log(nodes, edges)

  const searcher = new MySearch(nodes, edges)

  const start = "Namesti republiky"
  const end = "Strossova"

  const path = searcher.search(start, end)
  //console.log(path)

})
