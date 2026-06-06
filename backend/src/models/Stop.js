import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    postcode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Stop = mongoose.model("Stop", stopSchema);

export default Stop;