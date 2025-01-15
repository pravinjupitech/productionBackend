import mongoose from "mongoose";
const rawProductTargetSchema = new mongoose.Schema(
  {
    database: {
      type: String,
    },
    Target: [
      {
        product: {
          type: String,
        },
        productId: {
          type: String,
        },
        monthRange: {
          type: String,
        },
        currentStock: {
          type: Number,
        },
        duration: {
          type: String,
        },
        dayCount: {
          type: Number,
        },
        primaryUnit: {
          type: String,
        },
        primaryTarget: {
          type: Number,
        },
        secondaryUnit: {
          type: String,
        },
        secondaryTarget: {
          type: Number,
        },
        dailyTargetPrimary: {
          type: Number,
        },
        dailyTargetSecondary: {
          type: Number,
        },
        monthlyTargetPrimary: {
          type: Number,
        },
        monthlyTargetSecondary: {
          type: Number,
        },
        threeMonthsTargetPrimary: {
          type: Number,
        },
        threeMonthsTargetSecondary: {
          type: Number,
        },
        sixMonthsTargetPrimary: {
          type: Number,
        },
        sixMonthsTargetSecondary: {
          type: Number,
        },
        yearlyTargetPrimary: {
          type: Number,
        },
        yearlyTargetSecondary: {
          type: Number,
        },
        requiredProducts: [
          {
            rawMaterial: {
              type: String,
            },
            step: { type: String },
            unit: [
              {
                unit: {
                  type: String,
                },
                dailyTarget: {
                  type: Number,
                },
                monthlyTarget: {
                  type: Number,
                },
                threeMonthsTarget: {
                  type: Number,
                },
                sixMonthsTarget: {
                  type: Number,
                },
                yearlyTarget: {
                  type: Number,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);
export const RawProductTarget = mongoose.model(
  "rawProductTarget",
  rawProductTargetSchema
);
