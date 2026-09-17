import { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import { LOGOS } from "./logos.js";
import { verificarBiometria, travar } from "./biometria.js";

const C = {
  verde:    "#142a1e",
  ouro:     "#c2a24f",
  vermelho: "#c0392b",
};

const IconeRosto = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8V5a2 2 0 0 1 2-2h3" />
    <path d="M16 3h3a2 2 0 0 1 2 2v3" />
    <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
    <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
    <path d="M9.5 14.5s1 1.2 2.5 1.2 2.5-1.2 2.5-1.2" />
  </svg>
);

export default function TelaBloqueio({ user, aoDestravar }) {
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState("");
  const jaTentou = useRef(false);

  const tentar = async () => {
    setErro("");
    setVerificando(true);
    try {
      await verificarBiometria(user.uid);
      aoDestravar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setVerificando(false);
    }
  };

  // Uma tentativa automática ao abrir — é o que faz parecer "abriu e
  // entrou". O ref evita disparar duas vezes no StrictMode do React.
  useEffect(() => {
    if (jaTentou.current) return;
    jaTentou.current = true;
    tentar();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.verde, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>

      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <img src={LOGOS.secequi} style={{ width: "64px", height: "64px", objectFit: "contain",
          marginBottom: "16px", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }} alt="logo" />
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "32px", fontWeight: "900",
          color: "#fff", letterSpacing: "5px", marginBottom: "6px" }}>FOAL</div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
          <div style={{ width: "28px", height: "1px", background: C.ouro, opacity: 0.7 }} />
          <div style={{ fontSize: "9px", letterSpacing: "3px", color: C.ouro, textTransform: "uppercase",
            fontWeight: "600" }}>Sessão bloqueada</div>
          <div style={{ width: "28px", height: "1px", background: C.ouro, opacity: 0.7 }} />
        </div>
      </div>

      <div style={{ width: "76px", height: "76px", borderRadius: "22px",
        background: verificando ? "rgba(194,162,79,0.18)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${verificando ? C.ouro : "rgba(255,255,255,0.14)"}`,
        color: verificando ? C.ouro : "rgba(255,255,255,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "18px", transition: "all 0.25s ease" }}>
        <IconeRosto size={34} />
      </div>

      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>
        {verificando ? "Aproxime o rosto…" : "Confirme sua identidade"}
      </div>
      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "28px",
        textAlign: "center" }}>
        {user.displayName || user.email}
      </div>

      {erro && (
        <div style={{ width: "100%", maxWidth: "320px", background: "rgba(192,57,43,0.14)",
          border: `1px solid ${C.vermelho}55`, borderRadius: "8px", padding: "10px 12px",
          marginBottom: "18px", color: "#f0b4ac", fontSize: "12px", textAlign: "center" }}>
          {erro}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "320px" }}>
        <button onClick={tentar} disabled={verificando} style={{
          width: "100%", border: "none", background: verificando ? "rgba(255,255,255,0.12)" : C.ouro,
          color: verificando ? "rgba(255,255,255,0.5)" : C.verde,
          borderRadius: "9px", padding: "15px", fontFamily: "'Inter', sans-serif",
          fontSize: "13px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase",
          cursor: verificando ? "not-allowed" : "pointer", marginBottom: "11px",
        }}>
          {verificando ? "Verificando…" : "Entrar com o rosto"}
        </button>

        {/* Saída sempre disponível: se a biometria falhar de vez, o
            instrutor precisa conseguir voltar para o login por senha. */}
        <button onClick={() => { travar(user.uid); signOut(auth); }} style={{
          width: "100%", border: "1px solid rgba(255,255,255,0.2)", background: "transparent",
          color: "rgba(255,255,255,0.5)", borderRadius: "9px", padding: "14px",
          fontFamily: "'Inter', sans-serif", fontSize: "11px", fontWeight: "600",
          letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
        }}>
          Entrar com senha
        </button>
      </div>
    </div>
  );
}
