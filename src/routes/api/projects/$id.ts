import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { db } from '../../../../db/index.js'
import { projects } from '../../../../db/schema.js'
import { projectValues } from '../../../lib/server-projects.js'

export const Route = createFileRoute('/api/projects/$id')({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const id = Number(params.id)
        if (!Number.isInteger(id)) return Response.json({ error: 'Projet invalide.' }, { status: 400 })
        const body = (await request.json()) as Record<string, unknown>
        const values = projectValues(body)
        if (!values.name) return Response.json({ error: 'Le nom du projet est requis.' }, { status: 400 })

        const [project] = await db.update(projects).set(values).where(eq(projects.id, id)).returning()
        if (!project) return Response.json({ error: 'Projet introuvable.' }, { status: 404 })
        return Response.json(project)
      },
      DELETE: async ({ params }) => {
        const id = Number(params.id)
        if (!Number.isInteger(id)) return Response.json({ error: 'Projet invalide.' }, { status: 400 })
        const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id })
        if (!deleted) return Response.json({ error: 'Projet introuvable.' }, { status: 404 })
        return new Response(null, { status: 204 })
      },
    },
  },
})
