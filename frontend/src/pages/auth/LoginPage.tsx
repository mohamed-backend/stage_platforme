import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, ShieldCheck, TrendingUp, Users, Sparkles, Lock, ArrowLeft } from 'lucide-react'
import { Button, Input } from '@/components/common'
import { useLogin } from '@/hooks'
import { formatApiError } from '@/utils'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending, error } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = (data: LoginFormData) => {
    login(
      { username: data.username, password: data.password },
      {
        onSuccess: (res: any) => {
          const role = res?.user?.role
          if (role === 'ADMIN') {
            navigate('/admin')
          } else if (role === 'INSURER') {
            navigate('/insurer')
          } else {
            navigate('/dashboard')
          }
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Branding Panel — Perfectly Horizontally & Vertically Centered */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col justify-center items-center p-12 lg:p-16 bg-gradient-to-br from-[#060a13] via-[#0c1221] to-[#131d30] text-white border-r border-[var(--border-subtle)]">
          {/* Ambient Glows */}
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[var(--accent)]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          {/* Centered Content Container */}
          <div className="relative z-10 max-w-md text-center flex flex-col items-center justify-center space-y-7 my-auto">
            {/* Logo */}
            <Link to="/" className="flex flex-col items-center gap-2.5 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#be185d] shadow-lg shadow-[var(--accent)]/30 transition-transform group-hover:scale-105">
                <span className="text-lg font-extrabold text-white">FS</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold tracking-tight text-white leading-tight">Fundsy</span>
                <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mt-0.5">Fintech Crowdfunding</span>
              </div>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-pink-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Espace Investisseur Sécurisé</span>
            </div>
            
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-snug tracking-tight text-white text-center">
              Plateforme d'Investissement <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300">Haute Performance</span>
            </h2>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 w-full">
              <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--accent)] mb-1">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-white">Conformité AMF & UE</p>
              </div>
              <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-400 mb-1">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-white">+12.4% Rendement Moyen</p>
              </div>
            </div>
          </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sécurité bancaire 256-bit SSL</span>
            </div>
          </div>

        {/* Right Form Panel — Breathable, spacious layout */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-lg space-y-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-8 sm:p-10 shadow-sm animate-fade-in">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Accueil
              </Link>
              <span className="text-xs text-[var(--accent)] font-bold bg-[var(--accent-light)] px-2.5 py-1 rounded-full">Accès Sécurisé</span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Connexion</h1>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="rounded-2xl border border-[var(--error-light)] bg-[var(--error-light)]/40 p-4 text-xs font-semibold text-[var(--error)] flex items-center gap-2">
                <span>{formatApiError(error, 'Identifiants invalides. Veuillez vérifier votre nom d\'utilisateur et mot de passe.')}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Nom d'utilisateur"
                type="text"
                placeholder="nom@exemple.com"
                required
                {...register('username')}
                disabled={isPending}
                error={errors.username?.message}
              />

              <div className="form-group">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="form-label form-label-required mb-0">
                    <span>Mot de passe</span>
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="form-control-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    required
                    {...register('password')}
                    disabled={isPending}
                    className="input-fintech input-with-icon-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-icon-right text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="form-error mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[var(--text-secondary)]">
                  <input type="checkbox" className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent)] focus:ring-[var(--accent)]" />
                  <span>Mémoriser ma session pendant 30 jours</span>
                </label>
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={isPending}>
                <span>Se connecter</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="pt-4 text-center text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
              Vous n'avez pas encore de compte ?{' '}
              <Link to="/register" className="font-bold text-[var(--accent)] hover:underline">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
