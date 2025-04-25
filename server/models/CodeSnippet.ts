import mongoose from "mongoose";

const codeSnippetSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
  },
  { toJSON: { virtuals: true }, timestamps: true }
);

export default mongoose.model("CodeSnippet", codeSnippetSchema);
