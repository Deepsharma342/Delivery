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

// ✅ FIX 2 — distance matrix cache
// Pre-calculates ALL distances once upfront
// 2-opt then just does distMatrix[i][j] instead of recalculating every time
// For 100 stops: was ~50,000 recalculations → now 100×100 = 10,000 lookups
const buildDistanceMatrix = (depot, stops) => {
  const nodes = [depot, ...stops]; // index 0 = depot, 1..n = stops
  const n = nodes.length;
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = calculateDistance(
        nodes[i].latitude, nodes[i].longitude,
        nodes[j].latitude, nodes[j].longitude
      );
      matrix[i][j] = d;
      matrix[j][i] = d; // symmetric — A→B same as B→A
    }
  }
  return { matrix, nodes };
};

// Total route distance using matrix (depot is index 0, stops are index 1..n)
const totalRouteDistanceMatrix = (stopIndices, matrix) => {
  let dist = matrix[0][stopIndices[0]]; // depot → first stop
  for (let i = 0; i < stopIndices.length - 1; i++) {
    dist += matrix[stopIndices[i]][stopIndices[i + 1]];
  }
  return dist;
};

// Nearest neighbor using matrix
const nearestNeighborMatrix = (numStops, matrix) => {
  const unvisited = new Set(
    Array.from({ length: numStops }, (_, i) => i + 1) // stop indices 1..n
  );
  const route = [];
  let current = 0; // start at depot (index 0)

  while (unvisited.size > 0) {
    let nearestIndex = -1;
    let nearestDistance = Infinity;

    for (const idx of unvisited) {
      const d = matrix[current][idx];
      if (d < nearestDistance) {
        nearestDistance = d;
        nearestIndex = idx;
      }
    }

    unvisited.delete(nearestIndex);
    route.push(nearestIndex);
    current = nearestIndex;
  }

  return route;
};

// ✅ FIX 3 — 2-opt with distance matrix + timeout guard
// If optimization takes >5 seconds, returns best result so far
// Prevents server hanging on large stop counts
const twoOptMatrix = (seedRoute, matrix, timeoutMs = 5000) => {
  let best = [...seedRoute];
  let bestDist = totalRouteDistanceMatrix(best, matrix);
  let improved = true;
  const deadline = Date.now() + timeoutMs;

  while (improved) {
    // ✅ Timeout check — if taking too long, return best so far
    if (Date.now() > deadline) {
      console.warn("2-opt timeout reached — returning best route found so far");
      break;
    }

    improved = false;

    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        // ✅ Smart swap check using matrix
        // Instead of rebuilding full route, calculate just the 4 affected edges
        const a = i === 0 ? 0 : best[i - 1]; // node before i (depot if i=0)
        const b = best[i];
        const c = best[j];
        const d = j + 1 < best.length ? best[j + 1] : -1; // node after j (-1 if last)

        const oldEdges =
          matrix[a][b] + (d !== -1 ? matrix[c][d] : 0);
        const newEdges =
          matrix[a][c] + (d !== -1 ? matrix[b][d] : 0);

        // Only do the full swap if edges are actually shorter
        if (newEdges < oldEdges - 1e-10) {
          const newRoute = [
            ...best.slice(0, i),
            ...best.slice(i, j + 1).reverse(),
            ...best.slice(j + 1),
          ];
          const newDist = totalRouteDistanceMatrix(newRoute, matrix);

          if (newDist < bestDist) {
            best = newRoute;
            bestDist = newDist;
            improved = true;
          }
        }
      }

      // Check timeout inside inner loop too for large stop counts
      if (Date.now() > deadline) break;
    }
  }

  return best;
};

// Main export
export const optimizeRoute = (depot, stops) => {
  if (!stops || stops.length === 0) return [];

  // Single stop — no optimization needed
  if (stops.length === 1) {
    return [{
      ...stops[0]._doc,
      distanceFromPrevious: calculateDistance(
        depot.latitude, depot.longitude,
        stops[0].latitude, stops[0].longitude
      ),
    }];
  }

  // Build distance matrix once — reused by all functions
  const { matrix, nodes } = buildDistanceMatrix(depot, stops);

  // Step 1: nearest neighbor seed using matrix
  const seededIndices = nearestNeighborMatrix(stops.length, matrix);

  // Step 2: 2-opt improvement with matrix + timeout
  const optimizedIndices = twoOptMatrix(seededIndices, matrix, 5000);

  // Convert indices back to stop objects and attach distanceFromPrevious
  return optimizedIndices.map((stopIndex, i) => {
    const stop = nodes[stopIndex];
    const prevIndex = i === 0 ? 0 : optimizedIndices[i - 1];
    const prev = nodes[prevIndex];

    return {
      ...stop._doc,
      distanceFromPrevious: matrix[prevIndex][stopIndex],
    };
  });
};