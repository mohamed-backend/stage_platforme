import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '@/components/common'
import { ArrowRight, CheckCircle2, ArrowLeft, KeyRound, Lock } from 'lucide-react'
import { useForgotPassword } from '@/hooks'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { mutate: forgotPassword } = useForgotPassword()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    forgotPassword(
      { email },
      {
        onSuccess: () => {
          setIsSubmitted(true)
          setIsLoading(false)
        },
        onError: (err: Error) => {
          setError(err.message || 'An error occurred. Please try again.')
          setIsLoading(false)
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Branding — Perfectly Horizontally & Vertically Centered */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col justify-center items-center p-12 lg:p-16 bg-gradient-to-br from-[#060a13] via-[#0c1221] to-[#131d30] text-white border-r border-[var(--border-subtle)]">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[var(--accent)]/15 blur-3xl pointer-events-none" />

          {/* Centered Content Container */}
          <div className="relative z-10 max-w-md text-center flex flex-col items-center justify-center space-y-7 my-auto">
            <Link to="/" className="flex flex-col items-center gap-2.5 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#be185d] shadow-lg shadow-[var(--accent)]/30 transition-transform group-hover:scale-105">
                <span className="text-lg font-extrabold text-white">FS</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold tracking-tight text-white leading-tight">Fundsy</span>
                <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mt-0.5">Fintech Crowdfunding</span>
              </div>
            </Link>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[var(--accent)]">
              <KeyRound className="h-6 w-6" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-white text-center">
              Récupération de compte sécurisée
            </h2>
            <p className="text-sm sm:text-base text-slate-300 text-center max-w-sm">
              Recevez instantanément un lien chiffré pour réinitialiser votre mot de passe en toute sécurité.
            </p>

            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Données chiffrées & protégées SSL</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-lg space-y-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-8 sm:p-10 shadow-sm animate-fade-in">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">Mot de passe oublié</h1>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                Entrez votre adresse email enregistrée pour recevoir les instructions de réinitialisation.
              </p>
            </div>

            {isSubmitted ? (
              <div className="rounded-2xl border border-[var(--success-light)] bg-[var(--success-light)]/40 p-6 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--success-light)] text-[var(--success)]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Email envoyé avec succès</h3>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Un lien sécurisé de réinitialisation a été envoyé à <strong>{email}</strong>.
                  </p>
                </div>
                <Link to="/login" className="block pt-2">
                  <Button variant="secondary" size="md" className="w-full">
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-[var(--error-light)] bg-[var(--error-light)]/40 p-4 text-xs font-semibold text-[var(--error)]">
                    {error}
                  </div>
                )}
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button type="submit" variant="primary" size="lg" className="w-full" loading={isLoading}>
                  <span>Envoyer le lien de réinitialisation</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
