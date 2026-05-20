import { useState, type FormEvent, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { insforge } from '../lib/insforge'
import { useAuthStore } from '../hooks/useAuthStore'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    if (needsVerification) {
      otpRefs.current[0]?.focus()
    }
  }, [needsVerification])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const digits = pasted.split('')
      setOtp(digits)
      otpRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error: authError } = await insforge.auth.signInWithPassword({
          email,
          password,
        })
        if (authError) throw authError
        setAuth(data?.user ?? null)
        navigate('/dashboard')
      } else {
        const { data, error: authError } = await insforge.auth.signUp({
          email,
          password,
        })
        if (authError) throw authError
        if (data?.requireEmailVerification) {
          setNeedsVerification(true)
          setSuccess('Te enviamos un codigo de verificacion a tu email. Revisa tu bandeja de entrada.')
        } else {
          setAuth(data?.user ?? null)
          navigate('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrio un error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Ingresa el codigo completo de 6 digitos')
      return
    }
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { data, error: verifyError } = await insforge.auth.verifyEmail({
        email,
        otp: code,
      })
      if (verifyError) throw verifyError
      setAuth(data?.user ?? null)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Codigo invalido o expirado')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await insforge.auth.resendVerificationEmail({ email })
      setSuccess('Reenviamos el codigo. Revisa tu email.')
    } catch {
      setSuccess('Reenviamos el codigo. Revisa tu email.')
    } finally {
      setLoading(false)
    }
  }

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">TaskForge</h1>
            <p className="text-surface-500 mt-2">Verifica tu email</p>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-brand-100 dark:bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-brand-600 dark:text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-surface-600">
                Ingresa el codigo de 6 digitos que enviamos a
              </p>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 mt-1">{email}</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 text-surface-900 dark:text-surface-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                ))}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Verificando...
                  </span>
                ) : (
                  'Verificar email'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-sm text-brand-600 dark:text-brand-500 hover:underline font-medium disabled:opacity-50"
              >
                Reenviar codigo
              </button>
              <br />
              <button
                type="button"
                onClick={() => { setNeedsVerification(false); setError(''); setSuccess(''); setOtp(['', '', '', '', '', '']) }}
                className="text-sm text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300"
              >
                Volver al registro
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-100">TaskForge</h1>
          <p className="text-surface-500 mt-2">
            {isLogin ? 'Inicia sesion para continuar' : 'Crea tu cuenta'}
          </p>
        </div>

        <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-800 p-8">
          <div className="flex mb-6 bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                isLogin ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm' : 'text-surface-500 dark:text-surface-400'
              }`}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                !isLogin ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 shadow-sm' : 'text-surface-500 dark:text-surface-400'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-400 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full px-3 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 text-surface-900 dark:text-surface-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-surface-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-400 mb-1">
                Contrasena
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimo 6 caracteres"
                className="w-full px-3 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-950 text-surface-900 dark:text-surface-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-surface-400"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Cargando...
                </span>
              ) : isLogin ? (
                'Iniciar sesion'
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-surface-400 dark:text-surface-500">
            {isLogin ? 'No tenes cuenta?' : 'Ya tenes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-brand-600 dark:text-brand-500 hover:underline font-medium"
            >
              {isLogin ? 'Registrate' : 'Inicia sesion'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
