import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: String,
  image: String,
  brand: String,
  type: String,
  description: String,
  favoritedByUserIds: [String],
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema, 'products');
export default Product;