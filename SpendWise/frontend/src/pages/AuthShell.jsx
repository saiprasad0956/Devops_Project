import { ArrowLeft, BarChart3, LockKeyhole, PieChart, ReceiptText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const points = [
  { icon: ReceiptText, title: "Record every transaction", text: "Income and expenses, searchable by date and category." },
  { icon: PieChart, title: "Stay within your budgets", text: "Monthly limits with clear progress and alerts." },
  { icon: BarChart3, title: "See where your money goes", text: "Charts and reports you can export as CSV." },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link to="/" className="landing-logo">
          <span className="landing-logo-mark"><TrendingUp size={20} /></span>
          SpendWise
        </Link>
        <Link to="/" className="auth-back"><ArrowLeft size={15} /> Back to home</Link>
      </header>

      <main className="auth-body">
        <section className="auth-copy">
          <span className="landing-eyebrow"><span />A clearer view of your finances</span>
          <h2>Make sense of your money, <span>one day at a time.</span></h2>
          <p>Track income and expenses, plan monthly budgets and see your spending patterns, all in one simple place.</p>
          <div className="auth-points">
            {points.map(({ icon: Icon, title: t, text }) => (
              <div className="auth-point" key={t}>
                <span className="auth-point-icon"><Icon size={19} /></span>
                <div><strong>{t}</strong><small>{text}</small></div>
              </div>
            ))}
          </div>
        </section>

        <div className="auth-card-wrap">
          <div className="auth-card">
            <h1>{title}</h1>
            <p className="auth-card-sub">{subtitle}</p>
            {children}
            <p className="auth-footer-text">{footer}</p>
            <p className="auth-trust"><LockKeyhole size={13} /> Your financial records stay private to your account</p>
          </div>
        </div>
      </main>
    </div>
  );
}
