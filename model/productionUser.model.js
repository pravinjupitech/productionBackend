import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  dob: {
    type: String,
  },
  mob_no: {
    type: String,
  },
  email: {
    type: String,
  },
  fatherName: {
    type: String,
  },
  fathers_mob_no: {
    type: String,
  },
  mothers_mob_no: {
    type: String,
  },
  thana: {
    type: String,
  },
  passport_no: {
    type: String,
  },
  adhar_no: {
    type: String,
  },
  pan_no: {
    type: String,
  },
  ank_name: {
    type: String,
  },
  account_no: {
    type: String,
  },
  ifsc_code: {
    type: String,
  },
  referance_name: [],
  referance_relation: {
    type: String,
  },
  referance_mob_no: {
    type: String,
  },
  last_job_firn_name: {
    type: String,
  },
  address: {
    type: String,
  },
  phone_no: {
    type: String,
  },
});
export const productUser = mongoose.model("productionUser", userSchema);

