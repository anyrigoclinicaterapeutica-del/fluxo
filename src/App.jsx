import { useEffect, useState } from 'react'
import { supabase } from './config/supabase'
import './App.css'

const initialData = {
  instagram: { seguidores: 24500, meta: 30000, engajamento: 4.2 },
  tiktok: { visualizacoes: 120000, meta: 200000 },
  youtube: { inscritos: 8600, meta: 10000 },
  whatsapp: { conversoes: 32, meta: 50 },
  planner: [
    { data: '01/07/2026', tarefa: 'Gravar reels da campanha de julho', responsavel: 'Marina', status: 'Em andamento' },
    { data: '02/07/2026', tarefa: 'Editar vídeo institucional', responsavel: 'Diego', status: 'Pendente' }
  ]
}

function App() {
  const [data, setData] = useState(initialData)
  const [page, setPage] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')

  async function carregar() {
    const { data: registro } = await supabase
      .from('fluxo_state')
      .select('*')
      .eq('id', 'principal')
      .single()

    if (registro?.data) {
      setData(registro.data)
    } else {
      await supabase.from('fluxo_state').insert({
        id: 'principal',
        data: initialData
      })
    }

    setLoading(false)
  }

  async function salvar() {
    await supabase
      .from('fluxo_state')
      .upsert({
        id: 'principal',
        data,
        updated_at: new Date()
      })

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
      atual = atual[k]
    })

    atual[keys[keys.length - 1]] = Number(value) || value
    setData(novo)
  }

  function updatePlanner(index, field, value) {
    const novo = structuredClone(data)
    novo.planner[index][field] = value
    setData(novo)
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
  }

  function removePlannerItem(index) {
    const novo = structuredClone(data)
    novo.planner.splice(index, 1)
    setData(novo)
  }

  function entrarAdmin() {
    if (adminPassword === 'fluxo2026') {
      setAdminUnlocked(true)
    } else {
      alert('Senha incorreta')
    }
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
        {page === 'dashboard' && <Dashboard data={data} />}
        {page === 'planner' && <Planner data={data} />}
        {page === 'instagram' && <Instagram data={data} />}
        {page === 'tiktok' && <TikTok data={data} />}
        {page === 'youtube' && <YouTube data={data} />}
        {page === 'whatsapp' && <WhatsApp data={data} />}

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

function Dashboard({ data }) {
  return (
    <>
      <PageHeader title="Dashboard da Equipe" subtitle="Acompanhe os principais indicadores" />

      <section className="grid">
        <Card title="Instagram" value={data.instagram.seguidores.toLocaleString('pt-BR')} meta={`Meta: ${data.instagram.meta.toLocaleString('pt-BR')}`} />
        <Card title="TikTok" value={data.tiktok.visualizacoes.toLocaleString('pt-BR')} meta={`Meta: ${data.tiktok.meta.toLocaleString('pt-BR')}`} />
        <Card title="YouTube" value={data.youtube.inscritos.toLocaleString('pt-BR')} meta={`Meta: ${data.youtube.meta.toLocaleString('pt-BR')}`} />
        <Card title="WhatsApp" value={data.whatsapp.conversoes} meta={`Meta: ${data.whatsapp.meta}`} />
      </section>

      <PlannerCard data={data} />
    </>
  )
}

function Planner({ data }) {
  return (
    <>
      <PageHeader title="Planner" subtitle="Tarefas e prioridades da equipe" />
      <PlannerCard data={data} />
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

function Admin({ data, update, salvar, updatePlanner, addPlannerItem, removePlannerItem }) {
  return (
    <>
      <PageHeader title="Painel Administrativo" subtitle="Edite números e tarefas do sistema" />

      <section className="admin">
        <h2>Indicadores</h2>

        <Field label="Seguidores Instagram" value={data.instagram.seguidores} onChange={v => update('instagram.seguidores', v)} />
        <Field label="Meta Instagram" value={data.instagram.meta} onChange={v => update('instagram.meta', v)} />
        <Field label="Engajamento Instagram" value={data.instagram.engajamento} onChange={v => update('instagram.engajamento', v)} />

        <Field label="Visualizações TikTok" value={data.tiktok.visualizacoes} onChange={v => update('tiktok.visualizacoes', v)} />
        <Field label="Meta TikTok" value={data.tiktok.meta} onChange={v => update('tiktok.meta', v)} />

        <Field label="Inscritos YouTube" value={data.youtube.inscritos} onChange={v => update('youtube.inscritos', v)} />
        <Field label="Meta YouTube" value={data.youtube.meta} onChange={v => update('youtube.meta', v)} />

        <Field label="Conversões WhatsApp" value={data.whatsapp.conversoes} onChange={v => update('whatsapp.conversoes', v)} />
        <Field label="Meta WhatsApp" value={data.whatsapp.meta} onChange={v => update('whatsapp.meta', v)} />

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
function statusClass(status) {
  if (status === 'Concluído') return 'done'
  if (status === 'Em andamento') return 'in-progress'
  return 'pending'
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