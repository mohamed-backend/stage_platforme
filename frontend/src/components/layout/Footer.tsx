import { Link } from 'react-router-dom'
import { Mail, ShieldCheck } from 'lucide-react'
import { siteConfig } from '@/config/site.config'

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
)

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
)

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  x: XIcon,
  linkedin: LinkedInIcon,
  facebook: FacebookIcon,
  mail: Mail,
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="flex items-center gap-3 group inline-flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-md shadow-pink-500/30 transition-transform duration-300 group-hover:scale-105">
                <span className="text-sm font-black text-white tracking-wider">{siteConfig.brand.initials}</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white">{siteConfig.brand.name}</span>
            </Link>
            <p className="footer-brand-desc">{siteConfig.brand.description}</p>
            <div className="footer-social-list">
              {siteConfig.social.map((s) => {
                const Icon = iconMap[s.icon]
                return (
                  <a key={s.label} href={s.url} aria-label={s.label} className="footer-social-link">
                    <Icon />
                  </a>
                )
              })}
            </div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-xs text-slate-400 border border-white/10">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>{siteConfig.brand.compliance}</span>
            </div>
          </div>

          <div>
            <h4 className="footer-column-title">Plateforme</h4>
            <ul className="footer-links-list">
              {siteConfig.navigation.platform.map((link) => (
                <li key={link.label}><Link to={link.to} className="footer-link">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="footer-column-title">Entreprise</h4>
            <ul className="footer-links-list">
              {siteConfig.navigation.company.map((link) => (
                <li key={link.label}>
                  {'disabled' in link && link.disabled ? (
                    <span className="footer-link opacity-50 cursor-default select-none">{link.label}</span>
                  ) : 'url' in link ? (
                    <a href={link.url} className="footer-link">{link.label}</a>
                  ) : 'to' in link ? (
                    <Link to={link.to} className="footer-link">{link.label}</Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>


          <div>
            <h4 className="footer-column-title">Légal & Régulation</h4>
            <ul className="footer-links-list">
              {siteConfig.navigation.legal.map((link) => (
                <li key={link.label}><span className="footer-link opacity-50 cursor-default select-none">{link.label}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{siteConfig.footer.copyright(currentYear)}</p>
          <p className="max-w-xl text-left sm:text-right">{siteConfig.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
