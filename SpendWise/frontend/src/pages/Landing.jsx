import { ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Check, FileDown, LockKeyhole, PieChart, ReceiptText, Search, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: ReceiptText,
    title: "Transactions, all in one place",
    description: "Add, edit, and find income or expenses by date, type, category, or description.",
    href: "/transactions",
    link: "Explore transactions",
  },
  {
    icon: PieChart,
    title: "Budgets that keep you on track",
    description: "Set an overall monthly limit or budgets for individual categories, then follow progress.",
    href: "/budgets",
    link: "Explore budgets",
  },
  {
    icon: BarChart3,
    title: "Understand your trends",
    description: "See monthly income and spending, savings trends, and category breakdowns in charts.",
    href: "/analytics",
    link: "Explore analytics",
  },
  {
    icon: FileDown,
    title: "Reports you can take with you",
    description: "Filter transactions by date, type, and category, then export a CSV report.",
    href: "/reports",
    link: "Explore reports",
  },
  {
    icon: Search,
    title: "A useful financial overview",
    description: "Review your balance, income, expenses, budget usage, and recent activity on one dashboard.",
    href: "/dashboard",
    link: "Explore dashboard",
  },
  {
    icon: ShieldCheck,
    title: "Your own private account",
    description: "Sign in to manage your profile and password. Your financial records are scoped to your account.",
    href: "/register",
    link: "Create your account",
  },
];

function DashboardPreview() {
  return (
    <div className="landing-preview-wrap" aria-label="Illustrative SpendWise dashboard preview">
      <div className="landing-preview-note">
        <span className="landing-note-icon"><Check size={17} /></span>
        <span><strong>Stay in the know</strong><small>Income, spending &amp; budgets</small></span>
      </div>
      <div className="landing-preview">
        <div className="landing-preview-top">
          <div className="landing-brand-mark"><TrendingUp size={19} /></div>
          <span>SpendWise</span>
          <span className="landing-preview-label">Illustrative preview</span>
        </div>
        <div className="landing-preview-body">
          <div className="landing-preview-heading">
            <div><small>YOUR MONEY, AT A GLANCE</small><h2>Financial overview</h2></div>
            <div className="landing-preview-avatar">S</div>
          </div>
          <div className="landing-preview-stats">
            <div><span><ArrowUpRight size={14} /> Income</span><strong>From your entries</strong><i className="landing-stat-income" /></div>
            <div><span><ArrowDownRight size={14} /> Expenses</span><strong>From your entries</strong><i className="landing-stat-expense" /></div>
          </div>
          <div className="landing-preview-chart">
            <div className="landing-chart-heading"><span>Income vs. expenses</span><span>Monthly view</span></div>
            <div className="landing-chart">
              <div className="landing-chart-grid"><i /><i /><i /><i /></div>
              <div className="landing-chart-bars" aria-hidden="true">
                {[38, 58, 44, 75, 52, 89, 61, 72, 48, 82, 57, 68].map((height, index) => (
                  <span key={index} style={{ height: `${height}%` }}><i /></span>
                ))}
              </div>
            </div>
            <div className="landing-chart-legend"><span><i /> Income</span><span><i /> Expenses</span></div>
          </div>
          <div className="landing-preview-footer">
            <WalletCards size={16} /><span>Budgets</span><div className="landing-footer-progress"><i /></div><small>Track your progress</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-nav">
          <Link to="/" className="landing-logo" aria-label="SpendWise home">
            <span className="landing-logo-mark"><TrendingUp size={21} /></span>
            <span>SpendWise</span>
          </Link>
          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <div className="landing-nav-actions">
            <Link to="/login" className="landing-login">Log in</Link>
            <Link to="/register" className="landing-nav-cta">Get started <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <div className="landing-hero-copy">
              <span className="landing-eyebrow"><span /> A clearer view of your finances</span>
              <h1>Make sense of your money, <span>one day at a time.</span></h1>
              <p>Track income and expenses, plan your monthly budgets, and see your spending patterns — all in one simple place.</p>
              <div className="landing-hero-actions">
                <Link to="/register" className="landing-primary-cta">Create your account <ArrowRight size={18} /></Link>
                <a href="#features" className="landing-secondary-cta">See what you can do</a>
              </div>
              <div className="landing-trust-line"><LockKeyhole size={15} /> Personal account · Your data stays yours</div>
            </div>
            <DashboardPreview />
          </div>
          <a className="landing-scroll-cue" href="#features">Discover SpendWise <span /></a>
        </section>

        <section className="landing-features section-wrap" id="features">
          <div className="landing-section-heading">
            <span className="landing-kicker">Built for everyday money</span>
            <h2>Everything you need to stay <span>in control.</span></h2>
            <p>A straightforward toolkit for the parts of money tracking you use every day.</p>
          </div>
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, description, href, link }) => (
              <article className="landing-feature-card" key={title}>
                <div className="landing-feature-icon"><Icon size={21} /></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <Link to={href}>{link}<ArrowRight size={15} /></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-how" id="how-it-works">
          <div className="section-wrap landing-how-inner">
            <div className="landing-how-intro">
              <span className="landing-kicker">Simple by design</span>
              <h2>Start with your spending. <span>Build from there.</span></h2>
              <p>No complicated setup. Add your transactions and SpendWise brings your overview, budgets, and reports together.</p>
              <Link to="/register" className="landing-how-cta">Start tracking <ArrowRight size={17} /></Link>
            </div>
            <div className="landing-steps">
              <div><span>01</span><div><h3>Create your account</h3><p>Sign up and get your personal SpendWise workspace.</p></div></div>
              <div><span>02</span><div><h3>Record income &amp; expenses</h3><p>Add transactions with dates, descriptions, and categories.</p></div></div>
              <div><span>03</span><div><h3>Set your monthly budgets</h3><p>Choose an overall limit or set budgets by category.</p></div></div>
              <div><span>04</span><div><h3>Review and export</h3><p>Explore charts and download filtered reports as CSV.</p></div></div>
            </div>
          </div>
        </section>

        <section className="landing-bottom-cta">
          <div className="landing-bottom-cta-inner">
            <div><span className="landing-kicker">Your next step</span><h2>Feel more in control of your money.</h2><p>Start tracking with the tools SpendWise already gives you.</p></div>
            <Link to="/register" className="landing-primary-cta">Create your account <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Link to="/" className="landing-logo"><span className="landing-logo-mark"><TrendingUp size={19} /></span><span>SpendWise</span></Link>
        <span>Personal expense tracking, made clearer.</span>
        <div><Link to="/login">Log in</Link><Link to="/register">Create account</Link></div>
      </footer>
    </div>
  );
}
