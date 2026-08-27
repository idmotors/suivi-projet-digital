import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  emptyMilestone,
  emptyProject,
  milestoneStatuses,
  priorities,
  projectColors,
  projectStatuses,
  type Milestone,
  type MilestoneInput,
  type Project,
  type ProjectInput,
} from '../lib/project-data'

export const Route = createFileRoute('/')({ component: Home })

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
const moneyFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

function formatDate(value: string | null) {
  if (!value) return 'Non définie'
  return dateFormatter.format(new Date(`${value}T12:00:00`))
}

function statusSlug(status: string) {
  return status.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-')
}

function daysUntil(value: string | null) {
  if (!value) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${value}T00:00:00`)
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000)
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error || 'Une erreur est survenue.')
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [projectModal, setProjectModal] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null)
  const [projectDraft, setProjectDraft] = useState<ProjectInput>(emptyProject)
  const [milestoneModal, setMilestoneModal] = useState(false)
  const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null)
  const [milestoneDraft, setMilestoneDraft] = useState<MilestoneInput>(emptyMilestone)
  const [saving, setSaving] = useState(false)

  const loadProjects = useCallback(async (preferredId?: number) => {
    setLoading(true)
    setError('')
    try {
      const data = await api<Project[]>('/api/projects')
      setProjects(data)
      setSelectedId((current) => {
        const candidate = preferredId ?? current
        if (candidate && data.some((project) => project.id === candidate)) return candidate
        return data[0]?.id ?? null
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossible de charger les projets.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim()
    return projects.filter((project) => {
      const matchesSearch = !query || [project.name, project.owner, project.category].some((value) => value.toLowerCase().includes(query))
      return matchesSearch && (statusFilter === 'Tous' || project.status === statusFilter)
    })
  }, [projects, search, statusFilter])

  const selectedProject = projects.find((project) => project.id === selectedId) ?? null
  const completed = projects.filter((project) => project.status === 'Terminé').length
  const active = projects.filter((project) => project.status === 'En cours').length
  const averageProgress = projects.length ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length) : 0
  const lateMilestones = projects.flatMap((project) => project.milestones).filter((milestone) => {
    const days = daysUntil(milestone.dueDate)
    return milestone.status !== 'Terminé' && days !== null && days < 0
  }).length

  function openNewProject() {
    setEditingProjectId(null)
    setProjectDraft({ ...emptyProject })
    setProjectModal(true)
  }

  function openEditProject(project: Project) {
    setEditingProjectId(project.id)
    setProjectDraft({
      name: project.name,
      description: project.description,
      owner: project.owner,
      category: project.category,
      status: project.status,
      priority: project.priority,
      color: project.color,
      startDate: project.startDate,
      targetDate: project.targetDate,
      budget: project.budget,
      progress: project.progress,
    })
    setProjectModal(true)
  }

  async function saveProject() {
    if (!projectDraft.name.trim()) return setError('Donnez un nom au projet.')
    setSaving(true)
    setError('')
    try {
      const saved = await api<Project>(editingProjectId ? `/api/projects/${editingProjectId}` : '/api/projects', {
        method: editingProjectId ? 'PUT' : 'POST',
        body: JSON.stringify(projectDraft),
      })
      setProjectModal(false)
      await loadProjects(saved.id)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossible d’enregistrer le projet.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteProject(project: Project) {
    if (!window.confirm(`Supprimer « ${project.name} » et tous ses jalons ?`)) return
    try {
      await api<void>(`/api/projects/${project.id}`, { method: 'DELETE' })
      await loadProjects()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossible de supprimer le projet.')
    }
  }

  function openNewMilestone() {
    setEditingMilestoneId(null)
    setMilestoneDraft({ ...emptyMilestone, owner: selectedProject?.owner ?? '' })
    setMilestoneModal(true)
  }

  function openEditMilestone(milestone: Milestone) {
    setEditingMilestoneId(milestone.id)
    setMilestoneDraft({
      title: milestone.title,
      description: milestone.description,
      owner: milestone.owner,
      status: milestone.status,
      dueDate: milestone.dueDate,
      progress: milestone.progress,
    })
    setMilestoneModal(true)
  }

  async function saveMilestone() {
    if (!selectedProject || !milestoneDraft.title.trim()) return setError('Donnez un titre au jalon.')
    setSaving(true)
    setError('')
    try {
      await api<Milestone>(editingMilestoneId ? `/api/milestones/${editingMilestoneId}` : `/api/projects/${selectedProject.id}/milestones`, {
        method: editingMilestoneId ? 'PUT' : 'POST',
        body: JSON.stringify(milestoneDraft),
      })
      setMilestoneModal(false)
      await loadProjects(selectedProject.id)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossible d’enregistrer le jalon.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteMilestone(milestone: Milestone) {
    if (!selectedProject || !window.confirm(`Supprimer le jalon « ${milestone.title} » ?`)) return
    try {
      await api<void>(`/api/milestones/${milestone.id}`, { method: 'DELETE' })
      await loadProjects(selectedProject.id)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Impossible de supprimer le jalon.')
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><Target size={19} /></span><span>Jalons</span></div>
        <nav className="main-nav" aria-label="Navigation principale">
          <button className="nav-item is-active"><LayoutDashboard size={18} /><span>Vue d’ensemble</span></button>
          <button className="nav-item"><FolderKanban size={18} /><span>Tous les projets</span><span className="nav-count">{projects.length}</span></button>
        </nav>
        <div className="sidebar-note">
          <span className="eyebrow">Cap du mois</span>
          <strong>{averageProgress}% réalisé</strong>
          <div className="mini-progress"><span style={{ width: `${averageProgress}%` }} /></div>
          <p>Gardez chaque équipe alignée sur les prochaines échéances.</p>
        </div>
        <div className="profile"><div className="avatar">CM</div><div><strong>Glenn</strong><span>Direction de projet</span></div><MoreHorizontal size={18} /></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="Ouvrir le menu"><Menu size={21} /></button>
          <div><span className="eyebrow">Portefeuille projets</span></div>
          <button className="primary-button" onClick={openNewProject}><Plus size={18} /> Nouveau projet</button>
        </header>

        {error && <div className="error-banner"><AlertTriangle size={18} /><span>{error}</span><button onClick={() => setError('')} aria-label="Fermer"><X size={17} /></button></div>}

        <section className="stats-grid" aria-label="Indicateurs clés">
          <StatCard label="Projets actifs" value={active} detail={`${projects.length} au total`} icon={<CircleDot size={20} />} tone="orange" />
          <StatCard label="Progression moyenne" value={`${averageProgress}%`} detail="Tous projets confondus" icon={<Target size={20} />} tone="violet" />
          <StatCard label="Jalons en retard" value={lateMilestones} detail={lateMilestones ? 'Action requise' : 'Tout est à jour'} icon={<Clock3 size={20} />} tone="red" />
          <StatCard label="Projets terminés" value={completed} detail="Depuis le début" icon={<CheckCircle2 size={20} />} tone="green" />
        </section>

        <section className="workspace">
          <div className="portfolio-panel">
            <div className="panel-heading"><div><span className="eyebrow">Portefeuille</span><h2>Vos projets</h2></div><span className="result-count">{filteredProjects.length}</span></div>
            <div className="filters">
              <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher…" /></label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrer par statut">
                <option>Tous</option>{projectStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
            <div className="project-list">
              {loading ? <ProjectSkeletons /> : filteredProjects.length ? filteredProjects.map((project) => (
                <button key={project.id} className={`project-row ${project.id === selectedId ? 'is-selected' : ''}`} onClick={() => { setSelectedId(project.id); setMenuOpen(false) }}>
                  <span className="project-accent" style={{ background: project.color }} />
                  <span className="project-row-main"><span className="project-title-line"><strong>{project.name}</strong><StatusBadge status={project.status} /></span><span>{project.owner || 'Sans responsable'} · {project.category}</span><span className="row-progress"><i><b style={{ width: `${project.progress}%`, background: project.color }} /></i><em>{project.progress}%</em></span></span>
                  <ChevronRight size={18} />
                </button>
              )) : <div className="empty-state"><FolderKanban size={32} /><strong>Aucun projet trouvé</strong><p>Modifiez les filtres ou créez un nouveau projet.</p><button className="text-button" onClick={openNewProject}>Créer un projet <ArrowRight size={15} /></button></div>}
            </div>
          </div>

          <div className="detail-panel">
            {selectedProject ? <ProjectDetail project={selectedProject} onEdit={() => openEditProject(selectedProject)} onDelete={() => void deleteProject(selectedProject)} onAddMilestone={openNewMilestone} onEditMilestone={openEditMilestone} onDeleteMilestone={(milestone) => void deleteMilestone(milestone)} /> : !loading && <div className="detail-empty"><Target size={42} /><h2>Sélectionnez un projet</h2><p>Sa progression et ses jalons apparaîtront ici.</p></div>}
          </div>
        </section>
      </main>

      {menuOpen && <button className="mobile-scrim" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" />}
      {projectModal && <ProjectModal draft={projectDraft} setDraft={setProjectDraft} editing={Boolean(editingProjectId)} saving={saving} onClose={() => setProjectModal(false)} onSave={() => void saveProject()} />}
      {milestoneModal && <MilestoneModal draft={milestoneDraft} setDraft={setMilestoneDraft} editing={Boolean(editingMilestoneId)} saving={saving} onClose={() => setMilestoneModal(false)} onSave={() => void saveMilestone()} />}
    </div>
  )
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: string | number; detail: string; icon: React.ReactNode; tone: string }) {
  return <article className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-${statusSlug(status)}`}>{status}</span>
}

function ProjectSkeletons() {
  return <>{[1, 2, 3].map((item) => <div className="project-skeleton" key={item}><span /><div><i /><i /></div></div>)}</>
}

function ProjectDetail({ project, onEdit, onDelete, onAddMilestone, onEditMilestone, onDeleteMilestone }: { project: Project; onEdit: () => void; onDelete: () => void; onAddMilestone: () => void; onEditMilestone: (milestone: Milestone) => void; onDeleteMilestone: (milestone: Milestone) => void }) {
  return <div className="detail-content">
    <div className="detail-header"><div className="detail-title"><span className="project-symbol" style={{ background: project.color }}><FolderKanban size={21} /></span><div><div className="detail-kicker"><StatusBadge status={project.status} /><span>Priorité {project.priority.toLowerCase()}</span></div><h2>{project.name}</h2></div></div><div className="detail-actions"><button onClick={onEdit} title="Modifier"><Pencil size={17} /></button><button className="danger" onClick={onDelete} title="Supprimer"><Trash2 size={17} /></button></div></div>
    <p className="project-description">{project.description || 'Aucune description renseignée.'}</p>
    <div className="progress-card"><div><span>Progression globale</span><strong>{project.progress}%</strong></div><div className="large-progress"><span style={{ width: `${project.progress}%`, background: project.color }} /></div></div>
    <div className="project-meta"><div><span>Responsable</span><strong>{project.owner || 'Non assigné'}</strong></div><div><span>Échéance</span><strong>{formatDate(project.targetDate)}</strong></div><div><span>Budget</span><strong>{moneyFormatter.format(project.budget)}</strong></div><div><span>Démarrage</span><strong>{formatDate(project.startDate)}</strong></div></div>
    <div className="milestone-section"><div className="section-heading"><div><span className="eyebrow">Feuille de route</span><h3>Jalons <span>{project.milestones.length}</span></h3></div><button className="secondary-button" onClick={onAddMilestone}><Plus size={16} /> Ajouter</button></div>
      <div className="timeline">
        {project.milestones.length ? project.milestones.map((milestone) => {
          const days = daysUntil(milestone.dueDate)
          const isLate = milestone.status !== 'Terminé' && days !== null && days < 0
          return <article className="milestone" key={milestone.id}><span className={`timeline-dot ${milestone.status === 'Terminé' ? 'done' : isLate ? 'late' : ''}`}>{milestone.status === 'Terminé' ? <Check size={13} /> : null}</span><div className="milestone-card"><div className="milestone-top"><div><StatusBadge status={milestone.status} /><h4>{milestone.title}</h4></div><div className="milestone-actions"><button onClick={() => onEditMilestone(milestone)} title="Modifier"><Pencil size={15} /></button><button onClick={() => onDeleteMilestone(milestone)} title="Supprimer"><Trash2 size={15} /></button></div></div><p>{milestone.description || 'Aucune description.'}</p><div className="milestone-footer"><span><CalendarDays size={14} /> {formatDate(milestone.dueDate)}{isLate ? <em> · en retard</em> : ''}</span><span>{milestone.owner || 'Non assigné'}</span><strong>{milestone.progress}%</strong></div></div></article>
        }) : <div className="empty-milestones"><CalendarDays size={27} /><strong>Aucun jalon pour le moment</strong><p>Découpez le projet en étapes concrètes et datées.</p><button className="text-button" onClick={onAddMilestone}>Ajouter le premier jalon <ArrowRight size={15} /></button></div>}
      </div>
    </div>
  </div>
}

function ModalFrame({ title, subtitle, onClose, children, footer }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return <div className="modal-layer" role="dialog" aria-modal="true"><button className="modal-backdrop" onClick={onClose} aria-label="Fermer" /><div className="modal"><div className="modal-header"><div><span className="eyebrow">Édition</span><h2>{title}</h2><p>{subtitle}</p></div><button onClick={onClose} aria-label="Fermer"><X size={20} /></button></div><div className="modal-body">{children}</div><div className="modal-footer">{footer}</div></div></div>
}

function ProjectModal({ draft, setDraft, editing, saving, onClose, onSave }: { draft: ProjectInput; setDraft: React.Dispatch<React.SetStateAction<ProjectInput>>; editing: boolean; saving: boolean; onClose: () => void; onSave: () => void }) {
  const update = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => setDraft((current) => ({ ...current, [key]: value }))
  return <ModalFrame title={editing ? 'Modifier le projet' : 'Nouveau projet'} subtitle="Centralisez le contexte, les responsabilités et les objectifs." onClose={onClose} footer={<><button className="ghost-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving} onClick={onSave}>{saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer le projet'}</button></>}>
    <div className="form-grid"><label className="field full"><span>Nom du projet *</span><input autoFocus value={draft.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex. Lancement de la nouvelle offre" /></label><label className="field full"><span>Description</span><textarea value={draft.description} onChange={(event) => update('description', event.target.value)} placeholder="Objectif et contexte du projet…" /></label><label className="field"><span>Responsable</span><input value={draft.owner} onChange={(event) => update('owner', event.target.value)} placeholder="Prénom Nom" /></label><label className="field"><span>Catégorie</span><input value={draft.category} onChange={(event) => update('category', event.target.value)} placeholder="Produit, Marketing…" /></label><label className="field"><span>Statut</span><select value={draft.status} onChange={(event) => update('status', event.target.value)}>{projectStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="field"><span>Priorité</span><select value={draft.priority} onChange={(event) => update('priority', event.target.value)}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label><label className="field"><span>Date de début</span><input type="date" value={draft.startDate ?? ''} onChange={(event) => update('startDate', event.target.value || null)} /></label><label className="field"><span>Échéance cible</span><input type="date" value={draft.targetDate ?? ''} onChange={(event) => update('targetDate', event.target.value || null)} /></label><label className="field"><span>Budget (€)</span><input type="number" min="0" value={draft.budget} onChange={(event) => update('budget', Number(event.target.value))} /></label><label className="field"><span>Progression ({draft.progress}%)</span><input type="range" min="0" max="100" value={draft.progress} onChange={(event) => update('progress', Number(event.target.value))} /></label><fieldset className="color-field full"><legend>Couleur du projet</legend>{projectColors.map((color) => <button key={color} type="button" className={draft.color === color ? 'is-selected' : ''} style={{ background: color }} onClick={() => update('color', color)} aria-label={`Choisir la couleur ${color}`}>{draft.color === color && <Check size={15} />}</button>)}</fieldset></div>
  </ModalFrame>
}

function MilestoneModal({ draft, setDraft, editing, saving, onClose, onSave }: { draft: MilestoneInput; setDraft: React.Dispatch<React.SetStateAction<MilestoneInput>>; editing: boolean; saving: boolean; onClose: () => void; onSave: () => void }) {
  const update = <K extends keyof MilestoneInput>(key: K, value: MilestoneInput[K]) => setDraft((current) => ({ ...current, [key]: value }))
  return <ModalFrame title={editing ? 'Modifier le jalon' : 'Nouveau jalon'} subtitle="Ajoutez une étape mesurable à la feuille de route." onClose={onClose} footer={<><button className="ghost-button" onClick={onClose}>Annuler</button><button className="primary-button" disabled={saving} onClick={onSave}>{saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Ajouter le jalon'}</button></>}>
    <div className="form-grid"><label className="field full"><span>Titre du jalon *</span><input autoFocus value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="Ex. Validation du prototype" /></label><label className="field full"><span>Description</span><textarea value={draft.description} onChange={(event) => update('description', event.target.value)} placeholder="Résultat attendu et critères de réussite…" /></label><label className="field"><span>Responsable</span><input value={draft.owner} onChange={(event) => update('owner', event.target.value)} placeholder="Prénom Nom" /></label><label className="field"><span>Échéance</span><input type="date" value={draft.dueDate ?? ''} onChange={(event) => update('dueDate', event.target.value || null)} /></label><label className="field"><span>Statut</span><select value={draft.status} onChange={(event) => update('status', event.target.value)}>{milestoneStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="field"><span>Progression ({draft.progress}%)</span><input type="range" min="0" max="100" value={draft.progress} onChange={(event) => update('progress', Number(event.target.value))} /></label></div>
  </ModalFrame>
}
