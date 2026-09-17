// ─────────────────────────────────────────────────────────────
// Bloqueio biométrico (WebAuthn / platform authenticator)
//
// O que isto é: um cadeado local sobre a sessão do Firebase que já
// fica persistida no aparelho. Ao abrir o app, o instrutor confirma
// com o rosto (Face ID, desbloqueio facial do Android, Windows Hello)
// em vez de redigitar a senha.
//
// O que isto NÃO é: uma fronteira de autenticação. Não há servidor
// verificando a assertion, então o desafio é gerado no próprio
// cliente. Isso protege contra o cenário real — celular desbloqueado
// na mão de outra pessoa — mas não contra alguém com devtools no
// aparelho. Quem manda de verdade continua sendo a sessão do Firebase.
//
// A biometria nunca sai do aparelho: o navegador devolve só uma
// assinatura criptográfica. Nenhum dado facial chega ao nosso código.
// ─────────────────────────────────────────────────────────────

const chaveCred    = (uid) => `foal_bio_${uid}`;
const chaveDestrav = (uid) => `foal_bio_destravado_${uid}`;

// ─── base64url ↔ ArrayBuffer ──────────────────────────────────
const paraB64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const deB64url = (str) => {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/")
    .padEnd(str.length + ((4 - (str.length % 4)) % 4), "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

const desafio = () => crypto.getRandomValues(new Uint8Array(32));

// ─── Capacidade do aparelho ──────────────────────────────────
export async function suportaBiometria() {
  if (typeof window === "undefined") return false;
  // WebAuthn exige contexto seguro; localhost conta como seguro.
  if (!window.isSecureContext) return false;
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// ─── Estado ──────────────────────────────────────────────────
export const biometriaAtiva = (uid) =>
  !!uid && !!localStorage.getItem(chaveCred(uid));

export function desativarBiometria(uid) {
  localStorage.removeItem(chaveCred(uid));
  sessionStorage.removeItem(chaveDestrav(uid));
}

// Destravado vale só enquanto a aba viver: fechar e reabrir o app
// pede o rosto de novo, recarregar a página no meio de uma avaliação não.
export const estaDestravado = (uid) =>
  !!uid && sessionStorage.getItem(chaveDestrav(uid)) === "1";

export const marcarDestravado = (uid) =>
  sessionStorage.setItem(chaveDestrav(uid), "1");

// Ao sair pela senha, a proxima entrada volta a pedir o rosto.
export const travar = (uid) => sessionStorage.removeItem(chaveDestrav(uid));

// ─── Mensagens de erro ───────────────────────────────────────
// O WebAuthn usa os mesmos nomes de erro para situações bem
// diferentes; sem esta tradução o instrutor vê "NotAllowedError".
function traduzErro(e, acao) {
  const nome = e?.name || "";
  if (nome === "NotAllowedError")
    return acao === "cadastro"
      ? "Cadastro cancelado ou expirado. Tente de novo."
      : "Não reconhecido. Use a senha ou tente de novo.";
  if (nome === "InvalidStateError")
    return "Este aparelho já tem biometria cadastrada para esta conta.";
  if (nome === "NotSupportedError")
    return "Este aparelho não oferece desbloqueio biométrico.";
  if (nome === "SecurityError")
    return "O endereço atual não permite biometria (precisa de HTTPS).";
  if (nome === "AbortError")
    return "Operação interrompida.";
  return "Falha na biometria. Use a senha.";
}

// ─── Cadastro ────────────────────────────────────────────────
export async function cadastrarBiometria(user) {
  if (!user?.uid) throw new Error("Sessão inválida.");

  try {
    // rp.id omitido de propósito: o navegador usa o domínio atual,
    // então o mesmo código funciona em localhost e em foal-app.vercel.app.
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: desafio(),
        rp: { name: "FOAL" },
        user: {
          id: new TextEncoder().encode(user.uid),
          name: user.email || user.uid,
          displayName: user.displayName || user.email || "Instrutor",
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },    // ES256
          { type: "public-key", alg: -257 },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // biometria do próprio aparelho
          userVerification: "required",        // exige rosto/digital, não só presença
          residentKey: "preferred",
        },
        attestation: "none",
        timeout: 60000,
      },
    });

    if (!cred) throw new Error("Cadastro não concluído.");

    localStorage.setItem(chaveCred(user.uid), JSON.stringify({
      id: paraB64url(cred.rawId),
      criadoEm: new Date().toISOString(),
    }));
    marcarDestravado(user.uid);
    return true;
  } catch (e) {
    throw new Error(traduzErro(e, "cadastro"));
  }
}

// ─── Verificação ─────────────────────────────────────────────
export async function verificarBiometria(uid) {
  const bruto = localStorage.getItem(chaveCred(uid));
  if (!bruto) throw new Error("Nenhuma biometria cadastrada neste aparelho.");

  let guardada;
  try {
    guardada = JSON.parse(bruto);
  } catch {
    desativarBiometria(uid);
    throw new Error("Cadastro biométrico corrompido. Refaça pelo menu.");
  }

  try {
    const assercao = await navigator.credentials.get({
      publicKey: {
        challenge: desafio(),
        allowCredentials: [{ type: "public-key", id: deB64url(guardada.id) }],
        userVerification: "required",
        timeout: 60000,
      },
    });

    if (!assercao) throw new Error("Verificação não concluída.");

    marcarDestravado(uid);
    return true;
  } catch (e) {
    throw new Error(traduzErro(e, "verificacao"));
  }
}
