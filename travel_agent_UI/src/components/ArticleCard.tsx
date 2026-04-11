import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/data/destinations";

const ArticleCard = ({ article }: { article: Article }) => {
  return (
    <div className="group bg-card rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link to={`/article/${article.id}`}>
        <div className="overflow-hidden aspect-[4/3]">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-5">
        <span className="inline-block text-[10px] uppercase tracking-[0.15em] text-primary font-semibold border border-primary/30 rounded-full px-3 py-0.5 mb-3">
          {article.category}
        </span>
        <h3 className="font-display text-xl font-bold text-foreground mt-1 mb-3 line-clamp-2 leading-snug">
          <Link to={`/article/${article.id}`} className="hover:text-primary transition">
            {article.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{article.excerpt}</p>
        <Link
          to={`/article/${article.id}`}
          className="inline-flex items-center gap-2 text-primary font-semibold text-sm border border-primary rounded-full px-5 py-2 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Read more <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;