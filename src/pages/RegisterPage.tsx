import "@styles/auth.css";
import { h, useState } from "@tiny/index.ts";
import Button from "@components/Button.tsx";
import Icon from "@icons/Icon.tsx";
import { navigate } from "@src/router/router.ts";

export default function RegisterPage() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  function onSubmit(e: Event) {
    e.preventDefault();
  }

  return (
    <section class="auth-wrap">
      <div class="auth-card">
        <div class="auth-form-side">
          <h1 class="auth-title">Criar conta</h1>
          <p class="auth-subtitle">Leva menos de um minuto</p>

          <form onSubmit={onSubmit} class="auth-form">
            <div class="auth-field">
              <label for="name" class="auth-label">
                Nome completo
              </label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">
                  <Icon name="account-outline" size={18} aria-hidden="true" />
                </span>
                <input
                  id="name"
                  name="name"
                  required
                  placeholder="Seu nome"
                  class="auth-input"
                />
              </div>
            </div>

            <div class="auth-field">
              <label for="email" class="auth-label">
                Email
              </label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">
                  <Icon name="email-variant" size={18} aria-hidden="true" />
                </span>
                <input
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
                  type={show1 ? "text" : "password"}
                  required
                  placeholder="Mínimo 8 caracteres"
                  class="auth-input"
                />
                <button
                  type="button"
                  aria-label={show1 ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShow1(!show1)}
                  class="auth-ghost-icon-btn"
                >
                  <Icon
                    name={show1 ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <div class="auth-field">
              <label for="confirm" class="auth-label">
                Confirmar senha
              </label>
              <div class="auth-input-wrap">
                <span class="auth-input-icon">
                  <Icon name="lock-outline" size={18} aria-hidden="true" />
                </span>
                <input
                  id="confirm"
                  name="confirm"
                  type={show2 ? "text" : "password"}
                  required
                  placeholder="Repita a senha"
                  class="auth-input"
                />
                <button
                  type="button"
                  aria-label={show2 ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShow2(!show2)}
                  class="auth-ghost-icon-btn"
                >
                  <Icon
                    name={show2 ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary">
              Criar conta
            </Button>
          </form>

          <p class="auth-small">
            Já tem conta?{" "}
            <a
              class="link"
              href="#/login"
              onClick={(e: Event) => {
                e.preventDefault();
                navigate("#/login");
              }}
            >
              Entrar
            </a>
          </p>
        </div>

        <aside class="auth-art-side" aria-hidden="true">
          <img
            src="https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&h=1200"
            alt="Pug preto adulto"
            class="auth-art-img"
            loading="lazy"
            decoding="async"
          />
        </aside>
      </div>
    </section>
  );
}
