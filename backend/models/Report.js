const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name:        String,
  dtype:       String,
  non_null:    Number,
  null_pct:    Number,
  unique_vals: Number,
  sample:      String,
}, { _id: false });

const reportSchema = new mongoose.Schema({
  user_id:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:              { type: String, required: true, trim: true },
  original_name:      { type: String, required: true },
  original_size:      { type: Number, default: 0 },
  status:             { type: String, enum: ['queued','processing','completed','failed'], default: 'queued', index: true },
  error_message:      { type: String, default: null },

  // Processing results
  row_count:          { type: Number, default: null },
  col_count:          { type: Number, default: null },
  cat_column:         { type: String, default: null },
  num_column:         { type: String, default: null },
  processing_time_ms: { type: Number, default: null },

  // File paths (server-side only)
  input_path:         { type: String, default: null },
  output_path:        { type: String, default: null },

  // Column metadata
  columns:            { type: [columnSchema], default: [] },

  // JSON summary for in-app charts
  summary:            { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

// Virtual for safe API response
reportSchema.methods.toAPIObject = function () {
  const obj = this.toObject({ virtuals: true });
  return {
    id:                 obj._id.toString(),
    user_id:            obj.user_id.toString(),
    title:              obj.title,
    original_name:      obj.original_name,
    original_size:      obj.original_size,
    status:             obj.status,
    error_message:      obj.error_message,
    row_count:          obj.row_count,
    col_count:          obj.col_count,
    cat_column:         obj.cat_column,
    num_column:         obj.num_column,
    processing_time_ms: obj.processing_time_ms,
    summary:            obj.summary,
    created_at:         obj.createdAt,
    updated_at:         obj.updatedAt,
  };
};

module.exports = mongoose.model('Report', reportSchema);
