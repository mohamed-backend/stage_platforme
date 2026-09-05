import { useState, useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Input, Badge, Skeleton } from '@/components/common'
import { useCurrentUser, useKyc } from '@/hooks'
import { authApi } from '@/api'
import { User, Mail, Phone, Shield, Edit3, Save, X, Camera, FileText, CheckCircle2, Clock, AlertCircle, ArrowLeft } from 'lucide-react'

const roleLabels: Record<string, string> = {
  INVESTOR: 'Investisseur',
  PROJECT_OWNER: 'Porteur de projet',
  INSURER: 'Assureur',
  ADMIN: 'Administrateur',
}

export default function ProfilePage() {
  const location = useLocation()
  const { data: user, isLoading } = useCurrentUser()
  const { data: kycData } = useKyc()
  const [editing, setEditing] = useState(false)
  const defaultForm = useMemo(() => ({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }), [user])
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  if (isLoading) {
    return (
      <DashboardLayout currentPath={location.pathname}>
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card><Skeleton className="h-32 w-full" /></Card>
          <Card><Skeleton className="h-48 w-full" /></Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) return null
  const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || user.username?.[0] || 'U')
  const kycStatus = kycData?.status || (user as any).kyc_status || 'NOT_SUBMITTED'

  const handleSave = async () => {
    setSaving(true)
    try {
      await authApi.updateProfile(form)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      // ignore
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  return (
    <DashboardLayout currentPath={location.pathname}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl sm:text-3xl font-bold tracking-tight">Mon profil</h1>
        </div>

        {saveSuccess && (
          <div
            className="rounded-2xl p-4 flex items-center gap-2"
            style={{ background: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--border-subtle)' }}
          >
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm">Profil mis à jour avec succès.</p>
          </div>
        )}

        {/* Avatar Card */}
        <Card>
          <div className="flex items-center gap-5">
            <div className="relative">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)' }}
              >
                {initials}
              </div>
              <button
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm opacity-50 cursor-not-allowed"
                style={{ background: 'var(--accent)', border: '2px solid var(--surface-primary)' }}
                title="Bientôt disponible"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <h2 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">
                {user.first_name} {user.last_name}
              </h2>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">@{user.username}</p>
              <div className="mt-2 flex items-center gap-2">
                {kycStatus === 'APPROVED' ? (
                  <Badge variant="success">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Vérifié
                  </Badge>
                ) : kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW' ? (
                  <Badge variant="warning">
                    <Clock className="mr-1 h-3 w-3" />
                    En revue
                  </Badge>
                ) : kycStatus === 'REJECTED' ? (
                  <Badge variant="danger">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Rejeté
                  </Badge>
                ) : (
                  <Badge variant="default">Non vérifié</Badge>
                )}
                <Badge variant="info">{user.role ? (roleLabels[user.role] || user.role) : 'Investisseur'}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal info */}
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Informations personnelles</h3>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit3 className="h-4 w-4" />
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setForm(defaultForm) }}>
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave} loading={saving}>
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Prénom" value={editing ? form.first_name : user.first_name || ''} disabled={!editing} onChange={(e) => setForm({...form, first_name: e.target.value})} leftIcon={<User className="h-4 w-4" />} />
              <Input label="Nom" value={editing ? form.last_name : user.last_name || ''} disabled={!editing} onChange={(e) => setForm({...form, last_name: e.target.value})} leftIcon={<User className="h-4 w-4" />} />
            </div>
            <Input label="Email" type="email" value={editing ? form.email : user.email} disabled={!editing} leftIcon={<Mail className="h-4 w-4" />} />
            <Input label="Téléphone" value={editing ? form.phone : user.phone || ''} disabled={!editing} onChange={(e) => setForm({...form, phone: e.target.value})} leftIcon={<Phone className="h-4 w-4" />} placeholder="Non renseigné" />
          </div>
        </Card>

        {/* Security */}
        <Card>
          <h3 style={{ color: 'var(--text-primary)' }} className="mb-4 text-lg font-bold">Sécurité</h3>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between rounded-2xl p-4"
              style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface-secondary)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Mot de passe</p>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs">Protégez votre compte avec un mot de passe fort</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled title="Coming soon">Change</Button>
            </div>
          </div>
        </Card>

        {/* KYC summary */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-bold">Vérification d'identité</h3>
            <Link
              to="/kyc"
              className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              Gérer
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Link>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: kycStatus === 'APPROVED' ? 'var(--success-light)' : kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW' ? 'var(--warning-light)' : 'var(--surface-secondary)',
                  color: kycStatus === 'APPROVED' ? 'var(--success)' : kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW' ? 'var(--warning)' : 'var(--text-muted)',
                }}
              >
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                {kycStatus === 'APPROVED' ? (
                  <>
                    <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Identité vérifiée</p>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">Votre identité a été vérifiée avec succès.</p>
                  </>
                ) : kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW' ? (
                  <>
                    <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Vérification en cours</p>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">Votre dossier est en cours de révision.</p>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Identité non vérifiée</p>
                    <p style={{ color: 'var(--text-muted)' }} className="text-xs">Soumettez vos documents pour investir.</p>
                  </>
                )}
              </div>
              {kycStatus === 'APPROVED' ? (
                <Badge variant="success">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Validé
                </Badge>
              ) : kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW' ? (
                <Badge variant="warning">
                  <Clock className="mr-1 h-3 w-3" />
                  En revue
                </Badge>
              ) : (
                <Link to="/kyc">
                  <Button size="sm" variant="primary">Vérifier</Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
