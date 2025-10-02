import "@styles/auth.css";
import { h, useState, useRef } from "@tiny/core.ts";
import Button from "@components/Button.tsx";
import Icon from "@icons/Icon.tsx";
import { navigate } from "@src/router/router.ts";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const emailRef = useRef<HTMLInputElement | null>(null);

  function onSubmit(e: Event) {
    e.preventDefault();
  }

  return (
    <section class="auth-wrap">
      <div class="auth-card">
        <div class="auth-form-side">
          <h1 class="auth-title">Acesse sua conta</h1>
          <p class="auth-subtitle">Use seu e-mail e senha</p>

          <form onSubmit={onSubmit} class="auth-form">
            <div class="auth-field">
              <label for="email" class="auth-label">
                Email
              </label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">
                  <Icon name="email-variant" size={18} aria-hidden="true" />
                </span>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  class="auth-input"
                />
              </div>
            </div>

            <div class="auth-field">
              <label for="password" class="auth-label">
                Senha
              </label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">
                  <Icon name="lock-outline" size={18} aria-hidden="true" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  class="auth-input auth-input--trailing"
                />
                <button
                  type="button"
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShow((s) => !s)}
                  class="auth-ghost-icon-btn"
                >
                  <Icon
                    name={show ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <div class="auth-row-between">
              <label class="auth-checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                <span>Lembrar de mim</span>
              </label>
              <a class="link" href="#/forgot">
                Esqueceu a senha?
              </a>
            </div>

            <Button type="submit" variant="primary">
              Entrar
            </Button>

            <div class="auth-divider">
              <span class="auth-divider-line"></span>
              <span class="auth-divider-text">ou</span>
              <span class="auth-divider-line"></span>
            </div>

            <div class="auth-social-grid">
              <button type="button" class="auth-social-btn">
                <Icon name="github" size={18} aria-hidden="true" />
                <span>Entrar com GitHub</span>
              </button>
              <button type="button" class="auth-social-btn">
                <Icon name="linkedin" size={18} aria-hidden="true" />
                <span>Entrar com LinkedIn</span>
              </button>
            </div>
          </form>

          <p class="auth-small">
            Novo por aqui?{" "}
            <a
              class="link"
              href="#/register"
              onClick={(e: Event) => {
                e.preventDefault();
                navigate("#/register");
              }}
            >
              Crie sua conta
            </a>
          </p>
        </div>

        <aside class="auth-art-side" aria-hidden="true">
          <img
            src="https://images.pexels.com/photos/33966819/pexels-photo-33966819.jpeg?auto=compress&cs=tinysrgb&h=1200"
            alt=""
            class="auth-art-img"
            loading="lazy"
            decoding="async"
          />
        </aside>
      </div>
    </section>
  );
}
