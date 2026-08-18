import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/repositories";
import { formatPrice, lineUrl, lines } from "@/lib/site-data";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "active") notFound();

  return (
    <main className="site-main product-page">
      <header className="site-header">
        <a href="/" className="brand-link" aria-label="SlowBike 首頁">
          <img src="/images/brand/slowbike-logo-main.jpg" alt="SlowBike" />
        </a>
        <nav className="site-nav" aria-label="主要導覽">
          <a href="/#products">車款</a>
          <a href="/#service">服務</a>
          <a href="/#payment">付款</a>
        </nav>
        <a className="line-button compact" href={lineUrl} target="_blank" rel="noreferrer">
          官方 LINE
        </a>
      </header>

      <section className="product-hero">
        <div className="product-hero-copy">
          <p className="eyebrow">{product.subtitle}</p>
          <h1>SlowBike {product.name}</h1>
          <p>{product.summary}</p>
          <div className="product-price">
            <span>售價</span>
            <strong>{formatPrice(product.price)}</strong>
          </div>
          <div className="hero-actions">
            <a className="line-button" href={lineUrl} target="_blank" rel="noreferrer">
              官方 LINE 購買 / 試乘
            </a>
            <a className="secondary-button" href="/">
              回到首頁
            </a>
          </div>
        </div>
        <div className="product-hero-image">
          <img src={product.imagePath} alt={`SlowBike ${product.name}`} />
        </div>
      </section>

      <section className="section product-detail-grid">
        <article className="info-panel">
          <p className="eyebrow">Specs</p>
          <h2>主要規格</h2>
          <ul className="clean-list">
            {lines(product.specs).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="info-panel">
          <p className="eyebrow">Highlights</p>
          <h2>適合用途</h2>
          <ul className="clean-list">
            {lines(product.highlights).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section sales-section">
        <p className="eyebrow">Why this bike</p>
        <h2>{product.name} 適合什麼樣的使用者？</h2>
        <p>{product.salesCopy}</p>
        <a className="line-button" href={lineUrl} target="_blank" rel="noreferrer">
          詢問 {product.name}
        </a>
      </section>
    </main>
  );
}
