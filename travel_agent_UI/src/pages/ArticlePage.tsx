import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Share2, Facebook, Twitter } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/ArticleCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { getArticleById, getAllArticles } from "@/data/destinations";
import NotFound from "./NotFound";

const ArticlePage = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const result = getArticleById(articleId || "");

  if (!result) return <NotFound />;

  const { article, country, continent } = result;
  const allArticles = getAllArticles().filter(a => a.id !== article.id);
  const related = allArticles.sort(() => 0.5 - Math.random()).slice(0, 3);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-80 md:h-[450px] overflow-hidden">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {continent && country && (
              <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
                <Link to={`/destinations/${continent.slug}`} className="hover:text-white transition">{continent.name}</Link>
                <span>/</span>
                <Link to={`/destinations/${continent.slug}/${country.slug}`} className="hover:text-white transition">{country.name}</Link>
              </div>
            )}
            <span className="text-xs uppercase tracking-widest text-primary font-semibold bg-white/10 backdrop-blur px-3 py-1 rounded-full">{article.category}</span>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-white mt-3 leading-tight">{article.title}</h1>
          </motion.div>
        </div>
      </section>

      {/* Meta bar */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-4 border-b border-border">
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {article.author && (
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {article.author}</span>
          )}
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(article.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-1">Share</span>
          <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition" aria-label="Share on Facebook"><Facebook className="w-4 h-4" /></button>
          <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition" aria-label="Share on Twitter"><Twitter className="w-4 h-4" /></button>
          <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition" aria-label="Share"><Share2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 md:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          {article.content && article.content.length > 0 ? (
            article.content.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg"
              >
                {paragraph}
              </motion.p>
            ))
          ) : (
            <p className="text-muted-foreground leading-relaxed text-lg">{article.excerpt}</p>
          )}
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-border">
          {continent && country ? (
            <Link to={`/destinations/${continent.slug}/${country.slug}`} className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to {country.name}
            </Link>
          ) : (
            <Link to="/destinations" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to destinations
            </Link>
          )}
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="bg-muted">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">More travel stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <NewsletterSignup />
      </section>
    </Layout>
  );
};

export default ArticlePage;
