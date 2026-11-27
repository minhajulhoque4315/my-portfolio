import Link from 'next/link';
import { getPortfolioItemDetailPath, toPortfolioPreviewItems } from '@/lib/portfolio-content';
import { getServerPortfolioDataset } from '@/lib/server-portfolio-data';

const srOnly: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
};

export function CrawlableAboutContent() {
  return <section style={srOnly} aria-label="About Md. Minhajul Hoque">
    <h1>Md. Minhajul Hoque — Video Editor &amp; Motion Designer</h1>
    <p>Video editor and motion designer based in Dhaka, Bangladesh. I create documentary edits, talking-head videos, short-form content, motion graphics and brand design for remote clients worldwide.</p>
    <h2>Experience and creative services</h2>
    <p>Video editing, motion graphics, social media content, brand identity design, graphic design and thumbnail design.</p>
  </section>;
}

export function CrawlableContactContent() {
  return <section style={srOnly} aria-label="Contact Md. Minhajul Hoque">
    <h1>Contact Md. Minhajul Hoque</h1>
    <p>Discuss video editing, motion graphics, graphic design or a new creative project.</p>
    <form action="/api/contact" method="post">
      <label htmlFor="crawlable-name">Your name *</label><input id="crawlable-name" name="name" required />
      <label htmlFor="crawlable-email">Email *</label><input id="crawlable-email" name="email" type="email" required />
      <label htmlFor="crawlable-message">Project details *</label><textarea id="crawlable-message" name="message" required />
      <p>Fields marked * are required.</p><button type="submit">Send Message</button>
    </form>
  </section>;
}

export function CrawlableTutorialContent() {
  return <section style={srOnly} aria-label="Video editing and design tutorials">
    <h1>Video Editing and Design Tutorials</h1>
    <p>Practical tutorials covering video editing, motion graphics, graphic design and creative workflows.</p>
  </section>;
}

export async function CrawlablePortfolioContent() {
  const dataset = await getServerPortfolioDataset();
  const items = toPortfolioPreviewItems(dataset.videos, dataset.graphics, dataset.categories)
    .filter(item => item.visible && item.categoryActive && item.categoryShowOnPortfolio);
  return <section style={srOnly} aria-label="Portfolio projects">
    <h1>Portfolio</h1>
    <p>Selected video editing, motion graphics and graphic design projects.</p>
    <ul>{items.map(item => <li key={`${item.sourceType}-${item.id}`}>
      <Link href={getPortfolioItemDetailPath(item)}><img src={item.imageUrl} alt={item.title} />{item.title} — {item.categoryName}</Link>
    </li>)}</ul>
  </section>;
}
