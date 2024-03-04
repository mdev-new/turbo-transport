
// generate this with overpass turbo (export->raw data from overpass api->copy link addr)
export const OVERPASS_REQUEST = "https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A25%5D%3B%0A%0A%28%0A%20%20nwr%5B%22highway%22%3D%22footway%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22pedestrian%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22path%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22service%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22residential%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22living_street%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22steps%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22sidewalk%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20%2F%2Fnwr%5B%22highway%22%3D%22crossing%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20nwr%5B%22highway%22%3D%22cycleway%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%20%20%2F%2Fnwr%5B%22route%22%3D%22foot%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%29%3B%0Aout%20geom%3B%20%2F%2F%20print%20results%0A%0A%28%0Anwr%5B%22type%22%3D%22route%22%5D%5B%22route%22%3D%22trolleybus%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0Anwr%5B%22type%22%3D%22route%22%5D%5B%22route%22%3D%22bus%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%29%3B%0Aout%20geom%3B%0A%0A%28%0Anwr%5B%22public_transport%22%3D%22platform%22%5D%5B%22bus%22%3D%22yes%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0Anwr%5B%22public_transport%22%3D%22stop_position%22%5D%5B%22bus%22%3D%22yes%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0Anwr%5B%22public_transport%22%3D%22stop_area%22%5D%5B%22bus%22%3D%22yes%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0Anwr%5B%22public_transport%22%3D%22station%22%5D%5B%22bus%22%3D%22yes%22%5D%2850.019169984015775%2C15.745639882405735%2C50.03906083112809%2C15.811235909779898%29%3B%0A%29%3B%0Aout%20geom%3B"

export const DPMP_APIKEY = "3e86570d-56a1-4ec1-8012-c1a9f98d18cc"