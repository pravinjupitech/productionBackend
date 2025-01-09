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
        currentStock: {
          type: Number,
        },
        duration: {
          type: String,
        },
        primaryUnit: {
          type: String,
        },
        primaryTarget: {
          type: String,
        },
        secondaryUnit: {
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
        sixMonthsTargetPrimary: {
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
