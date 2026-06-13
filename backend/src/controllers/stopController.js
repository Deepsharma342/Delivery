import Stop from "../models/Stop.js";
import { getCoordinatesFromPostcode } from "../services/geocodeService.js";

export const createStop = async (req, res) => {
  try {
    const { postcode } = req.body;

    if (!postcode) {
      return res.status(400).json({
        success: false,
        message: "Postcode is required",
      });
    }

    const coordinates = await getCoordinatesFromPostcode(postcode);

    if (!coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({
        success: false,
        message: `Could not find coordinates for postcode: ${postcode}`,
      });
    }

    const stop = await Stop.create({
      postcode: postcode.trim().toUpperCase(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });

    res.status(201).json({ success: true, data: stop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStops = async (req, res) => {
  try {
    const stops = await Stop.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: stops.length, data: stops });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return res.status(404).json({ success: false, message: "Stop not found" });
    }
    await stop.deleteOne();
    res.status(200).json({ success: true, message: "Stop deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAllStops = async (req, res) => {
  try {
    const result = await Stop.deleteMany({});
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} stops`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkCreateStops = async (req, res) => {
  try {
    const { postcodes } = req.body;

    if (!postcodes || !Array.isArray(postcodes)) {
      return res.status(400).json({
        success: false,
        message: "Postcodes array required",
      });
    }

    // ✅ FIX 1 — parallel geocoding in batches of 10
    // Instead of 100 sequential calls (30s), runs 10 at a time (~3s)
    const BATCH_SIZE = 10;
    const results = [];

    for (let i = 0; i < postcodes.length; i += BATCH_SIZE) {
      const batch = postcodes.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (postcode) => {
          const cleanPostcode = postcode.trim().toUpperCase();
          const coordinates = await getCoordinatesFromPostcode(cleanPostcode);
          return {
            postcode: cleanPostcode,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            failed: !coordinates.latitude || !coordinates.longitude,
          };
        })
      );

      results.push(...batchResults);
    }

    // Split valid and failed
    const validStops = results.filter((s) => !s.failed);
    const failedPostcodes = results
      .filter((s) => s.failed)
      .map((s) => s.postcode);

    if (validStops.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid postcodes found",
        failedPostcodes,
      });
    }

    const createdStops = await Stop.insertMany(
      validStops.map(({ postcode, latitude, longitude }) => ({
        postcode,
        latitude,
        longitude,
      }))
    );

    res.status(201).json({
      success: true,
      count: createdStops.length,
      data: createdStops,
      // Tell the frontend which ones failed so driver can fix them
      failedPostcodes,
      message:
        failedPostcodes.length > 0
          ? `${createdStops.length} imported, ${failedPostcodes.length} failed: ${failedPostcodes.join(", ")}`
          : `All ${createdStops.length} stops imported successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);
    if (!stop) {
      return res.status(404).json({ success: false, message: "Stop not found" });
    }
    stop.completed = true;
    await stop.save();
    res.status(200).json({ success: true, data: stop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};