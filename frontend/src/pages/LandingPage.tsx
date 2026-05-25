import { Link } from 'react-router-dom'
import { useAuthStore } from '../hooks/useAuthStore'
import {
  Calendar,
  CheckCircle2,
} from 'lucide-react'

export function LandingPage() {
  const { user } = useAuthStore()

  // Mock data for the simplified visual preview
  const demoTasks = [
    {
      id: 't1',
      title: 'Repasar autovalores',
      desc: 'Revisar apuntes de clase y hacer ejercicios del capítulo 5.',
      priority: 'high',
      status: 'todo',
      dueDate: 'Mañana',
    },
    {
      id: 't2',
      title: 'Diseñar el esquema DDL',
      desc: 'Crear tablas con RLS y definir las claves foráneas necesarias.',
      priority: 'urgent',
      status: 'progress',
      dueDate: '24 May',
    },
    {
      id: 't3',
      title: 'Maquetado de Landing Page',
      desc: 'Lograr un estilo radical, limpio e increíblemente moderno.',
      priority: 'medium',
      status: 'done',
      dueDate: 'Completado',
    },
  ]

  const priorityColors = {
    urgent: 'bg-red-50 text-red-600 border-red-100',
    high: 'bg-orange-50 text-orange-600 border-orange-100',
    medium: 'bg-brand-50 text-brand-600 border-brand-100',
    low: 'bg-surface-100 text-surface-500 border-surface-200',
  }

  return (
    <div className="min-h-screen bg-surface-50 text-surface-800 selection:bg-brand-500 selection:text-white font-sans grid-pattern relative overflow-hidden flex flex-col justify-between">
      {/* Decorative radial glows - soft pastels in light mode */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] radial-glow-violet opacity-30 pointer-events-none blur-[100px]" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] radial-glow-blue opacity-25 pointer-events-none blur-[120px]" />


      {/* Main section */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-6 relative z-10">
        

        {/* Hero */}
        <div className="max-w-3xl text-center mb-12">
          <h2 className="text-6xl md:text-8xl font-black text-brand-500 tracking-tighter leading-none mb-6">
            ztasks
          </h2>
          <p className="text-base md:text-lg text-surface-500 max-w-lg mx-auto font-normal leading-relaxed">
            Tu segundo cerebro. Un espacio ultra-minimalista para organizar tus proyectos con tableros Kanban técnicos.
          </p>

          <div className="mt-8">
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/20 transition-all font-bold text-sm hover:scale-[1.02] border border-brand-400/10"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>

        {/* Minimalist Floating Mockup without sidebar */}
        <section className="w-full max-w-4xl rounded-2xl border border-surface-200/80 bg-white/90 p-4 backdrop-blur-sm shadow-2xl shadow-surface-300/40 relative group hover:border-surface-300 transition-colors duration-500">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-tr from-brand-500/5 via-transparent to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          {/* Mockup Topbar */}
          <div className="flex items-center justify-between border-b border-surface-100 pb-3 mb-4 px-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
            </div>
            <div className="text-[10px] text-surface-400 font-mono">ztasks.app</div>
            <div className="w-8" />
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-[280px]">
            
            {/* Column: Todo */}
            <div className="flex flex-col gap-2 rounded-xl bg-surface-100/50 border border-surface-200/40 p-2.5 overflow-hidden">
              <div className="flex items-center justify-between border-b border-surface-200/60 pb-1.5 px-1 shrink-0">
                <span className="text-[10px] font-bold text-surface-550 uppercase tracking-wider text-surface-500">Pendiente</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-200 text-surface-600 font-bold">1</span>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
                {demoTasks.filter(t => t.status === 'todo').map(task => (
                  <div key={task.id} className="rounded-lg border border-surface-200/80 bg-white p-3.5 flex flex-col gap-2 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 group/card shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-surface-800 text-xs truncate group-hover/card:text-brand-600 transition-colors">{task.title}</h5>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-surface-500 line-clamp-2 leading-relaxed">{task.desc}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-surface-400 border-t border-surface-100 pt-2 mt-1">
                      <Calendar size={10} />
                      <span>Vence: {task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: Progress */}
            <div className="flex flex-col gap-2 rounded-xl bg-surface-100/50 border border-surface-200/40 p-2.5 overflow-hidden">
              <div className="flex items-center justify-between border-b border-surface-200/60 pb-1.5 px-1 shrink-0">
                <span className="text-[10px] font-bold text-surface-550 uppercase tracking-wider text-surface-500">En progreso</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-200 text-surface-600 font-bold">1</span>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
                {demoTasks.filter(t => t.status === 'progress').map(task => (
                  <div key={task.id} className="rounded-lg border border-surface-200/80 bg-white p-3.5 flex flex-col gap-2 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 group/card shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-surface-800 text-xs truncate group-hover/card:text-brand-600 transition-colors">{task.title}</h5>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-surface-500 line-clamp-2 leading-relaxed">{task.desc}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-surface-400 border-t border-surface-100 pt-2 mt-1">
                      <Calendar size={10} />
                      <span>Vence: {task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column: Done */}
            <div className="flex flex-col gap-2 rounded-xl bg-surface-100/50 border border-surface-200/40 p-2.5 overflow-hidden">
              <div className="flex items-center justify-between border-b border-surface-200/60 pb-1.5 px-1 shrink-0">
                <span className="text-[10px] font-bold text-surface-550 uppercase tracking-wider text-surface-500">Completado</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-200 text-surface-600 font-bold">1</span>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
                {demoTasks.filter(t => t.status === 'done').map(task => (
                  <div key={task.id} className="rounded-lg border border-surface-200/80 bg-white p-3.5 flex flex-col gap-2 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 group/card opacity-65 hover:opacity-100 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-surface-400 text-xs truncate line-through group-hover/card:text-brand-600 transition-colors">{task.title}</h5>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-surface-450 line-clamp-2 leading-relaxed text-surface-400">{task.desc}</p>
                    <div className="flex items-center gap-1.5 text-[9px] text-surface-400 border-t border-surface-100 pt-2 mt-1">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[10px] text-surface-450 tracking-wider z-10 shrink-0 text-surface-400">
        ztasks v2.0 &middot; minimalismo radical.
      </footer>
    </div>
  )
}
