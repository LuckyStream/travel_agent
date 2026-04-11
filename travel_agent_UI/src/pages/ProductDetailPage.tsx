import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ShoppingCart, CheckCircle, BookOpen, FileText } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { getProductById, products } from "@/data/products";
import NotFound from "./NotFound";

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = getProductById(productId || "");

  if (!product) return <NotFound />;

  const otherProducts = products.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <Layout>
      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <Link to="/shop" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl overflow-hidden shadow-lg"
          >
            <img src={product.image} alt={product.name} className="w-full aspect-[4/3] object-cover" />
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star
                  key={j}
                  className={`w-5 h-5 ${j < Math.floor(product.rating) ? "text-secondary fill-secondary" : "text-muted-foreground"}`}
                />
              ))}
              <span className="text-muted-foreground ml-1">({product.rating} / 5)</span>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {product.pages} pages</span>
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {product.format}</span>
            </div>

            <div className="bg-muted p-6 rounded-xl mb-8">
              <div className="flex items-end justify-between mb-4">
                <span className="text-3xl font-bold text-foreground">€{product.price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">Instant digital download</span>
              </div>
              <button className="w-full bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-semibold hover:opacity-90 transition inline-flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Add to cart
              </button>
            </div>

            {/* Features */}
            <h3 className="font-display text-lg font-bold text-foreground mb-4">What's included</h3>
            <ul className="space-y-3">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Table of contents */}
      <section className="bg-muted">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">What's inside</h2>
          <div className="space-y-6">
            {product.contents.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card p-6 rounded-xl"
              >
                <p className="text-foreground leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Other products */}
      {otherProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherProducts.map(p => (
              <Link key={p.id} to={`/shop/${p.id}`} className="group bg-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                <div className="overflow-hidden aspect-[4/3]">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-foreground">€{p.price.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-secondary fill-secondary" />
                      <span className="text-sm text-muted-foreground">{p.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default ProductDetailPage;
