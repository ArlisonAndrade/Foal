import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase.js";
import { LOGOS } from "./logos.js";

const C = {
  bg:      "#f4f1eb",
  card:    "#ffffff",
  verde:   "#1c3a1c",
  ouro:    "#c9a84c",
  texto:   "#1a1a1a",
  sub:     "#9a9a8a",
  borda:   "#ece9e2",
  vermelho:"#c0392b",
};

const Input = ({ label, type = "text", value, onChange, placeholder }) => (
  <div style={{ marginBottom: "16px" }}>
    <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
      color: C.ouro, fontWeight: "700", marginBottom: "6px" }}>{label}</div>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        border: `1.5px solid ${C.borda}`, borderRadius: "10px",
        padding: "13px 14px", fontSize: "15px", color: C.texto,
        background: "#fff", outline: "none", fontFamily: "inherit",
      }}
    />
  </div>
);

const Btn = ({ children, onClick, disabled, outline }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: "100%", border: outline ? `2px solid ${C.verde}` : "none",
    background: outline ? "transparent" : disabled ? "#ccc" : C.verde,
    color: outline ? C.verde : "#fff",
    borderRadius: "14px", padding: "16px",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "17px", fontWeight: "700", letterSpacing: "1.5px",
    cursor: disabled ? "not-allowed" : "pointer",
    marginBottom: "12px",
    boxShadow: outline || disabled ? "none" : `0 3px 12px ${C.verde}44`,
    opacity: disabled ? 0.6 : 1,
  }}>{children}</button>
);

const msgErro = (code) => {
  const map = {
    "auth/email-already-in-use": "E-mail já cadastrado. Faça login.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "Senha fraca. Use ao menos 6 caracteres.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde e tente novamente.",
  };
  return map[code] || "Ocorreu um erro. Tente novamente.";
};

export default function TelaLogin() {
  const [modo, setModo] = useState("login"); // login | cadastro
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const limpar = () => { setErro(""); };

  const alternarModo = () => {
    setModo(m => m === "login" ? "cadastro" : "login");
    setErro("");
    setNome(""); setEmail(""); setSenha(""); setConfirmar("");
  };

  const handleLogin = async () => {
    limpar();
    if (!email || !senha) { setErro("Preencha e-mail e senha."); return; }
    setCarregando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);
    } catch (e) {
      setErro(msgErro(e.code));
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async () => {
    limpar();
    if (!nome || !email || !senha || !confirmar) { setErro("Preencha todos os campos."); return; }
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    if (senha.length < 6) { setErro("Senha fraca. Use ao menos 6 caracteres."); return; }
    setCarregando(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      await updateProfile(cred.user, { displayName: nome.trim() });
    } catch (e) {
      setErro(msgErro(e.code));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: C.verde }}>
        <div style={{ background: `linear-gradient(90deg,${C.ouro}99,${C.ouro},${C.ouro}99)`, height: "3px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}>
          <img src={LOGOS.secequi} style={{ width: "34px", height: "34px", objectFit: "contain" }} alt="logo" />
          <div>
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: C.ouro, textTransform: "uppercase" }}>
              Seção de Equitação · ESA
            </div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: "900", color: "#fff" }}>
              FOAL
            </div>
          </div>
        </div>
      </div>

      {/* Corpo */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        padding: "40px 24px 24px" }}>

        <img src={LOGOS.secequi} style={{ width: "80px", height: "80px", objectFit: "contain",
          marginBottom: "12px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))" }} alt="logo" />

        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", fontWeight: "900",
          color: C.verde, letterSpacing: "3px", marginBottom: "4px" }}>FOAL</div>

        <div style={{ fontSize: "11px", color: C.sub, letterSpacing: "1px", textAlign: "center",
          lineHeight: "1.7", marginBottom: "4px" }}>
          Ferramenta de Observação e<br />Avaliação da <span style={{ color: C.ouro, fontWeight: "600" }}>Liderança</span>
        </div>

        <div style={{ width: "40px", height: "2px", background: `linear-gradient(90deg,${C.ouro},${C.verde})`,
          borderRadius: "2px", margin: "16px 0 28px" }} />

        {/* Card de auth */}
        <div style={{ width: "100%", maxWidth: "400px", background: C.card, borderRadius: "16px",
          padding: "24px", border: `1.5px solid ${C.borda}`, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>

          <div style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase",
            color: C.ouro, fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
            {modo === "login" ? "ACESSO AO SISTEMA" : "CRIAR CONTA"}
          </div>

          {modo === "cadastro" && (
            <Input label="Nome completo" value={nome} onChange={setNome} placeholder="Seu nome" />
          )}
          <Input label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" />
          <Input label="Senha" type="password" value={senha} onChange={setSenha} placeholder="••••••" />
          {modo === "cadastro" && (
            <Input label="Confirmar senha" type="password" value={confirmar}
              onChange={setConfirmar} placeholder="••••••" />
          )}

          {erro && (
            <div style={{ background: "rgba(192,57,43,0.08)", border: `1px solid ${C.vermelho}44`,
              borderRadius: "8px", padding: "10px 12px", marginBottom: "16px",
              color: C.vermelho, fontSize: "12px", textAlign: "center" }}>
              {erro}
            </div>
          )}

          <Btn onClick={modo === "login" ? handleLogin : handleCadastro} disabled={carregando}>
            {carregando ? "Aguarde..." : modo === "login" ? "ENTRAR" : "CADASTRAR"}
          </Btn>
          <Btn outline onClick={alternarModo} disabled={carregando}>
            {modo === "login" ? "Criar conta" : "Já tenho conta"}
          </Btn>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.borda}`, padding: "12px 16px", textAlign: "center",
        fontSize: "9px", color: C.sub, letterSpacing: "0.5px" }}>
        Desenvolvido por <strong style={{ color: C.verde }}>Cap Cav Arlison Andrade do Vale</strong>
        {" "}· Seção de Equitação · ESA · 2026
      </div>
    </div>
  );
}
