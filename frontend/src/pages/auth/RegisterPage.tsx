import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, ShieldCheck, TrendingUp, Sparkles, Lock, ArrowLeft, UserCheck, Briefcase } from 'lucide-react'
import { Button, Input } from '@/components/common'
import { useRegister } from '@/hooks'
import { formatApiError } from '@/utils'

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  role: z.string().min(1, 'Veuillez sélectionner votre profil'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions générales" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { mutate: registerUser, isPending, error } = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'INVESTOR' | 'PROJECT_OWNER'>('INVESTOR')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirmPassword: '',
      role: 'INVESTOR',
      acceptTerms: false as unknown as true,
    },
  })

  const handleRoleSelect = (role: 'INVESTOR' | 'PROJECT_OWNER') => {
    setSelectedRole(role)
    setValue('role', role, { shouldValidate: true })
  }

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, acceptTerms: _acceptTerms, ...rest } = data
    registerUser(
      { ...rest, password_confirm: confirmPassword, role: data.role as 'INVESTOR' | 'PROJECT_OWNER' },
      { onSuccess: () => navigate('/login') }
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Form Panel */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 order-2 lg:order-1">
          <div className="w-full max-w-lg lg:max-w-xl space-y-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-8 sm:p-10 shadow-sm animate-fade-in">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Link>
              <span className="text-xs text-[var(--text-muted)] font-medium">Inscription gratuite</span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Créer un compte</h1>
            </div>

            {/* Role Switcher */}
            <div className="space-y-2">
              <label className="form-label">
                <span>Sélectionnez votre profil :</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('INVESTOR')}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                    selectedRole === 'INVESTOR'
                      ? 'border-[var(--accent)] bg-[var(--accent-light)] shadow-xs font-bold'
                      : 'border-[var(--border-default)] bg-[var(--surface-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className={`h-4 w-4 ${selectedRole === 'INVESTOR' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                    <span className="text-xs font-bold text-[var(--text-primary)]">Investisseur</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('PROJECT_OWNER')}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                    selectedRole === 'PROJECT_OWNER'
                      ? 'border-[var(--accent)] bg-[var(--accent-light)] shadow-xs font-bold'
                      : 'border-[var(--border-default)] bg-[var(--surface-secondary)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className={`h-4 w-4 ${selectedRole === 'PROJECT_OWNER' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                    <span className="text-xs font-bold text-[var(--text-primary)]">Porteur de projet</span>
                  </div>
                </button>
              </div>
              <input type="hidden" {...register('role')} value={selectedRole} />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="rounded-2xl border border-[var(--error-light)] bg-[var(--error-light)]/40 p-4 text-xs font-semibold text-[var(--error)]">
                {formatApiError(error, "Une erreur est survenue lors de l'inscription. Veuillez réessayer.")}
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Prénom"
                  placeholder="Ex: Alex"
                  required
                  {...register('first_name')}
                  disabled={isPending}
                  error={errors.first_name?.message}
                />
                <Input
                  label="Nom"
                  placeholder="Ex: Dupont"
                  required
                  {...register('last_name')}
                  disabled={isPending}
                  error={errors.last_name?.message}
                />
              </div>

              <Input
                label="Nom d'utilisateur"
                placeholder="Ex: alex_dupont"
                required
                {...register('username')}
                disabled={isPending}
                error={errors.username?.message}
              />

              <Input
                label="Adresse email"
                type="email"
                placeholder="nom@exemple.com"
                required
                {...register('email')}
                disabled={isPending}
                error={errors.email?.message}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label form-label-required">
                    <span>Mot de passe</span>
                  </label>
                  <div className="form-control-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 caractères"
                      required
                      {...register('password')}
                      disabled={isPending}
                      className="input-fintech input-with-icon-right text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-icon-right text-[var(--text-muted)]"
                      aria-label="Afficher mot de passe"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.password && <p className="form-error text-[11px]">{errors.password.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">
                    <span>Confirmation</span>
                  </label>
                  <div className="form-control-wrapper">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Répétez"
                      required
                      {...register('confirmPassword')}
                      disabled={isPending}
                      className="input-fintech input-with-icon-right text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="input-icon-right text-[var(--text-muted)]"
                      aria-label="Afficher confirmation"
                    >
                      {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="form-error text-[11px]">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    {...register('acceptTerms')}
                    className="mt-0.5 h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <span>
                    J'accepte les{' '}
                    <a href="#" className="font-bold text-[var(--accent)] hover:underline">conditions générales</a>{' '}
                    et la{' '}
                    <a href="#" className="font-bold text-[var(--accent)] hover:underline">politique de confidentialité</a>.
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="form-error text-[11px] mt-1">{errors.acceptTerms.message}</p>
                )}
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2" loading={isPending}>
                <span>Créer mon compte</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <div className="pt-3 text-center text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-[var(--accent)] hover:underline">
                Se connecter
              </Link>
            </div>
          </div>
        </div>

        {/* Right Branding Panel — Perfectly Horizontally & Vertically Centered */}
        <div className="relative hidden overflow-hidden lg:flex lg:flex-col justify-center items-center p-12 lg:p-16 bg-gradient-to-br from-[#060a13] via-[#0c1221] to-[#131d30] text-white border-l border-[var(--border-subtle)] order-1 lg:order-2">
          {/* Ambient Glows */}
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[var(--accent)]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Centered Content Container */}
          <div className="relative z-10 max-w-md text-center flex flex-col items-center justify-center space-y-7 my-auto">
            {/* Logo */}
            <Link to="/" className="flex flex-col items-center gap-2.5 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[#be185d] shadow-lg shadow-[var(--accent)]/30 transition-transform group-hover:scale-105">
                <span className="text-lg font-extrabold text-white">FS</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold tracking-tight text-white leading-tight">Fundsy</span>
                <span className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-wider mt-0.5">Crowdfunding 2.0</span>
              </div>
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-pink-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Rejoignez +12 000 Investisseurs</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold leading-snug tracking-tight text-white text-center">
              Donnez du sens et du <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300">rendement</span> à votre épargne.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed text-center max-w-sm">
              Une sélection rigoureuse des projets les plus performants dans la transition énergétique, l'immobilier durable et les technologies de rupture.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 w-full">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-pink-400 mb-1.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-white">0 € Frais de tenue</p>
                <p className="text-[10px] text-slate-400">Transparence totale</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-400 mb-1.5">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-white">Dès 50 €</p>
                <p className="text-[10px] text-slate-400">Accessible à tous</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Données chiffrées & protégées</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
