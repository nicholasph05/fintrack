import { useState, type FormEvent } from 'react'

const AUTH_URL = 'http://localhost:8080/api/auth'

type Props = { onAuthenticated: (token: string, isRegistration: boolean) => void }

function AuthPage({ onAuthenticated }: Props) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const response = await fetch(`${AUTH_URL}/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegistering ? { name, email, password } : { email, password }),
      })
      if (!response.ok) throw new Error('No fue posible autenticar la cuenta')
      const data: { token: string } = await response.json()

      onAuthenticated(data.token, isRegistering)
    } catch (requestError) {
      console.error(requestError)
      setError(isRegistering ? 'No se pudo crear la cuenta.' : 'Correo o contraseña incorrectos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function changeMode() {
    setIsRegistering((current) => !current)
    setError('')
  }

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-brand"><span>F</span> FinTrack</div>
    <p>{isRegistering ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</p>
    <h1>{isRegistering ? 'Registro' : 'Iniciar sesión'}</h1>
    <form className="auth-form" onSubmit={submit}>
      {isRegistering && <label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} required /></label>}
      <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error && <div className="notice error" role="alert">{error}</div>}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Procesando...' : isRegistering ? 'Crear cuenta' : 'Ingresar'}</button>
    </form>
    <button className="auth-switch" type="button" onClick={changeMode}>{isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</button>
  </section></main>
}

export default AuthPage
