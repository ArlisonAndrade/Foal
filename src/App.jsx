import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import { useAuth } from "./AuthContext.jsx";
import TelaLogin from "./TelaLogin.jsx";
import { LOGOS } from "./logos.js";
import { CURSOS, ATLETAS } from "./dados.js";
import {
  CENARIOS_CFGS, CENARIOS_ATLETAS,
  ATRIBUTOS_CFGS, ATRIBUTOS_ATLETAS,
  calcularNota, aplicarFO, getMencao, getCorMencao,
} from "./cenarios.js";

// ─── CONSTANTES ──────────────────────────────────────────────
const PIN_ADMIN = "2311";

const C = {
  bg:      "#f4f1eb",
  card:    "#ffffff",
  verde:   "#1c3a1c",
  ouro:    "#c9a84c",
  texto:   "#1a1a1a",
  sub:     "#9a9a8a",
  borda:   "#ece9e2",
  vermelho:"#c0392b",
  azul:    "#2980b9",
  laranja: "#e67e22",
};

// ─── COMPONENTES BASE ─────────────────────────────────────────
const Btn = ({ children, onClick, cor = C.verde, outline, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: "100%", border: outline ? `2px solid ${cor}` : "none",
    background: outline ? "transparent" : disabled ? "#ccc" : cor,
    color: outline ? cor : "#fff",
    borderRadius: "14px", padding: "16px",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "17px", fontWeight: "700", letterSpacing: "1.5px",
    cursor: disabled ? "not-allowed" : "pointer",
    marginBottom: "12px", display: "flex",
    alignItems: "center", justifyContent: "center", gap: "10px",
    boxShadow: outline || disabled ? "none" : `0 3px 12px ${cor}44`,
    opacity: disabled ? 0.6 : 1,
    ...style,
  }}>{children}</button>
);

const Card = ({ children, style, bordaEsq, onClick }) => (
  <div onClick={onClick} style={{
    background: C.card, borderRadius: "14px", padding: "15px 16px",
    border: `1.5px solid ${C.borda}`,
    borderLeft: bordaEsq ? `4px solid ${bordaEsq}` : undefined,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: "10px",
    cursor: onClick ? "pointer" : undefined,
    ...style,
  }}>{children}</div>
);

const Header = ({ titulo, subtitulo, onVoltar, tipo = "CFGS" }) => (
  <div style={{ background: C.verde, flexShrink: 0 }}>
    <div style={{ background: `linear-gradient(90deg,${C.ouro}99,${C.ouro},${C.ouro}99)`, height: "3px" }} />
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px" }}>
      {onVoltar && (
        <button onClick={onVoltar} style={{
          background: "rgba(255,255,255,0.15)", border: "none", color: C.ouro,
          borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontSize: "18px",
        }}>‹</button>
      )}
      <img src={tipo === "ATLETAS" ? LOGOS.atletas : LOGOS.secequi}
        style={{ width: "34px", height: "34px", objectFit: "contain" }} alt="logo" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "9px", letterSpacing: "2px", color: C.ouro, textTransform: "uppercase" }}>
          {tipo === "ATLETAS" ? "Equipe de Salto · ESA" : "Seção de Equitação · ESA"}
        </div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: "900", color: "#fff" }}>
          {titulo}
        </div>
        {subtitulo && <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)", marginTop: "1px" }}>{subtitulo}</div>}
      </div>
    </div>
  </div>
);

const Footer = () => (
  <div style={{
    borderTop: `1px solid ${C.borda}`, padding: "12px 16px", textAlign: "center",
    fontSize: "9px", color: C.sub, letterSpacing: "0.5px", flexShrink: 0,
  }}>
    Desenvolvido por <strong style={{ color: C.verde }}>Cap Cav Arlison Andrade do Vale</strong>
    {" "}· Seção de Equitação · ESA · 2026
  </div>
);

const Wrap = ({ children, style }) => (
  <div style={{ flex: 1, overflowY: "auto", padding: "32px 16px 24px", ...style }}>{children}</div>
);

const SecLabel = ({ children }) => (
  <div style={{ fontSize: "9px", letterSpacing: "3px", textTransform: "uppercase",
    color: C.ouro, fontWeight: "700", marginBottom: "12px" }}>{children}</div>
);

// ─── CHIP STATUS ─────────────────────────────────────────────
const Chip = ({ status }) => {
  const map = {
    avaliado:     { bg: "rgba(39,174,96,.12)",  color: "#1e8449", label: "✓ Avaliado" },
    andamento:    { bg: "rgba(243,156,18,.12)", color: "#b7770d", label: "⏳ Andamento" },
    nao_realizou: { bg: "rgba(192,57,43,.10)",  color: "#922b21", label: "✗ Não realizou" },
    pendente:     { bg: "transparent",          color: C.sub,     label: "Avaliar →" },
  };
  const s = map[status] || map.pendente;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 9px",
      borderRadius: "20px", fontSize: "10px", fontWeight: "600" }}>{s.label}</span>
  );
};

// ─── ESTADO INICIAL ───────────────────────────────────────────
const alunoVazio = () => ({
  status: "pendente",
  respostas: {},
  fos: {},
  fosDesc: {},
  observacoes: "",
});

const appInicial = () => ({
  tela: "home",
  perfil: null,
  pinDigitado: "",
  pinErro: false,
  modo: "CFGS",       // CFGS | ATLETAS
  curso: "",
  turma: "",
  qtdGrupamentos: 3,
  grupamentos: null,  // { A: [...], B: [...], C: [...] }
  grupamentoSel: "",
  alunos: {},
  alunoAtual: "",
  cenarioIdx: 0,
  ndacaAberto: false,
  foTela: false,
  resultadoAtual: null,
  enviando: false,
  erroEnvio: null,
  turmasEnviadas: JSON.parse(localStorage.getItem("foal_enviadas") || "{}"),
  instrutor: localStorage.getItem("foal_instrutor") || "",
});

export default function App() {
  const { user } = useAuth();

  if (user === undefined) return (
    <div style={{ minHeight: "100vh", background: "#f4f1eb", display: "flex",
      alignItems: "center", justifyContent: "center", color: "#9a9a8a", fontSize: "14px" }}>
      Carregando...
    </div>
  );

  // Sempre mostra o app — a home não exige autenticação
  return <AppAutenticado />;
}

function AppAutenticado() {
  const { user } = useAuth();
  const [s, setS] = useState(appInicial());

  const set = (updates) => setS(prev => ({ ...prev, ...updates }));
  const ir = (tela, extra = {}) => set({ tela, ...extra });

  // Após login via tela de avaliador, decide próximo passo
  useEffect(() => {
    if (user && s.tela === "aguardando_login") {
      const instrutorSalvo = localStorage.getItem("foal_instrutor");
      if (instrutorSalvo) {
        set({ instrutor: instrutorSalvo, perfil: "avaliador", tela: "cursos" });
      } else {
        set({ perfil: "avaliador", tela: "instrutor" });
      }
    }
  }, [user, s.tela]);

  const cenarios = s.modo === "ATLETAS" ? CENARIOS_ATLETAS : CENARIOS_CFGS;
  const atributos = s.modo === "ATLETAS" ? ATRIBUTOS_ATLETAS : ATRIBUTOS_CFGS;
  const cenario = cenarios[s.cenarioIdx];

  const listagem = s.grupamentoSel && s.grupamentos
    ? s.grupamentos[s.grupamentoSel] || []
    : s.modo === "ATLETAS"
    ? ATLETAS
    : [];

  const qtdAv   = Object.values(s.alunos).filter(a => a.status === "avaliado").length;
  const qtdAnd  = Object.values(s.alunos).filter(a => a.status === "andamento").length;
  const qtdNR   = Object.values(s.alunos).filter(a => a.status === "nao_realizou").length;
  const qtdPend = listagem.length - qtdAv - qtdAnd - qtdNR;
  const todosConcluidos = listagem.length > 0 && qtdPend === 0 && qtdAnd === 0;

  // ── HOME ──────────────────────────────────────────────────
  if (s.tela === "home") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Header titulo="FOAL" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 0" }}>
        <img src={LOGOS.secequi} style={{ width: "110px", height: "110px", objectFit: "contain", marginBottom: "16px",
          filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.15))" }} alt="SEC EQUI" />
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "38px", fontWeight: "900",
          color: C.verde, letterSpacing: "4px", marginBottom: "4px" }}>FOAL</div>
        <div style={{ fontSize: "11px", color: C.sub, letterSpacing: "1px", textAlign: "center", lineHeight: "1.7", marginBottom: "8px" }}>
          Ferramenta de Observação e<br />Avaliação da <span style={{ color: C.ouro, fontWeight: "600" }}>Liderança</span>
        </div>
        <div style={{ width: "56px", height: "2px", background: `linear-gradient(90deg,${C.ouro},${C.verde})`,
          borderRadius: "2px", margin: "20px 0 32px" }} />
        <div style={{ width: "100%" }}>
          <Btn onClick={() => ir("pin")}>🔐&nbsp; ADMINISTRADOR</Btn>
          <Btn outline cor={C.verde} onClick={() => {
            if (!user) { ir("aguardando_login"); return; }
            const instrutorSalvo = localStorage.getItem("foal_instrutor");
            if (instrutorSalvo) {
              set({ instrutor: instrutorSalvo, perfil: "avaliador", tela: "cursos" });
            } else {
              ir("instrutor", { perfil: "avaliador" });
            }
          }} style={{ marginBottom: 0 }}>
            📋&nbsp; AVALIADOR
          </Btn>
        </div>
        {user && (
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: C.sub, marginBottom: "8px" }}>
              {user.displayName || user.email}
            </div>
            <button onClick={() => signOut(auth)} style={{
              background: "none", border: `1px solid ${C.borda}`, borderRadius: "8px",
              padding: "6px 16px", fontSize: "11px", color: C.sub, cursor: "pointer",
              letterSpacing: "1px",
            }}>
              Sair
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );

  // ── AGUARDANDO LOGIN (avaliador sem conta) ───────────────
  if (s.tela === "aguardando_login") return <TelaLogin />;

  // ── PIN ───────────────────────────────────────────────────
  if (s.tela === "pin") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Header titulo="Administrador" subtitulo="Acesso restrito" onVoltar={() => ir("home")} />
      <Wrap style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "32px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔐</div>
        <div style={{ fontSize: "16px", fontWeight: "600", color: C.verde, marginBottom: "4px" }}>Digite o PIN</div>
        <div style={{ fontSize: "12px", color: C.sub, marginBottom: "24px" }}>Acesso exclusivo do administrador</div>
        <div style={{ display: "flex", gap: "14px", marginBottom: "28px" }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: "18px", height: "18px", borderRadius: "50%",
              background: i < s.pinDigitado.length ? C.verde : "transparent",
              border: `2px solid ${i < s.pinDigitado.length ? C.verde : "#ccc"}`,
            }} />
          ))}
        </div>
        {s.pinErro && <div style={{ color: C.vermelho, fontSize: "12px", marginBottom: "16px" }}>PIN incorreto. Tente novamente.</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", width: "100%" }}>
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((n, i) => (
            <button key={i} onClick={() => {
              if (!n) return;
              if (n === "⌫") { set({ pinDigitado: s.pinDigitado.slice(0,-1), pinErro: false }); return; }
              const novo = s.pinDigitado + n;
              if (novo.length === 4) {
                // CORREÇÃO: ADM vai direto pro painel sem pedir nome
                if (novo === PIN_ADMIN) set({ instrutor: "Cap Arlison", perfil: "admin", pinDigitado: "", tela: "dashboard_adm" });
                else set({ pinDigitado: "", pinErro: true });
              } else set({ pinDigitado: novo, pinErro: false });
            }} style={{
              background: n ? C.card : "transparent",
              border: n ? `1.5px solid ${C.borda}` : "none",
              borderRadius: "14px", padding: "16px",
              fontSize: n === "⌫" ? "16px" : "22px", fontWeight: "600",
              color: n === "⌫" ? C.ouro : C.texto, cursor: n ? "pointer" : "default",
              boxShadow: n ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
            }}>{n}</button>
          ))}
        </div>
      </Wrap>
      <Footer />
    </div>
  );

  // ── INSTRUTOR (Apenas para Avaliador Comum) ──────────────
  if (s.tela === "instrutor") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Header titulo="Avaliador" subtitulo="Identificação" onVoltar={() => ir("home")} />
      <Wrap style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "32px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>👤</div>
        <div style={{ fontSize: "16px", fontWeight: "600", color: C.verde, marginBottom: "4px" }}>
          Qual é o seu nome?
        </div>
        <div style={{ fontSize: "12px", color: C.sub, marginBottom: "28px", textAlign: "center" }}>
          Será registrado junto às avaliações
        </div>
        <input
          value={s.instrutor}
          onChange={e => set({ instrutor: e.target.value })}
          placeholder="Digite seu nome completo"
          style={{ width: "100%", background: C.card, border: `1.5px solid ${C.borda}`, borderRadius: "12px", padding: "14px 16px", fontSize: "16px", color: C.texto, boxSizing: "border-box", marginBottom: "24px", fontFamily: "Inter, sans-serif", outline: "none" }}
          autoFocus
        />
        <Btn disabled={!s.instrutor.trim()} onClick={() => {
          localStorage.setItem("foal_instrutor", s.instrutor.trim());
          ir("cursos");
        }}>
          Continuar →
        </Btn>
      </Wrap>
      <Footer />
    </div>
  );

  // ── DASHBOARD ADM ─────────────────────────────────────────
  if (s.tela === "dashboard_adm") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header titulo="Painel de Controle" subtitulo="Administrador" onVoltar={() => set(appInicial())} />
        <Wrap style={{ paddingTop: "24px" }}>
          <div style={{ marginBottom: "24px", padding: "16px", background: C.card, borderRadius: "12px", borderLeft: `4px solid ${C.ouro}` }}>
            <div style={{ fontSize: "14px", color: C.sub }}>Bem-vindo de volta,</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", fontWeight: "900", color: C.texto }}>Olá, Cap Arlison!</div>
          </div>
          <div style={{ fontSize: "13px", color: C.sub, marginBottom: "12px", fontWeight: "600" }}>SELECIONE O CURSO / ARMA</div>
          {Object.entries(CURSOS).map(([nome, dados]) => (
            <Card key={nome} style={{ marginBottom: "10px", cursor: "pointer" }} onClick={() => set({ curso: nome, tela: "montar_grupamento", grupoAtual: "Grupamento A" })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={LOGOS[dados.logoKey]} style={{ width: "30px", height: "30px", objectFit: "contain" }} alt={nome} />
                  <span style={{ fontWeight: "700", color: C.texto }}>{dados.nome || nome}</span>
                </div>
                <span style={{ fontSize: "12px", color: C.ouro }}>Montar Grupos →</span>
              </div>
            </Card>
          ))}
          <Btn outline cor={C.vermelho} onClick={() => set(appInicial())} style={{ marginTop: "32px" }}>Sair do Painel</Btn>
        </Wrap>
        <Footer />
      </div>
    );
  }

  // ── TELA DE MONTAGEM DE GRUPAMENTOS (ADM) ──────────────────
  if (s.tela === "montar_grupamento") {
    const todasTurmas = CURSOS[s.curso]?.turmas || {};
    const todosAlunosDoCurso = Object.values(todasTurmas).flat().sort();
    
    const objGrupamentos = s.grupamentos || JSON.parse(localStorage.getItem("foal_grupamentos") || "{}");
    const alunosJaAlocados = Object.entries(objGrupamentos[s.curso] || {})
      .filter(([nomeGrupo]) => nomeGrupo !== s.grupoAtual)
      .reduce((acc, [, lista]) => [...acc, ...lista], []);

    const alunosDoGrupoAtual = objGrupamentos[s.curso]?.[s.grupoAtual] || [];

    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header titulo={`Configurar ${s.curso}`} subtitulo={s.grupoAtual} onVoltar={() => ir("dashboard_adm")} />
        <Wrap style={{ paddingTop: "16px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {["Grupamento A", "Grupamento B", "Grupamento C", "Grupamento D"].map(g => {
              const ativo = s.grupoAtual === g;
              return (
                <button key={g} onClick={() => set({ grupoAtual: g })} style={{
                  flex: 1, padding: "8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700",
                  background: ativo ? C.verde : C.card, color: ativo ? "#fff" : C.sub, border: "none"
                }}>{g.replace("Grupamento ", "")}</button>
              );
            })}
          </div>
          <div style={{ fontSize: "12px", color: C.sub, marginBottom: "12px" }}>Selecione os alunos do <strong>{s.grupoAtual}</strong>:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "50vh", overflowY: "auto", marginBottom: "20px" }}>
            {todosAlunosDoCurso.map(nome => {
              if (alunosJaAlocados.includes(nome)) return null; 
              const selecionado = alunosDoGrupoAtual.includes(nome);
              return (
                <div key={nome} onClick={() => {
                  let novaLista = [...alunosDoGrupoAtual];
                  if (selecionado) novaLista = novaLista.filter(n => n !== nome);
                  else novaLista.push(nome);
                  
                  const novos = { ...objGrupamentos, [s.curso]: { ...objGrupamentos[s.curso], [s.grupoAtual]: novaLista } };
                  localStorage.setItem("foal_grupamentos", JSON.stringify(novos));
                  set({ grupamentos: novos });
                }} style={{
                  padding: "12px", background: selecionado ? "rgba(39,174,96,.1)" : C.card,
                  border: `1px solid ${selecionado ? C.verde : C.borda}`, borderRadius: "10px",
                  display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"
                }}>
                  <span style={{ fontSize: "13px", color: C.texto, fontWeight: selecionado ? "700" : "500" }}>{nome}</span>
                  <span style={{ color: selecionado ? C.verde : C.sub }}>{selecionado ? "●" : "○"}</span>
                </div>
              );
            })}
          </div>
          <Btn cor={C.verde} onClick={() => ir("dashboard_adm")}>✓ Salvar Alterações</Btn>
        </Wrap>
      </div>
    );
  }

  // ── CURSOS (Para o Avaliador Comum) ──────────────────────
  if (s.tela === "cursos") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Header titulo="Selecione" subtitulo="Perfil: Avaliador" onVoltar={() => set(appInicial())} />
      <Wrap>
        {/* ATLETAS */}
        <SecLabel>Equipe de Salto</SecLabel>
        <div onClick={() => ir("atletas_lista", { modo: "ATLETAS", alunos: Object.fromEntries(ATLETAS.map(n => [n, s.alunos[n] || alunoVazio()])) })}
          style={{ background: C.card, borderRadius: "14px", padding: "15px 16px", border: `1.5px solid ${C.borda}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
          <img src={LOGOS.atletas} style={{ width: "44px", height: "44px", objectFit: "contain" }} alt="atletas" />
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: C.texto }}>ATLETAS</div>
            <div style={{ fontSize: "11px", color: C.sub }}>8 atletas · Viagem de Competição</div>
          </div>
          <div style={{ marginLeft: "auto", color: C.ouro, fontSize: "20px" }}>›</div>
        </div>

        {/* CURSOS CFGS */}
        <SecLabel>Cursos — CFGS</SecLabel>
        {Object.entries(CURSOS).map(([nome, dados]) => {
          const ativo = dados.ativo && Object.keys(dados.turmas).length > 0;
          return (
            <div key={nome} onClick={() => {
              if (!ativo) return;
              const objGrupamentos = s.grupamentos || JSON.parse(localStorage.getItem("foal_grupamentos") || "{}");
              const gruposDesseCurso = objGrupamentos[nome] || {};
              const temGruposValidos = Object.values(gruposDesseCurso).some(lista => lista.length > 0);

              if (temGruposValidos) {
                ir("escolher_grupamento", { curso: nome, modo: "CFGS" });
              } else {
                alert(`Nenhum grupamento montado para a ${nome}.\nO sistema carregará as turmas completas.`);
                ir("turmas", { curso: nome, modo: "CFGS" });
              }
            }}
              style={{ background: C.card, borderRadius: "14px", padding: "15px 16px", border: `1.5px solid ${ativo ? C.borda : "#f0ede8"}`,
                boxShadow: ativo ? "0 2px 8px rgba(0,0,0,0.06)" : "none", marginBottom: "10px", display: "flex", alignItems: "center", gap: "14px",
                cursor: ativo ? "pointer" : "not-allowed", opacity: ativo ? 1 : 0.38 }}>
              <img src={LOGOS[dados.logoKey]} style={{ width: "44px", height: "44px", objectFit: "contain" }} alt={nome} />
              <div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: C.texto }}>{dados.nome || nome}</div>
                <div style={{ fontSize: "11px", color: C.sub }}>{ativo ? "Acessar Avaliação" : "Indisponível"}</div>
              </div>
              {ativo && <div style={{ marginLeft: "auto", color: C.ouro, fontSize: "20px" }}>›</div>}
            </div>
          );
        })}
      </Wrap>
      <Footer />
    </div>
  );

  // ── ESCOLHER GRUPAMENTO (Se existirem grupos criados) ────
  if (s.tela === "escolher_grupamento") {
    const objGrupamentos = s.grupamentos || JSON.parse(localStorage.getItem("foal_grupamentos") || "{}");
    const gruposDesseCurso = objGrupamentos[s.curso] || {};
    
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header titulo="Selecione o Grupo" subtitulo={s.curso} onVoltar={() => ir("cursos")} />
        <Wrap style={{ paddingTop: "24px" }}>
          <div style={{ fontSize: "13px", color: C.sub, marginBottom: "16px" }}>Grupos montados pelo Administrador:</div>
          {Object.entries(gruposDesseCurso).map(([nomeGrupo, listaAlunos]) => {
            if (!listaAlunos || listaAlunos.length === 0) return null;
            return (
              <Card key={nomeGrupo} style={{ marginBottom: "10px", cursor: "pointer" }} onClick={() => {
                // Ao clicar, converte a lista de nomes do grupo no formato que a tela de alunos entende
                const alunosPreparados = Object.fromEntries(listaAlunos.map(n => [n, s.alunos[n] || alunoVazio()]));
                ir("alunos", { grupamentoSel: nomeGrupo, alunos: alunosPreparados });
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "700", color: C.texto }}>{nomeGrupo}</div>
                    <div style={{ fontSize: "11px", color: C.sub }}>{listaAlunos.length} aluno(s)</div>
                  </div>
                  <div style={{ color: C.ouro, fontSize: "20px" }}>›</div>
                </div>
              </Card>
            );
          })}
          <Btn outline cor={C.sub} onClick={() => ir("turmas", { modo: "CFGS" })} style={{ marginTop: "24px" }}>
            Ignorar grupos e ver Turmas Completas
          </Btn>
        </Wrap>
        <Footer />
      </div>
    );
  }

  // ── TURMAS ────────────────────────────────────────────────
  if (s.tela === "turmas") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Header titulo={`Turmas — ${s.curso}`} onVoltar={() => ir("cursos")} />
      <Wrap>
        <SecLabel>Selecione a turma</SecLabel>
        {Object.entries(CURSOS[s.curso]?.turmas || {}).map(([nomeTurma, alns]) => {
          const chave = `${s.curso}_${nomeTurma}`;
          const enviada = !!s.turmasEnviadas[chave];
          return (
            <Card key={nomeTurma} style={{ cursor: "pointer" }} onClick={() => {
              if (enviada && !confirm(`A turma ${nomeTurma} já foi enviada. Deseja realizar nova avaliação?`)) return;
              // Monta lista de todos os alunos da turma
              const alns = CURSOS[s.curso]?.turmas[nomeTurma] || [];
              const alunosInicial = {};
              alns.forEach(n => { alunosInicial[n] = alunoVazio(); });
              ir("alunos", { turma: nomeTurma, alunos: alunosInicial, grupamentos: null, grupamentoSel: "" });
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ width: "40px", height: "40px", background: C.verde, borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Playfair Display',serif", fontWeight: "900", fontSize: "14px", color: "#fff",
                  marginRight: "12px", flexShrink: 0 }}>
                  {nomeTurma.split("-").pop()}
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: C.texto }}>{nomeTurma}</div>
                  <div style={{ fontSize: "11px", color: C.sub }}>{alns.length} alunos
                    {enviada && <span style={{ color: "#27ae60", marginLeft: "8px" }}>· ✓ Enviada</span>}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", color: enviada ? "#27ae60" : C.ouro, fontSize: "20px" }}>
                  {enviada ? "✓" : "›"}
                </div>
              </div>
            </Card>
          );
        })}
      </Wrap>
      <Footer />
    </div>
  );

  // ── GRUPAMENTOS (só admin) ────────────────────────────────
  if (s.tela === "grupamentos") {
    const alnsTotal = CURSOS[s.curso]?.turmas[s.turma] || [];
    const tamanho = Math.ceil(alnsTotal.length / s.qtdGrupamentos);
    const letras = ["A","B","C","D"].slice(0, s.qtdGrupamentos);
    const grps = Object.fromEntries(letras.map((l, i) => [l, alnsTotal.slice(i * tamanho, (i+1) * tamanho)]));

    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header titulo="Grupamentos" subtitulo={`${s.curso} · ${s.turma} · ${alnsTotal.length} alunos`} onVoltar={() => ir("turmas")} />
        <Wrap>
          {s.perfil === "admin" ? (
            <>
              <SecLabel>Quantos grupamentos?</SecLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "24px" }}>
                {[2,3,4].map(n => (
                  <div key={n} onClick={() => set({ qtdGrupamentos: n })}
                    style={{ background: s.qtdGrupamentos === n ? `${C.verde}15` : C.card,
                      border: `2px solid ${s.qtdGrupamentos === n ? C.verde : C.borda}`,
                      borderRadius: "14px", padding: "16px", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px",
                      fontWeight: "900", color: C.verde }}>{n}</div>
                    <div style={{ fontSize: "11px", color: C.sub, marginTop: "2px" }}>
                      ~{Math.ceil(alnsTotal.length / n)} alunos
                    </div>
                  </div>
                ))}
              </div>
              <SecLabel>Prévia dos grupamentos</SecLabel>
              {letras.map((l, i) => {
                const grpAlns = alnsTotal.slice(i * tamanho, (i+1) * tamanho);
                const cores = ["#1c3a1c","#c9a84c","#8B4513","#1A3A5C"];
                return (
                  <Card key={l} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", background: cores[i], borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Playfair Display',serif", fontWeight: "900", fontSize: "20px", color: "#fff" }}>{l}</div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: C.texto }}>Grupamento {l}</div>
                        <div style={{ fontSize: "11px", color: C.sub }}>{grpAlns.length} alunos</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              <div style={{ marginTop: "16px" }}>
                <Btn onClick={() => {
                  const alunosInicial = {};
                  Object.values(grps).flat().forEach(n => { alunosInicial[n] = alunoVazio(); });
                  ir("alunos", { grupamentos: grps, alunos: alunosInicial });
                }}>🔒 Confirmar e Iniciar</Btn>
              </div>
            </>
          ) : (
            <>
              <SecLabel>Selecione seu grupamento</SecLabel>
              <div style={{ background: "rgba(201,168,76,.1)", border: `1px solid ${C.ouro}44`,
                borderRadius: "12px", padding: "14px", marginBottom: "16px", fontSize: "12px", color: "#7a6a3a" }}>
                ℹ️ Os grupamentos são criados pelo administrador. Selecione o seu.
              </div>
              {letras.map((l, i) => {
                const cores = ["#1c3a1c","#c9a84c","#8B4513","#1A3A5C"];
                const grpAlns = alnsTotal.slice(i * tamanho, (i+1) * tamanho);
                return (
                  <Card key={l} style={{ cursor: "pointer" }} onClick={() => {
                    const alunosInicial = {};
                    grpAlns.forEach(n => { alunosInicial[n] = s.alunos[n] || alunoVazio(); });
                    ir("alunos", { grupamentos: grps, grupamentoSel: l, alunos: alunosInicial });
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", background: cores[i], borderRadius: "10px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Playfair Display',serif", fontWeight: "900", fontSize: "20px", color: "#fff" }}>{l}</div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: C.texto }}>Grupamento {l}</div>
                        <div style={{ fontSize: "11px", color: C.sub }}>{grpAlns.length} alunos</div>
                      </div>
                      <div style={{ marginLeft: "auto", color: C.ouro, fontSize: "20px" }}>›</div>
                    </div>
                  </Card>
                );
              })}
            </>
          )}
        </Wrap>
        <Footer />
      </div>
    );
  }

  // ── LISTA ATLETAS ─────────────────────────────────────────
  if (s.tela === "atletas_lista") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Header titulo="Equipe de Salto" subtitulo="Viagem de Competição" onVoltar={() => ir("cursos")} tipo="ATLETAS" />
      <Wrap>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px" }}>
          {[["#27ae60",qtdAv,"Aval."],[C.ouro,qtdAnd,"Andam."],[C.sub,qtdPend,"Pend."],[C.vermelho,qtdNR,"NR"]].map(([cor,n,l]) => (
            <div key={l} style={{ background: C.card, borderRadius: "10px", padding: "10px 6px",
              textAlign: "center", border: `1.5px solid ${C.borda}` }}>
              <div style={{ fontSize: "20px", fontWeight: "700", color: cor }}>{n}</div>
              <div style={{ fontSize: "9px", color: C.sub }}>{l}</div>
            </div>
          ))}
        </div>
        {ATLETAS.map(nome => {
          const dados = s.alunos[nome] || alunoVazio();
          return (
            <div key={nome} onClick={() => ir("status_aluno", { alunoAtual: nome, cenarioIdx: 0 })}
              style={{ background: dados.status === "avaliado" ? "rgba(39,174,96,.06)"
                : dados.status === "andamento" ? "rgba(243,156,18,.06)"
                : dados.status === "nao_realizou" ? "rgba(192,57,43,.06)" : C.card,
                border: `1.5px solid ${dados.status === "avaliado" ? "#27ae60"
                  : dados.status === "andamento" ? C.ouro
                  : dados.status === "nao_realizou" ? C.vermelho : C.borda}`,
                borderRadius: "12px", padding: "13px 15px", marginBottom: "8px",
                display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "13px", fontWeight: "500", color: C.texto }}>{nome}</span>
              <Chip status={dados.status} />
            </div>
          );
        })}
     </Wrap>
      {/* O botão agora fica visível de qualquer jeito para permitir o avanço */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.borda}`, background: C.bg }}>
        <Btn cor="#27ae60" onClick={() => ir("confirmar_envio")} style={{ marginBottom: 0 }}>
          Enviar Avaliações →
        </Btn>
      </div>
      <Footer />
    </div>
  );

  // ── LISTA ALUNOS (CFGS) ───────────────────────────────────
  if (s.tela === "alunos") {
    const alunosLista = s.grupamentoSel && s.grupamentos
      ? s.grupamentos[s.grupamentoSel] || []
      : Object.keys(s.alunos).filter(n => n !== "__meta__");

    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", paddingBottom: todosConcluidos ? "80px" : "0" }}>
        <Header titulo={s.grupamentoSel ? s.grupamentoSel : s.turma}
          subtitulo={`${s.curso} · ${s.instrutor || ""}`}
          onVoltar={() => s.grupamentoSel ? ir("escolher_grupamento") : ir("turmas")} />
        
        <Wrap>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px" }}>
            {[["#27ae60",qtdAv,"Aval."],[C.ouro,qtdAnd,"Andam."],[C.sub,qtdPend,"Pend."],[C.vermelho,qtdNR,"NR"]].map(([cor,n,l]) => (
              <div key={l} style={{ background: C.card, borderRadius: "10px", padding: "10px 6px",
                textAlign: "center", border: `1.5px solid ${C.borda}` }}>
                <div style={{ fontSize: "20px", fontWeight: "700", color: cor }}>{n}</div>
                <div style={{ fontSize: "9px", color: C.sub }}>{l}</div>
              </div>
            ))}
          </div>
          {alunosLista.map(nome => {
            const dados = s.alunos[nome] || alunoVazio();
            return (
              <div key={nome} onClick={() => ir("status_aluno", { alunoAtual: nome, cenarioIdx: 0 })}
                style={{ background: dados.status === "avaliado" ? "rgba(39,174,96,.06)"
                  : dados.status === "andamento" ? "rgba(243,156,18,.06)"
                  : dados.status === "nao_realizou" ? "rgba(192,57,43,.06)" : C.card,
                  border: `1.5px solid ${dados.status === "avaliado" ? "#27ae60"
                    : dados.status === "andamento" ? C.ouro
                    : dados.status === "nao_realizou" ? C.vermelho : C.borda}`,
                  borderRadius: "12px", padding: "13px 15px", marginBottom: "8px",
                  display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "13px", fontWeight: "500", color: C.texto }}>{nome}</span>
                <Chip status={dados.status} />
              </div>
            );
          })}
        </Wrap>
        {/* O botão agora fica visível de qualquer jeito para permitir o avanço */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.borda}`, background: C.bg }}>
          <Btn cor="#27ae60" onClick={() => ir("confirmar_envio")} style={{ marginBottom: 0 }}>
            Enviar Avaliações →
          </Btn>
        </div>
        <Footer />
      </div>
    );
  }

  // ── STATUS DO ALUNO ───────────────────────────────────────
  if (s.tela === "status_aluno") {
    const voltarTela = s.modo === "ATLETAS" ? "atletas_lista" : "alunos";
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header titulo={s.alunoAtual} subtitulo={s.modo === "ATLETAS" ? "Equipe de Salto" : `${s.turma} · ${s.curso}`}
          onVoltar={() => ir(voltarTela)} tipo={s.modo} />
        <Wrap style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px" }}>
          <img src={s.modo === "ATLETAS" ? LOGOS.atletas : LOGOS.secequi}
            style={{ width: "80px", height: "80px", objectFit: "contain", marginBottom: "20px", opacity: 0.6 }} alt="logo" />
          <div style={{ fontSize: "18px", fontWeight: "600", color: C.verde, marginBottom: "8px" }}>
            {s.alunos[s.alunoAtual]?.status === "andamento" ? "Continuar avaliação?" : "Realizou a instrução?"}
          </div>
          <div style={{ fontSize: "12px", color: C.sub, marginBottom: "40px", textAlign: "center" }}>
            {s.alunos[s.alunoAtual]?.status === "andamento" ? "Esta avaliação está em andamento." : "Selecione para iniciar"}
          </div>
          <Btn cor="#27ae60" onClick={() => {
            const atual = s.alunos[s.alunoAtual] || alunoVazio();
            set({ alunos: { ...s.alunos, [s.alunoAtual]: { ...atual, status: "andamento" } }, cenarioIdx: 0 });
            ir("cenario");
          }}>✓ {s.alunos[s.alunoAtual]?.status === "andamento" ? "Continuar" : "Realizou — Iniciar"}</Btn>
          <Btn cor={C.vermelho} onClick={() => {
            set({ alunos: { ...s.alunos, [s.alunoAtual]: { ...alunoVazio(), status: "nao_realizou" } } });
            ir(voltarTela);
          }}>✗ Não Realizou</Btn>
        </Wrap>
        <Footer />
      </div>
    );
  }

  // ── CENÁRIO ───────────────────────────────────────────────
  if (s.tela === "cenario" && cenario) {
    const progresso = ((s.cenarioIdx + 1) / cenarios.length) * 100;
    const respostaAtual = s.alunos[s.alunoAtual]?.respostas?.[cenario.id];

    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header titulo={s.alunoAtual} subtitulo={`Cenário ${s.cenarioIdx + 1} de ${cenarios.length}`} tipo={s.modo}
          onVoltar={() => ir(s.modo === "ATLETAS" ? "atletas_lista" : "alunos")} />
        <Wrap>
          {/* Barra de progresso */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontSize: "9px", letterSpacing: "2px", color: C.ouro, fontWeight: "700",
                textTransform: "uppercase" }}>{cenario.titulo}</span>
              <span style={{ fontSize: "10px", color: C.sub }}>{Math.round(progresso)}%</span>
            </div>
            <div style={{ background: "#e0ddd8", borderRadius: "2px", height: "5px" }}>
              <div style={{ background: C.verde, height: "100%", borderRadius: "2px",
                width: `${progresso}%`, transition: "width .3s" }} />
            </div>
            <div style={{ display: "flex", gap: "4px", marginTop: "5px" }}>
              {cenarios.map((_, i) => (
                <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px",
                  background: i < s.cenarioIdx ? C.verde : i === s.cenarioIdx ? `${C.verde}66` : "#e0ddd8" }} />
              ))}
            </div>
          </div>

          {/* Card do cenário */}
          <Card bordaEsq={C.verde} style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "2px", color: C.ouro, fontWeight: "700",
              textTransform: "uppercase", marginBottom: "6px" }}>
              {cenario.atributos.join(" + ").replace(/_/g, " ")}
            </div>
            <div style={{ fontSize: "15px", color: C.texto, lineHeight: "1.6", fontWeight: "500", marginBottom: "10px" }}>
              {cenario.descricao}
            </div>
            <button onClick={() => set({ ndacaAberto: !s.ndacaAberto })}
              style={{ background: "none", border: "none", color: C.ouro, fontSize: "11px",
                cursor: "pointer", letterSpacing: "1px", fontFamily: "Inter, sans-serif",
                display: "flex", alignItems: "center", gap: "4px" }}>
              ℹ️ {s.ndacaAberto ? "Fechar" : "Ver conceituação NDACA"}
            </button>
            {s.ndacaAberto && (
              <div style={{ marginTop: "12px", borderTop: `1px solid ${C.borda}`, paddingTop: "12px" }}>
                {cenario.atributos.map(a => (
                  <div key={a} style={{ marginBottom: "8px" }}>
                    <div style={{ fontSize: "10px", color: C.verde, fontWeight: "700",
                      letterSpacing: "1px", textTransform: "uppercase" }}>{a.replace(/_/g, " ")}</div>
                    <div style={{ fontSize: "12px", color: C.sub, lineHeight: "1.6" }}>{cenario.ndaca[a]}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Opções A/B/C/NO */}
          {cenario.opcoes.map((opcao) => {
            const selecionada = respostaAtual?.letra === opcao.letra;
            const cores = {
              A:  { bg: selecionada ? "rgba(28,58,28,.1)"  : C.card, borda: selecionada ? C.verde   : C.borda, badge: C.verde,    txt: "#fff" },
              B:  { bg: selecionada ? "rgba(201,168,76,.1)": C.card, borda: selecionada ? C.ouro    : C.borda, badge: C.ouro,     txt: "#fff" },
              C:  { bg: selecionada ? "rgba(192,57,43,.1)" : C.card, borda: selecionada ? C.vermelho: C.borda, badge: C.vermelho, txt: "#fff" },
              NO: { bg: selecionada ? "rgba(0,0,0,.06)"    : C.card, borda: selecionada ? C.sub     : C.borda, badge: C.sub,      txt: "#fff" },
            }[opcao.letra];

            return (
              <div key={opcao.letra} onClick={() => {
                const alunoAtualData = s.alunos[s.alunoAtual] || alunoVazio();
                const novasResp = { ...alunoAtualData.respostas, [cenario.id]: opcao };
                const novosAlunos = { ...s.alunos, [s.alunoAtual]: { ...alunoAtualData, respostas: novasResp } };

                if (s.cenarioIdx < cenarios.length - 1) {
                  set({ alunos: novosAlunos, cenarioIdx: s.cenarioIdx + 1, ndacaAberto: false });
                } else {
                  set({ alunos: novosAlunos, ndacaAberto: false });
                  ir("fo");
                }
              }} style={{ background: cores.bg, border: `1.5px solid ${cores.borda}`,
                borderRadius: "12px", padding: "14px 15px", marginBottom: "8px",
                display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                  background: selecionada ? cores.borda : C.borda,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "700", color: selecionada ? cores.txt : C.sub }}>
                  {opcao.letra}
                </div>
                <div style={{ fontSize: "13px", color: C.texto, lineHeight: "1.5" }}>{opcao.texto}</div>
              </div>
            );
          })}
        </Wrap>
        <Footer />
      </div>
    );
  }

  // ── FATO OBSERVADO ────────────────────────────────────────
  if (s.tela === "fo") {
    const alunoData = s.alunos[s.alunoAtual] || alunoVazio();
    const foOpcoes = [
      { val: "nenhum", label: "Nenhum fato relevante", sub: "Avaliação segue normalmente", icone: "—" },
      { val: "pos1", label: "Fato Positivo +0,5", sub: "Comportamento excepcional observado", icone: "✅" },
      { val: "pos2", label: "Fato Positivo +1,0", sub: "Dois comportamentos excepcionais", icone: "✅✅" },
      { val: "neg1", label: "Fato Negativo −0,5", sub: "Comportamento preocupante", icone: "❌" },
      { val: "neg2", label: "Fato Negativo −1,0", sub: "Dois comportamentos preocupantes", icone: "❌❌" },
    ];

    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header titulo="Fato Observado" subtitulo={s.alunoAtual} tipo={s.modo}
          onVoltar={() => set({ cenarioIdx: cenarios.length - 1, tela: "cenario" })} />
        <Wrap>
          <div style={{ fontSize: "12px", color: C.sub, marginBottom: "16px", lineHeight: "1.7" }}>
            Registre apenas se ocorreu algo relevante não captado pelos cenários.{" "}
            <span style={{ color: C.ouro, fontWeight: "600" }}>Opcional.</span>
          </div>

          {Object.entries(atributos).map(([atribId, atrib]) => {
            const foAtual = alunoData.fos[atribId];
            const desc = alunoData.fosDesc[atribId] || "";
            const temFO = foAtual && foAtual !== "nenhum";
            return (
              <Card key={atribId} bordaEsq={atrib.cor} style={{ marginBottom: "10px" }}>
                <button onClick={() => {
                  const abertos = s.fosAbertos || {};
                  set({ fosAbertos: { ...abertos, [atribId]: !abertos[atribId] } });
                }} style={{ width: "100%", background: "none", border: "none", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "Inter, sans-serif", padding: 0 }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "10px", color: atrib.cor, letterSpacing: "1px",
                      fontWeight: "700", textTransform: "uppercase" }}>{atrib.nome}</div>
                    <div style={{ fontSize: "12px", color: temFO ? "#c9a84c" : C.sub, marginTop: "2px" }}>
                      {temFO ? foOpcoes.find(o => o.val === foAtual)?.label : "Nenhum fato observado"}
                    </div>
                  </div>
                  <span style={{ color: C.sub }}>{(s.fosAbertos?.[atribId]) ? "▲" : "▼"}</span>
                </button>

                {s.fosAbertos?.[atribId] && (
                  <div style={{ marginTop: "12px", borderTop: `1px solid ${C.borda}`, paddingTop: "12px" }}>
                    {foOpcoes.map(op => (
                      <div key={op.val} onClick={() => {
                        const novoFos = { ...alunoData.fos, [atribId]: op.val };
                        const novosAlunos = { ...s.alunos, [s.alunoAtual]: { ...alunoData, fos: novoFos } };
                        set({ alunos: novosAlunos });
                      }} style={{ background: foAtual === op.val ? `${atrib.cor}15` : "transparent",
                        border: `1px solid ${foAtual === op.val ? atrib.cor : C.borda}`,
                        borderRadius: "8px", padding: "10px 12px", marginBottom: "6px",
                        cursor: "pointer", display: "flex", gap: "10px" }}>
                        <span>{op.icone}</span>
                        <div>
                          <div style={{ fontSize: "13px", color: C.texto, fontWeight: "500" }}>{op.label}</div>
                          <div style={{ fontSize: "11px", color: C.sub }}>{op.sub}</div>
                        </div>
                      </div>
                    ))}
                    {temFO && (
                      <textarea placeholder="Descreva o fato observado (obrigatório)..."
                        value={desc}
                        onChange={e => {
                          const novoDesc = { ...alunoData.fosDesc, [atribId]: e.target.value };
                          set({ alunos: { ...s.alunos, [s.alunoAtual]: { ...alunoData, fosDesc: novoDesc } } });
                        }}
                        style={{ width: "100%", background: "#f8f6f0", border: `1.5px solid ${atrib.cor}`,
                          borderRadius: "10px", padding: "10px", fontSize: "13px", color: C.texto,
                          minHeight: "70px", resize: "none", boxSizing: "border-box",
                          fontFamily: "Inter, sans-serif", marginTop: "6px" }} />
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          <div style={{ marginTop: "12px" }}>
            <Btn onClick={() => ir("resultado")}>Ver Resultado →</Btn>
          </div>
        </Wrap>
        <Footer />
      </div>
    );
  }

  // ── RESULTADO ─────────────────────────────────────────────
  if (s.tela === "resultado") {
    const alunoData = s.alunos[s.alunoAtual] || alunoVazio();
    let resultados = calcularNota(alunoData.respostas, cenarios, atributos);
    Object.entries(alunoData.fos || {}).forEach(([atribId, tipoFO]) => {
      if (tipoFO && tipoFO !== "nenhum") resultados = aplicarFO(resultados, atribId, tipoFO);
    });
    const voltarTela = s.modo === "ATLETAS" ? "atletas_lista" : "alunos";

    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header titulo="Resultado" subtitulo={s.alunoAtual} tipo={s.modo} onVoltar={() => ir("fo")} />
        <Wrap>
          {Object.entries(atributos).map(([atribId, atrib]) => {
            const r = resultados[atribId];
            if (!r) return null;
            return (
              <Card key={atribId} bordaEsq={atrib.cor} style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "10px", color: atrib.cor, letterSpacing: "1.5px",
                  textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>{atrib.nome}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "24px",
                      fontWeight: "900", color: r.cor }}>{r.mencao}</div>
                    <div style={{ fontSize: "11px", color: C.sub, marginTop: "2px" }}>
                      {r.mencao === "NO" ? "Não Observado" : r.mencao === "MB" ? "Muito Bom" :
                        r.mencao === "B" ? "Bom" : r.mencao === "R" ? "Regular" : "Insuficiente"}
                    </div>
                  </div>
                  {r.nota !== null && (
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "36px",
                      fontWeight: "900", color: C.texto }}>{r.nota}</div>
                  )}
                </div>
                {alunoData.fos?.[atribId] && alunoData.fos[atribId] !== "nenhum" && alunoData.fosDesc?.[atribId] && (
                  <div style={{ marginTop: "8px", borderTop: `1px solid ${C.borda}`, paddingTop: "8px",
                    fontSize: "11px", color: C.sub }}>FO: {alunoData.fosDesc[atribId]}</div>
                )}
              </Card>
            );
          })}

          {/* Escala NDACA */}
          <div style={{ background: C.card, borderRadius: "12px", padding: "12px 15px",
            display: "flex", border: `1.5px solid ${C.borda}`, marginBottom: "16px" }}>
            {[["I","0",C.vermelho],[  "R","1–4",C.laranja],["B","5–7",C.azul],["MB","8–10","#27ae60"]].map(([m,n,cor]) => (
              <div key={m} style={{ flex: 1, textAlign: "center", borderRight: `1px solid ${C.borda}` }}
                className="last:border-none">
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", fontWeight: "900", color: cor }}>{m}</div>
                <div style={{ fontSize: "9px", color: C.sub, marginTop: "2px" }}>{n}</div>
              </div>
            ))}
          </div>

          {/* Observações */}
          <div style={{ fontSize: "11px", color: C.sub, marginBottom: "6px", fontWeight: "600",
            letterSpacing: "1px", textTransform: "uppercase" }}>Observações (opcional)</div>
          <textarea placeholder="Observação adicional sobre o aluno..."
            value={alunoData.observacoes || ""}
            onChange={e => set({ alunos: { ...s.alunos, [s.alunoAtual]: { ...alunoData, observacoes: e.target.value } } })}
            style={{ width: "100%", background: C.card, border: `1.5px solid ${C.borda}`,
              borderRadius: "12px", padding: "12px", fontSize: "13px", color: C.texto,
              minHeight: "80px", resize: "none", boxSizing: "border-box",
              fontFamily: "Inter, sans-serif", marginBottom: "16px" }} />

          <Btn cor="#27ae60" onClick={() => {
            const alunoFinal = { ...s.alunos[s.alunoAtual], status: "avaliado", resultados };
            set({ alunos: { ...s.alunos, [s.alunoAtual]: alunoFinal } });
            ir(voltarTela);
          }}>✓ Salvar e Próximo Aluno</Btn>
        </Wrap>
        <Footer />
      </div>
    );
  }

  // ── CONFIRMAR ENVIO ───────────────────────────────────────
  if (s.tela === "confirmar_envio") {
    const voltarTela = s.modo === "ATLETAS" ? "atletas_lista" : "alunos";
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header titulo="Confirmar Envio" onVoltar={() => ir(voltarTela)} tipo={s.modo} />
        <Wrap style={{ paddingTop: "24px" }}>
          <div style={{ background: "rgba(201,168,76,.1)", border: `1.5px solid ${C.ouro}44`,
            borderRadius: "14px", padding: "20px", marginBottom: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>⚠️</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px",
              fontWeight: "700", color: C.verde, marginBottom: "8px" }}>Atenção</div>
            <div style={{ fontSize: "13px", color: "#7a6a3a", lineHeight: "1.7" }}>
              Ao confirmar, as avaliações serão registradas<br />
              e <strong style={{ color: C.verde }}>não poderão mais ser editadas</strong> por este aplicativo.
            </div>
          </div>

          <Card style={{ marginBottom: "20px" }}>
            {[
              ["Modo", s.modo === "ATLETAS" ? "Equipe de Salto" : "CFGS"],
              s.modo !== "ATLETAS" && ["Curso", s.curso],
              s.modo !== "ATLETAS" && ["Turma", s.turma],
              s.modo !== "ATLETAS" && s.grupamentoSel && ["Grupamento", s.grupamentoSel],
              ["✅ Avaliados", String(qtdAv)],
              ["❌ Não realizou", String(qtdNR)],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between",
                padding: "7px 0", borderBottom: `1px solid ${C.borda}`, fontSize: "13px" }}>
                <span style={{ color: C.sub }}>{k}</span>
                <strong style={{ color: C.texto }}>{v}</strong>
              </div>
            ))}
          </Card>

          {s.erroEnvio && (
            <div style={{ background: "rgba(192,57,43,.1)", border: `1px solid ${C.vermelho}`,
              borderRadius: "10px", padding: "12px", marginBottom: "12px",
              fontSize: "13px", color: C.vermelho }}>⚠️ {s.erroEnvio}</div>
          )}

          <Btn cor="#27ae60" disabled={s.enviando} onClick={async () => {
            try {
              set({ enviando: true, erroEnvio: null });
              
              const alunosLista = s.modo === "ATLETAS" ? ATLETAS : (
                s.grupamentoSel && s.grupamentos ? (s.grupamentos[s.grupamentoSel] || []) : Object.keys(s.alunos || {})
              );

              const registros = alunosLista.map(nome => {
                const dados = s.alunos?.[nome] || { status: "Não Realizou", respostas: {}, fos: {}, fosDesc: {}, observacoes: "" };
                
                let notasCalculadas = {};
                let statusReal = dados.status || "Não Realizou";

                // Se o aluno foi avaliado, calcula a nota idêntico à tela de resultados
                if (statusReal === "avaliado" && typeof calcularNota === "function") {
                  let res = calcularNota(dados.respostas, cenarios, atributos);
                  Object.entries(dados.fos || {}).forEach(([atribId, tipoFO]) => {
                    if (tipoFO && tipoFO !== "nenhum" && typeof aplicarFO === "function") {
                      res = aplicarFO(res, atribId, tipoFO);
                    }
                  });

                  Object.entries(res).forEach(([atribId, r]) => {
                    const nomeAtributo = atributos[atribId]?.nome || atribId;
                    notasCalculadas[atribId] = {
                      nome: nomeAtributo,
                      nota: r.nota,
                      mencao: r.mencao
                    };
                  });
                }

                const fatos = Object.entries(dados.fos || {})
                  .filter(([,v]) => v && v !== "nenhum")
                  .map(([attr, tipo]) => `[${attr.replace("_"," ")}] ${tipo} — ${dados.fosDesc?.[attr] || "sem descrição"}`);
                
                return {
                  aluno: nome, 
                  instrutor: s.instrutor || "Não informado",
                  curso: s.modo === "ATLETAS" ? "EQUIPE DE SALTO" : (s.curso || "CFGS"),
                  turma: s.modo === "ATLETAS" ? "Viagem de Competição" : (s.turma || "Geral"),
                  tipo: s.modo || "ALUNOS",
                  status: statusReal,
                  data: new Date().toISOString().split("T")[0],
                  fatos, 
                  observacoes: dados.observacoes || "",
                  resultados: notasCalculadas,
                };
              });

              // Dispara via POST para o endereço de produção da Vercel
              const resp = await fetch("https://foal-app.vercel.app/api/salvar", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registros }),
              });
              
              if (!resp.ok) {
                const dadosErro = await resp.json().catch(() => ({}));
                throw new Error(dadosErro.error || "Falha na gravação do servidor");
              }
              
              const chave = s.modo === "ATLETAS" ? "ATLETAS_SALTO" : `${s.curso}_${s.turma}`;
              const novasEnviadas = { ...s.turmasEnviadas, [chave]: new Date().toISOString() };
              localStorage.setItem("foal_enviadas", JSON.stringify(novasEnviadas));
              set({ turmasEnviadas: novasEnviadas, enviando: false });
              ir("sucesso");

            } catch (e) {
              set({ enviando: false, erroEnvio: `Erro interno: ${e.message}` });
            }
          }}>{s.enviando ? "Enviando..." : "✓ Confirmar e Enviar"}</Btn>
        </Wrap>
        <Footer />
      </div>
    );
  }

  // ── SUCESSO ───────────────────────────────────────────────
  if (s.tela === "sucesso") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <Header titulo="Enviado!" tipo={s.modo} />
      <Wrap style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "48px" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>✅</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: "900",
          color: C.verde, marginBottom: "8px" }}>Avaliações Registradas!</div>
        <div style={{ fontSize: "14px", color: C.sub, lineHeight: "1.8", textAlign: "center", marginBottom: "40px" }}>
          {s.modo === "ATLETAS" ? "Equipe de Salto" : `${s.turma}`}<br />
          <span style={{ color: "#27ae60", fontWeight: "600" }}>{qtdAv} avaliados</span>
          {qtdNR > 0 && <> · <span style={{ color: C.vermelho, fontWeight: "600" }}>{qtdNR} não realizaram</span></>}
        </div>
        <Btn onClick={() => setS({ ...appInicial(), perfil: s.perfil, instrutor: s.instrutor })}>
          Nova Avaliação
        </Btn>
      </Wrap>
      <Footer />
    </div>
  );

  return null;
}
