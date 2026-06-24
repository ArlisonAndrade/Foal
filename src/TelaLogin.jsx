import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase.js";
import { LOGOS } from "./logos.js";

const C = {
  verde:   "#142a1e",
  verde2:  "#1b3a2a",
  ouro:    "#c2a24f",
  texto:   "#16180f",
  sub:     "#7d8174",
  field:   "#f6f5ef",
  borda:   "#dcdbd1",
  vermelho:"#c0392b",
};

const Input = ({ label, type = "text", value, onChange, placeholder }) => (
  <div style={{ marginBottom: "16px" }}>
    <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase",
      color: C.sub, fontWeight: "600", marginBottom: "7px" }}>{label}</div>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", boxSizing: "border-box",
        border: `1px solid ${C.borda}`, borderRadius: "9px",
        padding: "13px 14px", fontSize: "15px", color: C.texto,
        background: C.field, outline: "none", fontFamily: "inherit",
      }}
    />
  </div>
);

const Btn = ({ children, onClick, disabled, outline }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: "100%",
    border: outline ? `1.5px solid ${C.verde2}` : "none",
    background: outline ? "transparent" : disabled ? "#cfcdc4" : C.verde2,
    color: outline ? C.verde2 : "#fff",
    borderRadius: "9px", padding: "15px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "13px", fontWeight: "700", letterSpacing: "0.12em", textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
    marginBottom: "11px",
    opacity: disabled ? 0.55 : 1,
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
  const [modo, setModo] = useState("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const alternarModo = () => {
    setModo(m => m === "login" ? "cadastro" : "login");
    setErro("");
    setNome(""); setEmail(""); setSenha(""); setConfirmar("");
  };

  const handleLogin = async () => {
    setErro("");
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
    setErro("");
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
    <div style={{
      minHeight: "100vh",
      background: C.verde,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Área verde — logo e título */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px 32px",
      }}>
        <img
          src={LOGOS.secequi}
          style={{ width: "80px", height: "80px", objectFit: "contain", marginBottom: "20px",
            filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.35))" }}
          alt="SEC EQUI"
        />

        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "46px", fontWeight: "900", color: "#fff",
          letterSpacing: "8px", marginBottom: "12px",
        }}>
          FOAL
        </div>

        {/* "— AVALIAÇÃO DA LIDERANÇA —" */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "28px", height: "1px", background: C.ouro }} />
          <div style={{
            fontSize: "9.5px", letterSpacing: "0.22em", textTransform: "uppercase",
            color: C.ouro, fontWeight: "600",
          }}>
            Avaliação da Liderança
          </div>
          <div style={{ width: "28px", height: "1px", background: C.ouro }} />
        </div>
      </div>

      {/* Card branco — formulário */}
      <div style={{
        background: "#fff",
        borderRadius: "24px 24px 0 0",
        padding: "32px 24px 40px",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase",
          color: C.sub, fontWeight: "700", marginBottom: "24px", textAlign: "center",
        }}>
          {modo === "login" ? "Acesso ao Sistema" : "Criar Conta"}
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
          <div style={{
            background: "rgba(192,57,43,0.08)", border: `1px solid ${C.vermelho}44`,
            borderRadius: "8px", padding: "10px 12px", marginBottom: "16px",
            color: C.vermelho, fontSize: "12px", textAlign: "center",
          }}>
            {erro}
          </div>
        )}

        <Btn onClick={modo === "login" ? handleLogin : handleCadastro} disabled={carregando}>
          {carregando ? "Aguarde..." : modo === "login" ? "Entrar" : "Cadastrar"}
        </Btn>
        <Btn outline onClick={alternarModo} disabled={carregando}>
          {modo === "login" ? "Criar conta" : "Já tenho conta"}
        </Btn>

        <div style={{ textAlign: "center", marginTop: "8px", fontSize: "9px", color: C.sub, letterSpacing: "0.5px" }}>
          Desenvolvido por <strong style={{ color: C.verde }}>Cap Cav Arlison Andrade do Vale</strong>
          {" "}· ESA · 2026
        </div>
      </div>
    </div>
  );
}
