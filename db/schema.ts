import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: serial().primaryKey(),
  name: text().notNull(),
  description: text().notNull().default(''),
  owner: text().notNull().default(''),
  category: text().notNull().default('Produit'),
  status: text().notNull().default('En cours'),
  priority: text().notNull().default('Moyenne'),
  color: text().notNull().default('#f05a28'),
  startDate: date('start_date'),
  targetDate: date('target_date'),
  budget: integer().notNull().default(0),
  progress: integer().notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const milestones = pgTable('milestones', {
  id: serial().primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  title: text().notNull(),
  description: text().notNull().default(''),
  owner: text().notNull().default(''),
  status: text().notNull().default('À venir'),
  dueDate: date('due_date'),
  progress: integer().notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Project = typeof projects.$inferSelect
export type Milestone = typeof milestones.$inferSelect
