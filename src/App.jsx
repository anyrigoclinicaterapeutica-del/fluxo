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
  const [admin, setAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

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

    keys.slice(0, -1).forEach(k => atual = atual[k])
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
  if (loading) return <div className="loading">Carregando Fluxo...</div>

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">⚡ Fluxo</div>
        <button>📊 Dashboard</button>
        <button>📅 Planner</button>
        <button>📱 Instagram</button>
        <button>🎵 TikTok</button>
        <button>▶️ YouTube</button>
        <button>💬 WhatsApp</button>
        <button onClick={() => setAdmin(!admin)}>
          {admin ? '👁️ Ver equipe' : '🔐 Admin'}
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <h1>{admin ? 'Painel Administrativo' : 'Dashboard da Equipe'}</h1>
          <p>{admin ? 'Edite os números do sistema' : 'Acompanhe os principais indicadores'}</p>
        </header>

        {!admin ? (
          <>
            <section className="grid">
              <Card title="Instagram" value={data.instagram.seguidores.toLocaleString('pt-BR')} meta={`Meta: ${data.instagram.meta.toLocaleString('pt-BR')}`} />
              <Card title="TikTok" value={data.tiktok.visualizacoes.toLocaleString('pt-BR')} meta={`Meta: ${data.tiktok.meta.toLocaleString('pt-BR')}`} />
              <Card title="YouTube" value={data.youtube.inscritos.toLocaleString('pt-BR')} meta={`Meta: ${data.youtube.meta.toLocaleString('pt-BR')}`} />
              <Card title="WhatsApp" value={data.whatsapp.conversoes} meta={`Meta: ${data.whatsapp.meta}`} />
            </section>

            <section className="card">
              <h2>Planner</h2>
              {data.planner.map((item, index) => (
                <div className="task" key={index}>
                  <strong>{item.tarefa}</strong>
                  <span>{item.data} · {item.responsavel} · {item.status}</span>
                </div>
              ))}
            </section>
          </>
        ) : (
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
            <button className="save" onClick={salvar}>Salvar alterações</button>
          </section>
        )}
      </main>
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