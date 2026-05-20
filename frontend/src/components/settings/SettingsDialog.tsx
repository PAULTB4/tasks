import { useEffect, useRef, useState } from 'react'
import { Camera, KeyRound, Mail, Shield, Upload, User, X } from 'lucide-react'
import { insforge } from '../../lib/insforge'
import { useAuthStore } from '../../hooks/useAuthStore'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

type SettingsSection = 'profile' | 'security' | 'account'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

const sections: Array<{
  id: SettingsSection
  label: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}> = [
  {
    id: 'profile',
    label: 'Perfil',
    description: 'Nombre y foto',
    icon: User,
  },
  {
    id: 'security',
    label: 'Seguridad',
    description: 'Clave y acceso',
    icon: Shield,
  },
  {
    id: 'account',
    label: 'Cuenta',
    description: 'Correo y datos',
    icon: Mail,
  },
]

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { user, updateProfile } = useAuthStore()
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const profile = user?.profile ?? {}
  const fallbackAvatar = `https://api.dicebear.com/8.x/identicon/svg?seed=${user?.email ?? 'taskforge'}`
  const previewAvatar = avatarUrl.trim() || profile.avatar_url || fallbackAvatar
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    setActiveSection('profile')
    setName(profile.name ?? '')
    setAvatarUrl(profile.avatar_url ?? '')
    setMessage(null)
    setError(null)
  }, [open, profile.name, profile.avatar_url])

  if (!open) return null

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setSavingProfile(true)
    setMessage(null)
    setError(null)

    const { data, error } = await insforge.auth.setProfile({
      name: name.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    })

    setSavingProfile(false)

    if (error) {
      setError(error.message || 'No se pudo guardar el perfil.')
      return
    }

    updateProfile(data ?? { name: name.trim(), avatar_url: avatarUrl.trim() })
    setMessage('Perfil actualizado.')
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5 MB.')
      return
    }

    setUploading(true)
    setError(null)

    const { data, error: uploadError } = await insforge.storage
      .from('avatars')
      .uploadAuto(file)

    setUploading(false)

    if (uploadError) {
      setError(uploadError.message || 'No se pudo subir la imagen.')
      return
    }

    const newUrl = data.url
    setAvatarUrl(newUrl)

    // Auto-save immediately so sidebar updates without reload
    const { data: profileData, error: profileError } = await insforge.auth.setProfile({
      avatar_url: newUrl,
    })

    if (profileError) {
      setError(profileError.message || 'Se subio la imagen pero no se pudo guardar el perfil.')
      return
    }

    updateProfile({ avatar_url: newUrl })
    setMessage('Imagen subida y guardada correctamente.')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveAvatar = async () => {
    setAvatarUrl('')

    const { data, error } = await insforge.auth.setProfile({
      avatar_url: null,
    })

    if (error) {
      setError(error.message || 'No se pudo quitar la foto del perfil.')
      return
    }

    updateProfile({ avatar_url: null })
    setMessage('Foto de perfil eliminada. Se mostrará un avatar por defecto.')
  }

  const handleSendPasswordReset = async () => {
    if (!user?.email) return
    setSendingReset(true)
    setMessage(null)
    setError(null)

    const { error } = await insforge.auth.sendResetPasswordEmail({
      email: user.email,
      redirectTo: `${window.location.origin}/auth`,
    })

    setSendingReset(false)

    if (error) {
      setError(error.message || 'No se pudo enviar el correo de cambio de clave.')
      return
    }

    setMessage('Te enviamos un correo para cambiar tu clave.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <section className="relative flex h-[min(720px,92vh)] w-full max-w-4xl overflow-hidden rounded-3xl border border-surface-200 bg-white shadow-2xl dark:border-surface-700 dark:bg-surface-900">
        <aside className="hidden w-72 shrink-0 border-r border-surface-200 bg-surface-50 p-5 dark:border-surface-800 dark:bg-surface-950 md:block">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-400">
              Ajustes
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-surface-950 dark:text-surface-50">
              Tu cuenta
            </h2>
          </div>

          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                      : 'text-surface-600 hover:bg-white hover:text-surface-950 dark:text-surface-300 dark:hover:bg-surface-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {section.label}
                    </span>
                    <span
                      className={`block truncate text-xs ${
                        isActive ? 'text-brand-100' : 'text-surface-400'
                      }`}
                    >
                      {section.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-surface-200 px-4 py-4 dark:border-surface-800 sm:px-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-surface-400 md:hidden">
                Ajustes
              </p>
              <h3 className="text-xl font-bold text-surface-950 dark:text-surface-50">
                {sections.find((section) => section.id === activeSection)?.label}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
              aria-label="Cerrar ajustes"
            >
              <X size={20} />
            </button>
          </header>

          <div className="flex gap-2 overflow-x-auto border-b border-surface-200 px-4 py-3 dark:border-surface-800 md:hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                  activeSection === section.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {message && (
              <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            )}

            {activeSection === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="rounded-3xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-800 dark:bg-surface-950">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative group">
                      <img
                        src={previewAvatar}
                        alt="Foto de perfil"
                        className="h-24 w-24 rounded-3xl border border-surface-200 bg-surface-200 object-cover dark:border-surface-700"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100 disabled:cursor-not-allowed"
                        title="Cambiar foto"
                      >
                        <Upload size={20} className="text-white" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-surface-800 dark:text-surface-100">
                        <Camera size={16} />
                        Foto de perfil
                      </div>
                      <p className="mb-3 text-sm text-surface-500">
                        Hacé clic en la foto para subir una imagen desde tu dispositivo.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? 'Subiendo...' : 'Subir imagen'}
                        </Button>
                        {(avatarUrl.trim() || profile.avatar_url) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveAvatar}
                          >
                            Quitar
                          </Button>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                    Nombre visible
                  </label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? 'Guardando...' : 'Guardar perfil'}
                  </Button>
                </div>
              </form>
            )}

            {activeSection === 'security' && (
              <div className="space-y-4">
                <div className="rounded-3xl border border-surface-200 bg-surface-50 p-5 dark:border-surface-800 dark:bg-surface-950">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                      <KeyRound size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-surface-950 dark:text-surface-50">
                        Cambiar clave
                      </h4>
                      <p className="text-sm text-surface-500">
                        Te enviamos un correo seguro para resetearla.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleSendPasswordReset}
                    disabled={sendingReset || !user?.email}
                  >
                    {sendingReset ? 'Enviando...' : 'Enviar correo de cambio'}
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-surface-700 dark:text-surface-300">
                    Correo
                  </label>
                  <Input value={user?.email ?? ''} disabled />
                  <p className="mt-2 text-xs text-surface-400">
                    Cambio de correo queda preparado para una próxima iteración cuando definamos flujo de verificación.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  )
}
