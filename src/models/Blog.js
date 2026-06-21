import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    excerpt: {
      type: String,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    coverImagePublicId: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Hiring Tips", "Design", "Development", "Business", "Marketing", "Guide", "News"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    readTime: {
      type: String,
      default: "5 min",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Generate slug from title
blogSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check for existing slug and append suffix if needed
    let slug = baseSlug;
    let count = 1;
    while (await mongoose.model("Blog").exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

blogSchema.index({ status: 1, createdAt: -1 });


const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
