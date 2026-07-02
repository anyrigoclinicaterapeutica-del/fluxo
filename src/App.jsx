import { useEffect, useState } from 'react'
import { supabase } from './config/supabase'
import './App.css'

const initialData = {
  instagram: { seguidores: 24500, meta: 30000, engajamento: 4.2 },
  tiktok: { visualizacoes: 120000, meta: 200000 },
  youtube: { inscritos: 8600, meta: 10000 },
  whatsapp: { conversoes: 32, meta: 50 },

  objetivo: {
    titulo: 'Faturar 50k/dia',
    prazo: '31/07/2026',
    responsavel: 'Equipe Comercial',
    status: 'Em andamento'
  },

  aviso: {
    titulo: 'Aviso da semana',
    texto: 'Foco total em conteúdos de conversão e acompanhamento das metas.',
    prioridade: 'Campanha de julho'
  },

  ideias: [
    {
      titulo: 'Série de reels com bastidores',
      descricao: 'Mostrar os bastidores da equipe, rotina e preparação dos conteúdos.',
      categoria: 'Instagram',
      status: 'Ideia'
    },
    {
      titulo: 'Vídeo curto de transformação',
      descricao: 'Criar antes e depois de resultado, processo ou campanha.',
      categoria: 'TikTok',
      status: 'Em análise'
    }
  ],

  planner: [
    {
      data: '01/07/2026',
      tarefa: 'Gravar reels da campanha de julho',
      responsavel: 'Marina',
      status: 'Em andamento'
    },
    {
      data: '02/07/2026',
      tarefa: 'Editar vídeo institucional',
      responsavel: 'Diego',
      status: 'Pendente'
    }
  ]
}

function App() {
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  async function carregar() {
    const { data: registro } = await supabase
      .from('fluxo_state')
      .select('*')
      .eq('id', 'principal')
      .single()

if (registro?.data) {
  setData({
    ...initialData,
    ...registro.data,
    instagram: { ...initialData.instagram, ...registro.data.instagram },
    tiktok: { ...initialData.tiktok, ...registro.data.tiktok },
    youtube: { ...initialData.youtube, ...registro.data.youtube },
    whatsapp: { ...initialData.whatsapp, ...registro.data.whatsapp },
    objetivo: registro.data.objetivo || initialData.objetivo,
   aviso: registro.data.aviso || initialData.aviso,
ideias: registro.data.ideias || initialData.ideias,
planner: registro.data.planner || initialData.planner
  })

  setLastUpdated(registro.updated_at)
} else {
      await supabase.from('fluxo_state').insert({
        id: 'principal',
        data: initialData
      })
    }

    setLoading(false)
  }

async function salvar() {
  const agora = new Date().toISOString()

  await supabase
    .from('fluxo_state')
    .upsert({
      id: 'principal',
      data,
      updated_at: agora
    })

   setLastUpdated(agora)
   setHasUnsavedChanges(false)
  alert('Dados salvos com sucesso!')
}

useEffect(() => {
    carregar()
  }, [])

  function update(path, value) {
    const novo = structuredClone(data)
    const keys = path.split('.')
    let atual = novo

    keys.slice(0, -1).forEach(k => {
      if (!atual[k]) {
        atual[k] = {}
      }

      atual = atual[k]
    })

    atual[keys[keys.length - 1]] = Number(value) || value
    setData(novo)
setHasUnsavedChanges(true)
  }

  function updatePlanner(index, field, value) {
    const novo = structuredClone(data)
    novo.planner[index][field] = value
    setData(novo)
setHasUnsavedChanges(true)
  }

  function addPlannerItem() {
    const novo = structuredClone(data)

    novo.planner.push({
      data: '',
      tarefa: '',
      responsavel: '',
      status: 'Pendente'
    })

    setData(novo)
setHasUnsavedChanges(true)
  }

function removePlannerItem(index) {
  const confirmar = window.confirm('Tem certeza que deseja remover esta tarefa?')

  if (!confirmar) return

  const novo = structuredClone(data)
  novo.planner.splice(index, 1)
  setData(novo)
setHasUnsavedChanges(true)
}

function updateIdea(index, field, value) {
  const novo = structuredClone(data)
  novo.ideias[index][field] = value
  setData(novo)
setHasUnsavedChanges(true)
}

function addIdea() {
  const novo = structuredClone(data)

  novo.ideias.push({
    titulo: '',
    descricao: '',
    categoria: 'Instagram',
    status: 'Ideia'
  })

  setData(novo)
setHasUnsavedChanges(true)
}

function removeIdea(index) {
  const confirmar = window.confirm('Tem certeza que deseja remover esta ideia?')

  if (!confirmar) return

  const novo = structuredClone(data)
  novo.ideias.splice(index, 1)
  setData(novo)
setHasUnsavedChanges(true)
}

  function entrarAdmin() {
    if (adminPassword === 'fluxo2026') {
      setAdminUnlocked(true)
    } else {
      alert('Senha incorreta')
    }
  }

  function sairAdmin() {
    setAdminUnlocked(false)
    setAdminPassword('')
    setPage('dashboard')
  }

  if (loading) {
    return <div className="loading">Carregando Fluxo...</div>
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">⚡ Fluxo</div>

        <button className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}>
          📊 Dashboard
        </button>
<button className={page === 'ideias' ? 'active' : ''} onClick={() => setPage('ideias')}>
  💡 Banco de Ideias
</button>
<button className={page === 'relatorios' ? 'active' : ''} onClick={() => setPage('relatorios')}>
  📈 Relatórios
</button>
<button className={page === 'tarefas-diarias' ? 'active' : ''} onClick={() => setPage('tarefas-diarias')}>
  ✅ Tarefa Diária
</button>
        <button className={page === 'planner' ? 'active' : ''} onClick={() => setPage('planner')}>
          🗓️ Planner
        </button>

        <button className={page === 'instagram' ? 'active' : ''} onClick={() => setPage('instagram')}>
          📱 Instagram
        </button>

        <button className={page === 'tiktok' ? 'active' : ''} onClick={() => setPage('tiktok')}>
          🎵 TikTok
        </button>

        <button className={page === 'youtube' ? 'active' : ''} onClick={() => setPage('youtube')}>
          ▶️ YouTube
        </button>

        <button className={page === 'whatsapp' ? 'active' : ''} onClick={() => setPage('whatsapp')}>
          💬 WhatsApp
        </button>

        <button className={page === 'admin' ? 'active admin-btn' : 'admin-btn'} onClick={() => setPage('admin')}>
          🔐 Admin
        </button>
      </aside>

      <main className="main">
        {page === 'dashboard' && (
  <Dashboard
    data={data}
    lastUpdated={lastUpdated}
    setPage={setPage}
  />
)}

{page === 'tarefas-diarias' && <TarefaDiaria data={data} />}
        {page === 'planner' && <Planner data={data} />}
        {page === 'instagram' && <Instagram data={data} />}
        {page === 'tiktok' && <TikTok data={data} />}
        {page === 'youtube' && <YouTube data={data} />}
        {page === 'whatsapp' && <WhatsApp data={data} />}
        {page === 'ideias' && <BancoIdeias data={data} />}
{page === 'relatorios' && <Relatorios data={data} />}
        {page === 'admin' && !adminUnlocked && (
          <AdminLogin
            password={adminPassword}
            setPassword={setAdminPassword}
            onLogin={entrarAdmin}
          />
        )}

        {page === 'admin' && adminUnlocked && (
          <Admin
  data={data}
  update={update}
  salvar={salvar}
  updatePlanner={updatePlanner}
  addPlannerItem={addPlannerItem}
  removePlannerItem={removePlannerItem}
  updateIdea={updateIdea}
  addIdea={addIdea}
  removeIdea={removeIdea}
  hasUnsavedChanges={hasUnsavedChanges}
  onLogout={sairAdmin}
/>
        )}
            </main>
    </div>
  )
}

function PageHeader({ title, subtitle }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  )
}
function LastUpdated({ value }) {
  if (!value) return null

  const formatted = new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  })

  return (
    <div className="last-updated">
      Última atualização: <strong>{formatted}</strong>
    </div>
  )
}

function QuickActions({ setPage }) {
  return (
    <section className="quick-actions">
      <button onClick={() => setPage('relatorios')}>
        <span>📈</span>
        <strong>Relatórios</strong>
        <small>Ver resumo geral</small>
      </button>

      <button onClick={() => setPage('ideias')}>
        <span>💡</span>
        <strong>Banco de Ideias</strong>
        <small>Conteúdos e campanhas</small>
      </button>

      <button onClick={() => setPage('planner')}>
        <span>🗓️</span>
        <strong>Planner</strong>
        <small>Tarefas da equipe</small>
      </button>

      <button onClick={() => setPage('admin')}>
        <span>🔐</span>
        <strong>Admin</strong>
        <small>Editar dados</small>
      </button>
    </section>
  )
}

function ExecutiveSummary({ progressoMedio, totalTarefas, totalIdeias, statusObjetivo }) {
  return (
    <section className="executive-summary">
      <div className="summary-card highlight">
        <span>Progresso médio</span>
        <strong>{progressoMedio}%</strong>
        <p>Média geral dos canais</p>
      </div>

      <div className="summary-card">
        <span>Tarefas</span>
        <strong>{totalTarefas}</strong>
        <p>Itens ativos no planner</p>
      </div>

      <div className="summary-card">
        <span>Ideias</span>
        <strong>{totalIdeias}</strong>
        <p>Conteúdos e campanhas</p>
      </div>

      <div className="summary-card">
        <span>Objetivo</span>
        <strong>{statusObjetivo}</strong>
        <p>Status principal atual</p>
      </div>
    </section>
  )
}

function DailyFocus({ planner }) {
  const tarefasAtivas = planner
    .filter(item => item.status !== 'Concluído')
    .slice(0, 3)

  return (
    <section className="daily-focus">
      <div className="daily-focus-head">
        <div>
          <span>Prioridade operacional</span>
          <h2>Foco do dia</h2>
        </div>

        <strong>{tarefasAtivas.length} ativa(s)</strong>
      </div>

      {tarefasAtivas.length === 0 ? (
        <p className="empty-focus">Nenhuma tarefa pendente no momento. Tudo em dia 🔥</p>
      ) : (
        <div className="focus-list">
          {tarefasAtivas.map((item, index) => (
            <div className="focus-item" key={index}>
              <div>
                <strong>{item.tarefa || 'Tarefa sem título'}</strong>
                <p>{item.data || 'Sem data'} · {item.responsavel || 'Sem responsável'}</p>
              </div>

              <span className={`status ${statusClass(item.status)}`}>
                {item.status || 'Pendente'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function TeamOverview({ planner }) {
  const pessoas = planner.reduce((acc, item) => {
    const nome = item.responsavel?.trim() || 'Sem responsável'

    if (!acc[nome]) {
      acc[nome] = {
        nome,
        total: 0,
        ativas: 0,
        concluidas: 0
      }
    }

    acc[nome].total += 1

    if (item.status === 'Concluído') {
      acc[nome].concluidas += 1
    } else {
      acc[nome].ativas += 1
    }

    return acc
  }, {})

  const lista = Object.values(pessoas)

  return (
    <section className="team-overview">
      <div className="team-head">
        <div>
          <span>Equipe</span>
          <h2>Responsáveis da operação</h2>
        </div>

        <strong>{lista.length} pessoa(s)</strong>
      </div>

      {lista.length === 0 ? (
        <p className="empty-team">Nenhum responsável cadastrado no planner.</p>
      ) : (
        <div className="team-list">
          {lista.map((pessoa, index) => (
            <div className="team-person" key={index}>
              <div className="avatar">
                {pessoa.nome.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{pessoa.nome}</strong>
                <p>{pessoa.total} tarefa(s) · {pessoa.concluidas} concluída(s)</p>
              </div>

              <span>{pessoa.ativas} ativa(s)</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function LatestIdeas({ ideias, setPage }) {
  const ultimasIdeias = ideias.slice(-3).reverse()

  return (
    <section className="latest-ideas">
      <div className="latest-ideas-head">
        <div>
          <span>Criação</span>
          <h2>Últimas ideias</h2>
        </div>

        <button onClick={() => setPage('ideias')}>
          Ver banco completo
        </button>
      </div>

      {ultimasIdeias.length === 0 ? (
        <p className="empty-ideas">Nenhuma ideia cadastrada ainda.</p>
      ) : (
        <div className="latest-ideas-list">
          {ultimasIdeias.map((item, index) => (
            <div className="latest-idea" key={index}>
              <div className="idea-top">
                <span>{item.categoria || 'Geral'}</span>
                <strong>{item.status || 'Ideia'}</strong>
              </div>

              <h3>{item.titulo || 'Ideia sem título'}</h3>
              <p>{item.descricao || 'Sem descrição cadastrada.'}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Dashboard({ data, lastUpdated, setPage }) {
  const progressoInstagram = calcularProgresso(data.instagram.seguidores, data.instagram.meta)
  const progressoTikTok = calcularProgresso(data.tiktok.visualizacoes, data.tiktok.meta)
  const progressoYouTube = calcularProgresso(data.youtube.inscritos, data.youtube.meta)
  const progressoWhatsApp = calcularProgresso(data.whatsapp.conversoes, data.whatsapp.meta)

  const progressoMedio = Math.round(
    (progressoInstagram + progressoTikTok + progressoYouTube + progressoWhatsApp) / 4
  )

  return (
    <>
      <header className="dashboard-hero">
        <span>Central de comando</span>
        <h1>Marketing em movimento</h1>
        <p>Visão geral das metas, tarefas, ideias e canais em tempo real.</p>
      </header>

      <LastUpdated value={lastUpdated} />
      <QuickActions setPage={setPage} />

      <ExecutiveSummary
        progressoMedio={progressoMedio}
        totalTarefas={data.planner?.length || 0}
        totalIdeias={data.ideias?.length || 0}
        statusObjetivo={data.objetivo?.status || 'Pendente'}
      />

      <DailyFocus planner={data.planner || []} />

      <TeamOverview planner={data.planner || []} />

      <LatestIdeas ideias={data.ideias || []} setPage={setPage} />

      <ObjectiveCard objetivo={data.objetivo} />
      <NoticeCard aviso={data.aviso} />
      <PlannerSummary data={data} />

      <section className="grid">
        <MetricCard
          title="Instagram"
          value={data.instagram.seguidores.toLocaleString('pt-BR')}
          meta={`Meta: ${data.instagram.meta.toLocaleString('pt-BR')}`}
          percent={progressoInstagram}
        />

        <MetricCard
          title="TikTok"
          value={data.tiktok.visualizacoes.toLocaleString('pt-BR')}
          meta={`Meta: ${data.tiktok.meta.toLocaleString('pt-BR')}`}
          percent={progressoTikTok}
        />

        <MetricCard
          title="YouTube"
          value={data.youtube.inscritos.toLocaleString('pt-BR')}
          meta={`Meta: ${data.youtube.meta.toLocaleString('pt-BR')}`}
          percent={progressoYouTube}
        />

        <MetricCard
          title="WhatsApp"
          value={data.whatsapp.conversoes}
          meta={`Meta: ${data.whatsapp.meta}`}
          percent={progressoWhatsApp}
        />
      </section>

      <PlannerCard data={data} />
    </>
  )
}

function Planner({ data }) {
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')
  const planner = data?.planner || []

  const termoBusca = busca.toLowerCase().trim()

  const tarefasFiltradas = planner.filter(item => {
    const bateStatus = filtro === 'Todos' || item.status === filtro

    const texto = `
      ${item.data || ''}
      ${item.tarefa || ''}
      ${item.responsavel || ''}
      ${item.status || ''}
    `.toLowerCase()

    const bateBusca = termoBusca === '' || texto.includes(termoBusca)

    return bateStatus && bateBusca
  })

 const filtros = [
  { nome: 'Todos', total: planner.length },
  { nome: 'Pendente', total: planner.filter(item => item.status === 'Pendente').length },
  { nome: 'Em andamento', total: planner.filter(item => item.status === 'Em andamento').length },
  { nome: 'Não feito', total: planner.filter(item => item.status === 'Não feito').length },
  { nome: 'Concluído', total: planner.filter(item => item.status === 'Concluído').length }
]

  return (
    <>
      <PageHeader title="Planner" subtitle="Tarefas e prioridades da equipe" />

      <section className="planner-search">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar tarefa por nome, responsável, data ou status..."
        />
      </section>

      <section className="planner-filters">
        {filtros.map(item => (
          <button
            key={item.nome}
            className={filtro === item.nome ? 'active' : ''}
            onClick={() => setFiltro(item.nome)}
          >
            {item.nome}
            <span>{item.total}</span>
          </button>
        ))}
      </section>

      {tarefasFiltradas.length === 0 ? (
        <section className="empty-state">
          Nenhuma tarefa encontrada para essa busca ou filtro.
        </section>
      ) : (
        <PlannerCard data={{ ...data, planner: tarefasFiltradas }} />
      )}
    </>
  )
}

function Instagram({ data }) {
  const progressoSeguidores = calcularProgresso(data.instagram.seguidores, data.instagram.meta)

  return (
    <>
      <PageHeader title="Instagram" subtitle="Métricas principais do Instagram" />

      <section className="grid">
        <MetricCard
          title="Seguidores"
          value={data.instagram.seguidores.toLocaleString('pt-BR')}
          meta={`Meta: ${data.instagram.meta.toLocaleString('pt-BR')}`}
          percent={progressoSeguidores}
        />

        <Card
          title="Engajamento"
          value={`${data.instagram.engajamento}%`}
          meta="Taxa atual"
        />
      </section>
    </>
  )
}

function TikTok({ data }) {
  const progressoViews = calcularProgresso(data.tiktok.visualizacoes, data.tiktok.meta)

  return (
    <>
      <PageHeader title="TikTok" subtitle="Visualizações e metas de crescimento" />

      <section className="grid">
        <MetricCard
          title="Visualizações"
          value={data.tiktok.visualizacoes.toLocaleString('pt-BR')}
          meta={`Meta: ${data.tiktok.meta.toLocaleString('pt-BR')}`}
          percent={progressoViews}
        />
      </section>
    </>
  )
}

function YouTube({ data }) {
  const progressoInscritos = calcularProgresso(data.youtube.inscritos, data.youtube.meta)

  return (
    <>
      <PageHeader title="YouTube" subtitle="Crescimento do canal e meta de inscritos" />

      <section className="grid">
        <MetricCard
          title="Inscritos"
          value={data.youtube.inscritos.toLocaleString('pt-BR')}
          meta={`Meta: ${data.youtube.meta.toLocaleString('pt-BR')}`}
          percent={progressoInscritos}
        />
      </section>
    </>
  )
}

function WhatsApp({ data }) {
  const progressoConversoes = calcularProgresso(data.whatsapp.conversoes, data.whatsapp.meta)

  return (
    <>
      <PageHeader title="WhatsApp" subtitle="Conversões e metas do atendimento" />

      <section className="grid">
        <MetricCard
          title="Conversões"
          value={data.whatsapp.conversoes}
          meta={`Meta: ${data.whatsapp.meta}`}
          percent={progressoConversoes}
        />
      </section>
    </>
  )
}

function ReportRow({ name, percent }) {
  return (
    <div className="report-row">
      <div className="report-channel">
        <span>{name}</span>

        <div className="report-bar">
          <div style={{ width: `${percent}%` }} />
        </div>
      </div>

      <strong>{percent}%</strong>
    </div>
  )
}

function Relatorios({ data }) {
  const progressoInstagram = calcularProgresso(data.instagram.seguidores, data.instagram.meta)
  const progressoTikTok = calcularProgresso(data.tiktok.visualizacoes, data.tiktok.meta)
  const progressoYouTube = calcularProgresso(data.youtube.inscritos, data.youtube.meta)
  const progressoWhatsApp = calcularProgresso(data.whatsapp.conversoes, data.whatsapp.meta)

  const planner = data?.planner || []
  const ideias = data?.ideias || []

  const pendentes = planner.filter(item => item.status === 'Pendente').length
  const andamento = planner.filter(item => item.status === 'Em andamento').length
  const concluidas = planner.filter(item => item.status === 'Concluído').length

const tarefasFeitas = planner.filter(item => item.status === 'Concluído')
const tarefasNaoFeitas = planner.filter(item => item.status === 'Não feito')
const tarefasEmAberto = planner.filter(item => item.status !== 'Concluído' && item.status !== 'Não feito')
const tarefasAtrasadas = planner.filter(item => item.status !== 'Concluído' && dataJaPassou(item.data))

  const ideiasAnalise = ideias.filter(item => item.status === 'Em análise').length
  const ideiasAprovadas = ideias.filter(item => item.status === 'Aprovada').length

  const canais = [
    { nome: 'Instagram', progresso: progressoInstagram },
    { nome: 'TikTok', progresso: progressoTikTok },
    { nome: 'YouTube', progresso: progressoYouTube },
    { nome: 'WhatsApp', progresso: progressoWhatsApp }
  ]

  const melhorCanal = canais.reduce((melhor, atual) => {
    return atual.progresso > melhor.progresso ? atual : melhor
  }, canais[0])

  function gerarResumo() {
    return `
📊 Resumo do Fluxo

🚀 Melhor canal: ${melhorCanal.nome} com ${melhorCanal.progresso}%

📌 Planner:
- ✅ ${tarefasFeitas.length} atividade(s) resolvida(s)
- ❌ ${tarefasNaoFeitas.length} não feita(s)
- ⏰ ${tarefasAtrasadas.length} atrasada(s)

💡 Banco de ideias:
- ${ideias.length} ideia(s) cadastrada(s)
- ${ideiasAnalise} em análise
- ${ideiasAprovadas} aprovada(s)

Status geral: acompanhar prioridades e manter foco nas metas.
`.trim()
  }

  async function copiarResumo() {
    await navigator.clipboard.writeText(gerarResumo())
    alert('Resumo copiado com sucesso!')
  }

  function abrirWhatsApp() {
    const texto = encodeURIComponent(gerarResumo())
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Resumo geral das metas, tarefas e ideias do Fluxo"
      />

      <section className="report-actions">
        <button onClick={copiarResumo}>
          Copiar resumo
        </button>

        <button onClick={abrirWhatsApp}>
          Abrir no WhatsApp
        </button>
      </section>

      <section className="report-grid">
        <div className="report-card">
          <span>Melhor progresso</span>
          <strong>{melhorCanal.progresso}%</strong>
          <p>{melhorCanal.nome} está com o maior avanço atual</p>
        </div>

        <div className="report-card">
          <span>Total de tarefas</span>
          <strong>{planner.length}</strong>
          <p>{pendentes} pendentes · {andamento} em andamento · {concluidas} concluídas</p>
        </div>

        <div className="report-card">
          <span>Ideias cadastradas</span>
          <strong>{ideias.length}</strong>
          <p>{ideiasAnalise} em análise · {ideiasAprovadas} aprovadas</p>
        </div>
      </section>

      <section className="task-status-report">
        <div className="task-status-card done">
          <span>Resolvidas</span>
          <strong>✅ {tarefasFeitas.length}</strong>
          <p>Atividades concluídas</p>
        </div>

        <div className="task-status-card pending">
          <span>Não feitas</span>
          <strong>❌ {tarefasNaoFeitas.length}</strong>
          <p>Pendentes ou em andamento</p>
        </div>

        <div className="task-status-card late">
          <span>Atrasadas</span>
          <strong>⏰ {tarefasAtrasadas.length}</strong>
          <p>Data passou e não foram concluídas</p>
        </div>
      </section>

      <section className="report-insights">
        <div className="insight-card featured">
          <span>Análise automática</span>
          <h2>{melhorCanal.nome} é o canal em maior destaque agora.</h2>
          <p>
            Esse canal está com {melhorCanal.progresso}% de progresso em relação à meta cadastrada.
          </p>
        </div>

        <div className="insight-card">
          <span>Operação</span>
        {tarefasNaoFeitas.length + tarefasEmAberto.length} atividade(s) precisam de atenção.
          <p>
           Existem {tarefasFeitas.length} resolvida(s), {tarefasNaoFeitas.length} marcada(s) como não feita(s),
{tarefasEmAberto.length} em aberto e {tarefasAtrasadas.length} atrasada(s).
          </p>
        </div>

        <div className="insight-card">
          <span>Criação</span>
          <h2>{ideias.length} ideia(s) disponíveis no banco.</h2>
          <p>
            Existem {ideiasAnalise} ideia(s) em análise e {ideiasAprovadas} ideia(s) aprovada(s).
          </p>
        </div>
      </section>

      <section className="task-history-grid">
        <div className="task-history-card">
          <h2>✅ Atividades feitas</h2>

          {tarefasFeitas.length === 0 ? (
            <p className="empty-history">Nenhuma atividade concluída ainda.</p>
          ) : (
            tarefasFeitas.map((item, index) => (
              <div className="history-item" key={index}>
                <strong>{item.tarefa || 'Tarefa sem título'}</strong>
                <p>{item.data || 'Sem data'} · {item.responsavel || 'Sem responsável'}</p>
              </div>
            ))
          )}
        </div>

        <div className="task-history-card">
          <h2>❌ Atividades não feitas</h2>

          {tarefasNaoFeitas.length === 0 ? (
            <p className="empty-history">Nenhuma atividade pendente no momento.</p>
          ) : (
            tarefasNaoFeitas.map((item, index) => (
              <div className="history-item" key={index}>
                <strong>{item.tarefa || 'Tarefa sem título'}</strong>
                <p>
                  {item.data || 'Sem data'} · {item.responsavel || 'Sem responsável'} · {item.status || 'Pendente'}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="report-table">
        <h2>Desempenho por canal</h2>

        <ReportRow name="Instagram" percent={progressoInstagram} />
        <ReportRow name="TikTok" percent={progressoTikTok} />
        <ReportRow name="YouTube" percent={progressoYouTube} />
        <ReportRow name="WhatsApp" percent={progressoWhatsApp} />
      </section>
    </>
  )
}


function BancoIdeias({ data }) {
  const [filtro, setFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')
  const ideias = data?.ideias || []

  const termoBusca = busca.toLowerCase().trim()

  const ideiasFiltradas = ideias.filter(item => {
    const bateStatus = filtro === 'Todos' || item.status === filtro

    const texto = `
      ${item.titulo || ''}
      ${item.descricao || ''}
      ${item.categoria || ''}
      ${item.status || ''}
    `.toLowerCase()

    const bateBusca = termoBusca === '' || texto.includes(termoBusca)

    return bateStatus && bateBusca
  })

  const filtros = [
    { nome: 'Todos', total: ideias.length },
    { nome: 'Ideia', total: ideias.filter(item => item.status === 'Ideia').length },
    { nome: 'Em análise', total: ideias.filter(item => item.status === 'Em análise').length },
    { nome: 'Aprovada', total: ideias.filter(item => item.status === 'Aprovada').length },
    { nome: 'Executada', total: ideias.filter(item => item.status === 'Executada').length }
  ]

  return (
    <>
      <PageHeader title="Banco de Ideias" subtitle="Ideias de conteúdos, campanhas e ações futuras" />

      <section className="ideas-search">
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar ideia por título, descrição, categoria ou status..."
        />
      </section>

      <section className="ideas-filters">
        {filtros.map(item => (
          <button
            key={item.nome}
            className={filtro === item.nome ? 'active' : ''}
            onClick={() => setFiltro(item.nome)}
          >
            {item.nome}
            <span>{item.total}</span>
          </button>
        ))}
      </section>

      {ideiasFiltradas.length === 0 ? (
        <section className="empty-state">
          Nenhuma ideia encontrada para essa busca ou filtro.
        </section>
      ) : (
        <section className="ideas-grid">
          {ideiasFiltradas.map((item, index) => (
            <div className="idea-card" key={index}>
              <div className="idea-top">
                <span>{item.categoria || 'Geral'}</span>
                <strong>{item.status || 'Ideia'}</strong>
              </div>

              <h2>{item.titulo || 'Ideia sem título'}</h2>
              <p>{item.descricao || 'Sem descrição cadastrada.'}</p>
            </div>
          ))}
        </section>
      )}
    </>
  )
}
function AdminLogin({ password, setPassword, onLogin }) {
  return (
    <>
      <PageHeader
        title="Área Administrativa"
        subtitle="Digite a senha para editar os dados do sistema"
      />

      <section className="admin login-box">
        <h2>Acesso restrito</h2>

        <label className="field">
          <span>Senha do administrador</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Digite a senha"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                onLogin()
              }
            }}
          />
        </label>

        <button className="save" onClick={onLogin}>
          Entrar no Admin
        </button>
      </section>
    </>
  )
}

function Admin({
  data,
  update,
  salvar,
  updatePlanner,
  addPlannerItem,
  removePlannerItem,
  updateIdea,
  addIdea,
  removeIdea,
  hasUnsavedChanges,
  onLogout
}) {
  return (
    <>
      <PageHeader title="Painel Administrativo" subtitle="Edite números e tarefas do sistema" />

      <div className="admin-session">
        <div>
          <strong>Admin desbloqueado</strong>
          <span>Você está editando os dados do Fluxo</span>
        </div>

        <button onClick={onLogout}>
          Sair do Admin
        </button>
      </div>

      <section className="admin">
        {hasUnsavedChanges && (
  <div className="unsaved-alert">
    <strong>Alterações pendentes</strong>
    <span>Clique em Salvar alterações para publicar no site.</span>
  </div>
)}
        <div className="admin-block">
          <h2>Objetivo principal</h2>

          <Field
            label="Título do objetivo"
            value={data.objetivo?.titulo || ''}
            onChange={v => update('objetivo.titulo', v)}
          />

          <Field
            label="Prazo"
            value={data.objetivo?.prazo || ''}
            onChange={v => update('objetivo.prazo', v)}
          />

          <Field
            label="Responsável"
            value={data.objetivo?.responsavel || ''}
            onChange={v => update('objetivo.responsavel', v)}
          />

          <label className="field">
            <span>Status do objetivo</span>
            <select
              value={data.objetivo?.status || 'Pendente'}
              onChange={e => update('objetivo.status', e.target.value)}
            >
              <option>Pendente</option>
<option>Em andamento</option>
<option>Não feito</option>
<option>Concluído</option>
            </select>
          </label>
        </div>

        <div className="admin-block">
          <h2>Aviso da semana</h2>

          <Field
            label="Título do aviso"
            value={data.aviso?.titulo || ''}
            onChange={v => update('aviso.titulo', v)}
          />

          <Field
            label="Texto do aviso"
            value={data.aviso?.texto || ''}
            onChange={v => update('aviso.texto', v)}
          />

          <Field
            label="Prioridade"
            value={data.aviso?.prioridade || ''}
            onChange={v => update('aviso.prioridade', v)}
          />
        </div>

        <div className="admin-block">
          <h2>Instagram</h2>

          <Field
            label="Seguidores Instagram"
            value={data.instagram.seguidores}
            onChange={v => update('instagram.seguidores', v)}
          />

          <Field
            label="Meta Instagram"
            value={data.instagram.meta}
            onChange={v => update('instagram.meta', v)}
          />

          <Field
            label="Engajamento Instagram"
            value={data.instagram.engajamento}
            onChange={v => update('instagram.engajamento', v)}
          />
        </div>

        <div className="admin-block">
          <h2>TikTok</h2>

          <Field
            label="Visualizações TikTok"
            value={data.tiktok.visualizacoes}
            onChange={v => update('tiktok.visualizacoes', v)}
          />

          <Field
            label="Meta TikTok"
            value={data.tiktok.meta}
            onChange={v => update('tiktok.meta', v)}
          />
        </div>

        <div className="admin-block">
          <h2>YouTube</h2>

          <Field
            label="Inscritos YouTube"
            value={data.youtube.inscritos}
            onChange={v => update('youtube.inscritos', v)}
          />

          <Field
            label="Meta YouTube"
            value={data.youtube.meta}
            onChange={v => update('youtube.meta', v)}
          />
        </div>

        <div className="admin-block">
          <h2>WhatsApp</h2>

          <Field
            label="Conversões WhatsApp"
            value={data.whatsapp.conversoes}
            onChange={v => update('whatsapp.conversoes', v)}
          />

          <Field
            label="Meta WhatsApp"
            value={data.whatsapp.meta}
            onChange={v => update('whatsapp.meta', v)}
          />
        </div>

        <div className="admin-block">
  <div className="admin-block-header">
    <h2>Banco de Ideias</h2>

    <button className="small-action" onClick={addIdea}>
      + Nova ideia
    </button>
  </div>

  {(data.ideias || []).map((item, index) => (
    <div className="idea-admin-card" key={index}>
      <div className="idea-admin-card-header">
        <strong>Ideia #{index + 1}</strong>

        <button className="remove" onClick={() => removeIdea(index)}>
          Remover esta ideia
        </button>
      </div>

      <div className="idea-admin-grid">
        <label className="field">
          <span>Título</span>
          <input
            placeholder="Título da ideia"
            value={item.titulo || ''}
            onChange={e => updateIdea(index, 'titulo', e.target.value)}
          />
        </label>

        <label className="field">
          <span>Categoria</span>
          <select
            value={item.categoria || 'Instagram'}
            onChange={e => updateIdea(index, 'categoria', e.target.value)}
          >
            <option>Instagram</option>
            <option>TikTok</option>
            <option>YouTube</option>
            <option>WhatsApp</option>
            <option>Campanha</option>
            <option>Geral</option>
          </select>
        </label>

        <label className="field full">
          <span>Descrição</span>
          <textarea
            placeholder="Descrição da ideia"
            value={item.descricao || ''}
            onChange={e => updateIdea(index, 'descricao', e.target.value)}
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={item.status || 'Ideia'}
            onChange={e => updateIdea(index, 'status', e.target.value)}
          >
            <option>Ideia</option>
            <option>Em análise</option>
            <option>Aprovada</option>
            <option>Executada</option>
          </select>
        </label>
      </div>
    </div>
  ))}
</div>

        <div className="admin-block">
          <div className="admin-block-header">
            <h2>Planner</h2>

            <button className="small-action" onClick={addPlannerItem}>
              + Nova tarefa
            </button>
          </div>

          {data.planner.map((item, index) => (
            <div className="planner-admin-row" key={index}>
              <input
                placeholder="Data"
                value={item.data}
                onChange={e => updatePlanner(index, 'data', e.target.value)}
              />

              <input
                placeholder="Tarefa"
                value={item.tarefa}
                onChange={e => updatePlanner(index, 'tarefa', e.target.value)}
              />

              <input
                placeholder="Responsável"
                value={item.responsavel}
                onChange={e => updatePlanner(index, 'responsavel', e.target.value)}
              />

              <select
  value={item.status}
  onChange={e => updatePlanner(index, 'status', e.target.value)}
>
  <option>Pendente</option>
  <option>Em andamento</option>
  <option>Não feito</option>
  <option>Concluído</option>
</select>
              <button className="remove" onClick={() => removePlannerItem(index)}>
                Remover
              </button>
            </div>
          ))}
        </div>

        <button className="save" onClick={salvar}>
          Salvar alterações
        </button>
      </section>
    </>
  )
}
function PlannerSummary({ data }) {
  const planner = data?.planner || []

  const total = planner.length
  const pendentes = planner.filter(item => item.status === 'Pendente').length
  const andamento = planner.filter(item => item.status === 'Em andamento').length
  const concluidas = planner.filter(item => item.status === 'Concluído').length

  return (
    <section className="planner-summary">
      <div className="summary-item">
        <span>Total de tarefas</span>
        <strong>{total}</strong>
      </div>

      <div className="summary-item pending">
        <span>Pendentes</span>
        <strong>{pendentes}</strong>
      </div>

      <div className="summary-item in-progress">
        <span>Em andamento</span>
        <strong>{andamento}</strong>
      </div>

      <div className="summary-item done">
        <span>Concluídas</span>
        <strong>{concluidas}</strong>
      </div>
    </section>
  )
}

function NoticeCard({ aviso }) {
  return (
    <section className="notice-card">
      <div>
        <span className="eyebrow">Comunicado interno</span>
        <h2>{aviso?.titulo || 'Aviso da semana'}</h2>
        <p>{aviso?.texto || 'Nenhum aviso cadastrado.'}</p>
      </div>

      <div className="notice-priority">
        <span>Prioridade</span>
        <strong>{aviso?.prioridade || 'Não definida'}</strong>
      </div>
    </section>
  )
}

function ObjectiveCard({ objetivo }) {
  return (
    <section className="objective-card">
      <div>
        <span className="eyebrow">Objetivo principal</span>
        <h2>{objetivo?.titulo || 'Sem objetivo definido'}</h2>

        <div className="objective-info">
          <span>Prazo: {objetivo?.prazo || 'Sem prazo'}</span>
          <span>Responsável: {objetivo?.responsavel || 'Não definido'}</span>
        </div>
      </div>

      <span className={`status ${statusClass(objetivo?.status)}`}>
        {objetivo?.status || 'Pendente'}
      </span>
    </section>
  )
}
function hojeISO() {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

function normalizarDataPlanner(value) {
  if (!value) return ''

  const texto = String(value).trim()

  if (texto.includes('/')) {
    const [dia, mes, ano] = texto.split('/')

    if (dia && mes && ano) {
      return `${ano.padStart(4, '0')}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
    }
  }

  if (texto.includes('-')) {
    const [ano, mes, dia] = texto.split('-')

    if (ano && mes && dia) {
      return `${ano.padStart(4, '0')}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
    }
  }

  return texto
}

function dataJaPassou(value) {
  const data = normalizarDataPlanner(value)

  if (!data) return false

  return data < hojeISO()
}
function statusClass(status) {
  if (status === 'Concluído') return 'done'
  if (status === 'Em andamento') return 'in-progress'
  if (status === 'Não feito') return 'not-done'
  return 'pending'
}
function TarefaDiaria({ data }) {
  const planner = data?.planner || []
  const hoje = hojeISO()

  const tarefasHoje = planner.filter(item => {
    return normalizarDataPlanner(item.data) === hoje
  })

  const feitas = tarefasHoje.filter(item => item.status === 'Concluído')
  const naoFeitas = tarefasHoje.filter(item => item.status !== 'Concluído')

  const dataFormatada = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return (
    <>
      <PageHeader
        title="Tarefa Diária"
        subtitle={`Atividades programadas para hoje: ${dataFormatada}`}
      />

      <section className="daily-task-summary">
        <div className="daily-task-card">
          <span>Atividades de hoje</span>
          <strong>{tarefasHoje.length}</strong>
          <p>Total encontrado no planner</p>
        </div>

        <div className="daily-task-card done">
          <span>Resolvidas</span>
          <strong>✅ {feitas.length}</strong>
          <p>Marcadas como concluídas</p>
        </div>

        <div className="daily-task-card pending">
          <span>Não feitas</span>
          <strong>❌ {naoFeitas.length}</strong>
          <p>Pendentes ou em andamento</p>
        </div>
      </section>

      {tarefasHoje.length === 0 ? (
        <section className="empty-state">
          Nenhuma tarefa cadastrada para hoje no Planner.
        </section>
      ) : (
        <section className="daily-task-list">
          {tarefasHoje.map((item, index) => (
            <div className="daily-task-item" key={index}>
              <div>
                <strong>{item.tarefa || 'Tarefa sem título'}</strong>
                <p>{item.data || 'Sem data'} · {item.responsavel || 'Sem responsável'}</p>
              </div>

              <span className={`status ${statusClass(item.status)}`}>
                {item.status || 'Pendente'}
              </span>
            </div>
          ))}
        </section>
      )}
    </>
  )
}
function PlannerCard({ data }) {
  return (
    <section className="planner-section">
      <div className="planner-title">
        <h2>Planner</h2>
        <p>Organização das tarefas e prioridades da equipe</p>
      </div>

      <div className="planner-list">
        {data.planner.map((item, index) => (
          <div className="planner-item" key={index}>
            <div className="planner-date">
              <span>{item.data || 'Sem data'}</span>
            </div>

            <div className="planner-content">
              <strong>{item.tarefa || 'Tarefa sem título'}</strong>
              <p>Responsável: {item.responsavel || 'Não definido'}</p>
            </div>

            <span className={`status ${statusClass(item.status)}`}>
              {item.status || 'Pendente'}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function calcularProgresso(atual, meta) {
  if (!meta || meta === 0) return 0
  return Math.min(100, Math.round((Number(atual) / Number(meta)) * 100))
}

function MetricCard({ title, value, meta, percent }) {
  return (
    <div className="card metric-card">
      <div className="metric-head">
        <h2>{title}</h2>
        <span>{percent}%</span>
      </div>

      <div className="value">{value}</div>
      <p>{meta}</p>

      <div className="progress">
        <div style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function Card({ title, value, meta }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="value">{value}</div>
      <p>{meta}</p>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} />
    </label>
  )
}

export default App