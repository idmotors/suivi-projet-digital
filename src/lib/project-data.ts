export const projectStatuses = ['Planifié', 'En cours', 'En pause', 'Terminé'] as const
export const milestoneStatuses = ['À venir', 'En cours', 'Bloqué', 'Terminé'] as const
export const priorities = ['Basse', 'Moyenne', 'Haute', 'Critique'] as const
export const projectColors = ['#f05a28', '#7357d9', '#1f9d78', '#2777d3', '#d44573', '#cb8b18'] as const

export type Milestone = {
  id: number
  projectId: number
  title: string
  description: string
  owner: string
  status: string
  dueDate: string | null
  progress: number
  createdAt: string
  updatedAt: string
}

export type Project = {
  id: number
  name: string
  description: string
  owner: string
  category: string
  status: string
  priority: string
  color: string
  startDate: string | null
  targetDate: string | null
  budget: number
  progress: number
  createdAt: string
  updatedAt: string
  milestones: Milestone[]
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'milestones'>
export type MilestoneInput = Omit<Milestone, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>

export const emptyProject: ProjectInput = {
  name: '',
  description: '',
  owner: '',
  category: 'Produit',
  status: 'Planifié',
  priority: 'Moyenne',
  color: projectColors[0],
  startDate: null,
  targetDate: null,
  budget: 0,
  progress: 0,
}

export const emptyMilestone: MilestoneInput = {
  title: '',
  description: '',
  owner: '',
  status: 'À venir',
  dueDate: null,
  progress: 0,
}
