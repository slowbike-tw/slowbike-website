import { getProducts } from "@/lib/repositories";
import { formatPrice, lineUrl } from "@/lib/site-data";

export default async function Home() {
  const products = await getProducts({ storefrontOnly: true });
  const heroProduct = products.find((product) => product.slug === "fold") ?? products[0];

  return (
    <main className="site-main">
      <header className="site-header">
        <a href="/" className="brand-link" aria-label="SlowBike 首頁">
          <img src="/images/brand/slowbike-logo-main.jpg" alt="SlowBike" />
        </a>
        <nav className="site-nav" aria-label="主要導覽">
          <a href="#products">車款</a>
          <a href="#service">服務</a>
          <a href="#payment">付款</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="line-button compact" href={lineUrl} target="_blank" rel="noreferrer">
          官方 LINE
        </a>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">SlowBike Electric Bicycle</p>
          <h1>選一台真正適合你的電動車。</h1>
          <p className="lead">
            我們把車款、付款與售後安排說清楚，讓你先看用途，再看規格，找到適合自己的電動腳踏車。
          </p>
          <div className="hero-actions">
            <a className="line-button" href={lineUrl} target="_blank" rel="noreferrer">
              詢問車款
            </a>
            <a className="secondary-button" href="#products">
              查看車款
            </a>
          </div>
          <div className="trust-strip" aria-label="SlowBike 服務重點">
            <span>預約試乘</span>
            <span>售後服務</span>
            <span>可刷卡、可分期</span>
          </div>
        </div>
        {heroProduct ? (
          <a className="hero-media" href={`/products/${heroProduct.slug}`}>
            <img src={heroProduct.imagePath} alt={`SlowBike ${heroProduct.name}`} />
          </a>
        ) : null}
      </section>

      <section id="products" className="section">
        <div className="section-heading left">
          <p className="eyebrow">Lineup</p>
          <h2>主力車款</h2>
          <p>點擊車款圖片或標題，可以進入各車款銷售頁。</p>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.slug}>
              <a className="product-image" href={`/products/${product.slug}`}>
                <img src={product.imagePath} alt={`SlowBike ${product.name}`} />
              </a>
              <div className="product-body">
                <p className="product-subtitle">{product.subtitle}</p>
                <h3>
                  <a href={`/products/${product.slug}`}>{product.name}</a>
                </h3>
                <p className="fit-text">{product.summary}</p>
                <div className="price-row single-price">
                  <div>
                    <span>售價</span>
                    <strong>{product.price ? formatPrice(product.price) : "請洽 LINE"}</strong>
                  </div>
                </div>
                <a className="card-link" href={`/products/${product.slug}`}>
                  查看車款
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-section" id="service">
        <div className="section-heading left">
          <p className="eyebrow">Service</p>
          <h2>預約試乘、售後服務</h2>
          <p>主要門店與合作維修據點會持續更新，實際看車與售後安排可加入官方 LINE 確認。</p>
        </div>
        <div className="service-layout">
          <div className="info-panel">
            <h3>主要門店</h3>
            <div className="store-list">
              <div className="store-item">
                <strong>SlowBike 北區店</strong>
                <span>桃園市龜山區復興北路92號正對面</span>
                <a href="tel:0981809935">0981-809935</a>
              </div>
              <div className="store-item">
                <strong>SlowBike 恆春店</strong>
                <span>屏東縣恆春鎮環城北路242號</span>
                <a href="tel:088203591">08-8203591</a>
              </div>
            </div>
          </div>
          <div className="info-panel">
            <h3>合作維修據點</h3>
            <div className="partner-grid">
              {["新北板橋", "苗栗南苗", "彰化鹿港", "雲林斗六", "台南", "高雄大社", "台東市"].map(
                (partner) => (
                  <span key={partner}>{partner}</span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section info-band" id="payment">
        <div>
          <p className="eyebrow">Payment</p>
          <h2>付款方式</h2>
        </div>
        <div className="payment-list">
          {["現金 / 匯款", "LINE Pay", "信用卡刷卡", "中租無卡分期"].map((payment) => (
            <span key={payment}>{payment}</span>
          ))}
        </div>
      </section>

      <section className="section" id="faq">
        <div className="section-heading">
          <p className="eyebrow">FAQ</p>
          <h2>常見問題</h2>
        </div>
        <div className="faq-list">
          {[
            ["可以先看車嗎？", "可以，建議先加入官方 LINE 預約，確認車款與時間。"],
            ["可以刷卡或分期嗎？", "可以，實際購買與付款方式可加入官方 LINE 詢問。"],
            ["售後怎麼安排？", "SlowBike 會依照門店與合作維修據點安排售後服務。"],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <img src="/images/brand/slowbike-logo-inverted.jpg" alt="SlowBike" />
        <p>SlowBike 電動腳踏車專賣店｜support@slowbike.com.tw</p>
        <a href={lineUrl} target="_blank" rel="noreferrer">
          加入官方 LINE
        </a>
      </footer>
    </main>
  );
}
