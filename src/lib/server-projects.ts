import { asc, eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { milestones, projects } from '../../db/schema.js'

type JsonRecord = Record<string, unknown>

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 5000) : fallback
}

function number(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback
}

function date(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

export function projectValues(body: JsonRecord) {
  return {
    name: text(body.name),
    description: text(body.description),
    owner: text(body.owner),
    category: text(body.category, 'Produit') || 'Produit',
    status: text(body.status, 'Planifié') || 'Planifié',
    priority: text(body.priority, 'Moyenne') || 'Moyenne',
    color: /^#[0-9a-f]{6}$/i.test(text(body.color)) ? text(body.color) : '#f05a28',
    startDate: date(body.startDate),
    targetDate: date(body.targetDate),
    budget: Math.max(0, number(body.budget)),
    progress: Math.min(100, Math.max(0, number(body.progress))),
    updatedAt: new Date(),
  }
}

export function milestoneValues(body: JsonRecord) {
  return {
    title: text(body.title),
    description: text(body.description),
    owner: text(body.owner),
    status: text(body.status, 'À venir') || 'À venir',
    dueDate: date(body.dueDate),
    progress: Math.min(100, Math.max(0, number(body.progress))),
    updatedAt: new Date(),
  }
}

export async function getProjects() {
  const projectRows = await db.select().from(projects).orderBy(asc(projects.targetDate), asc(projects.id))
  const milestoneRows = await db.select().from(milestones).orderBy(asc(milestones.dueDate), asc(milestones.id))

  return projectRows.map((project) => ({
    ...project,
    milestones: milestoneRows.filter((milestone) => milestone.projectId === project.id),
  }))
}

export async function projectExists(id: number) {
  const [project] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, id)).limit(1)
  return Boolean(project)
}
