import mongoose from "mongoose";

const hubZoneSchema = new mongoose.Schema(
  {
    hubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hub",
      required: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

hubZoneSchema.index({ hubId: 1, zoneId: 1 }, { unique: true });
hubZoneSchema.index({ hubId: 1 });
hubZoneSchema.index({ zoneId: 1 });

const HubZone = mongoose.model("HubZone", hubZoneSchema);

export default HubZone;
