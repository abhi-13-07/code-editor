import mongoose from "mongoose";

interface ICodeSnippet {
  languageId: number;
  code: string;
}

const codeSnippetSchema = new mongoose.Schema<ICodeSnippet>(
  {
    languageId: {
      type: Number,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { toJSON: { virtuals: true }, timestamps: true }
);

export default mongoose.model<ICodeSnippet>("CodeSnippet", codeSnippetSchema);
