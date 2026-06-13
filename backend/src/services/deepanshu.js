const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Total route distance (depot → all stops in order)
const totalRouteDistance = (depot, stops) => {
  let dist = calculateDistance(
    depot.latitude, depot.longitude,
    stops[0].latitude, stops[0].longitude
  );
  for (let i = 0; i < stops.length - 1; i++) {
    dist += calculateDistance(
      stops[i].latitude, stops[i].longitude,
      stops[i + 1].latitude, stops[i + 1].longitude
    );
  }
  return dist;
};

// Step 1: Nearest neighbor (your existing logic, kept as seed)
const nearestNeighbor = (depot, stops) => {
  const unvisited = [...stops];
  const route = [];
  let current = depot;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateDistance(
        current.latitude, current.longitude,
        unvisited[i].latitude, unvisited[i].longitude
      );
      if (d < nearestDistance) {
        nearestDistance = d;
        nearestIndex = i;
      }
    }
    const next = unvisited.splice(nearestIndex, 1)[0];
    route.push(next);
    current = next;
  }
  return route;
};

// Step 2: 2-opt improvement — keeps swapping pairs until no improvement
const twoOpt = (depot, route) => {
  let best = [...route];
  let improved = true;

  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        // Reverse the segment between i and j
        const newRoute = [
          ...best.slice(0, i),
          ...best.slice(i, j + 1).reverse(),
          ...best.slice(j + 1),
        ];
        if (totalRouteDistance(depot, newRoute) < totalRouteDistance(depot, best)) {
          best = newRoute;
          improved = true;
        }
      }
    }
  }
  return best;
};

// Main export — drop-in replacement for your old optimizeRoute
export const optimizeRoute = (depot, stops) => {
  const seeded = nearestNeighbor(depot, stops);
  const optimized = twoOpt(depot, seeded);

  // Re-attach distanceFromPrevious metadata (same shape as before)
  return optimized.map((stop, i) => {
    const prev = i === 0 ? depot : optimized[i - 1];
    return {
      ...stop._doc,
      distanceFromPrevious: calculateDistance(
        prev.latitude, prev.longitude,
        stop.latitude, stop.longitude
      ),
    };
  });
};