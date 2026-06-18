# APK Android (WebView)

O app Android é um **casco nativo** (Capacitor) que abre seu site na internet em tela cheia — **sem barra de endereço**, sem parecer navegador.

## 1. Configurar a URL do site

Edite `capacitor.env.json`:

```json
{
  "serverUrl": "https://SEU-SITE/",
  "allowNavigation": ["SEU-DOMINIO", "*.devtunnels.ms"]
}
```

Use a URL **com barra no final** (`/`). O app carrega o site remoto; alterações no servidor aparecem sem gerar APK de novo (desde que a URL não mude).

## 2. Pré-requisitos

- [Android Studio](https://developer.android.com/studio) (SDK + platform-tools)
- JDK 17+
- Site acessível pela internet (Docker + túnel/nginx rodando)

### Instalar no Linux (Ubuntu/Debian)

**Opção A — Snap (mais fácil):**

```bash
sudo snap install android-studio --classic
```

Depois abra uma vez pelo menu **Android Studio** para concluir o wizard e baixar o SDK.

Se o `cap open android` não achar o Studio, exporte o caminho:

```bash
export CAPACITOR_ANDROID_STUDIO_PATH=/snap/android-studio/current/bin/studio.sh
npm run android:open
```

**Opção B — Download manual:** https://developer.android.com/studio  
Extraia em `~/android-studio` e use:

```bash
export CAPACITOR_ANDROID_STUDIO_PATH=~/android-studio/bin/studio.sh
```

### Erro: `Unable to launch Android Studio`

Significa que o Studio **não está instalado** ou o Capacitor não achou o `studio.sh`. Instale pelo snap acima ou ajuste `CAPACITOR_ANDROID_STUDIO_PATH`.

### Build APK pelo terminal (sem abrir a interface)

Com o SDK já instalado (via Android Studio):

```bash
cd gym-frontend/android
./gradlew assembleDebug
```

APK em: `android/app/build/outputs/apk/debug/app-debug.apk`

## 3. Gerar / atualizar o projeto Android

```bash
cd gym-frontend
npm install
npm run android:sync
```

## 4. Abrir no Android Studio e gerar APK

```bash
npm run android:open
```

No Android Studio:

1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`

Para instalar no celular (USB com depuração):

```bash
npm run android:run
```

## 5. Túnel Dev Tunnels (importante)

### App abre o Chrome / Google em vez do site?

Isso acontece quando o túnel está **privado**. O Dev Tunnels redireciona para **login do GitHub**; o Capacitor trata isso como link externo e abre o **navegador** (Chrome — muita gente chama de “Google”).

**Solução (recomendada): deixe o túnel PÚBLICO**

No VS Code / Cursor:

1. Painel **Ports** (ou Dev Tunnels)
2. Clique com o botão direito na porta **47831**
3. **Port Visibility** → **Public**
4. Feche e abra o app no celular de novo

**Não precisa gerar APK de novo** — só mudar a visibilidade do túnel.

Teste no celular pelo Chrome normal: a URL do túnel deve abrir o **Gym Tracker**, não a tela “Sign in to GitHub”.

### Outras regras

- Se a URL do túnel mudar, atualize `capacitor.env.json` e rode `npm run android:sync`, depois gere o APK de novo
- Túnel privado + login GitHub dentro do app **não é confiável** (GitHub pode bloquear WebView)

## Scripts

| Script | O que faz |
|--------|-----------|
| `npm run android:sync` | Build mínimo + `cap sync android` |
| `npm run android:open` | Abre o projeto no Android Studio |
| `npm run android:run` | Instala e abre no dispositivo conectado |
