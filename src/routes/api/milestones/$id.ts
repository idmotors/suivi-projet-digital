import { createFileRoute } from '@tanstack/react-router'
import { eq } from 'drizzle-orm'
import { db } from '../../../../db/index.js'
import { milestones } from '../../../../db/schema.js'
import { milestoneValues } from '../../../lib/server-projects.js'

export const Route = createFileRoute('/api/milestones/$id')({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        const id = Number(params.id)
        if (!Number.isInteger(id)) return Response.json({ error: 'Jalon invalide.' }, { status: 400 })
        const body = (await request.json()) as Record<string, unknown>
        const values = milestoneValues(body)
        if (!values.title) return Response.json({ error: 'Le titre du jalon est requis.' }, { status: 400 })

        const [milestone] = await db.update(milestones).set(values).where(eq(milestones.id, id)).returning()
        if (!milestone) return Response.json({ error: 'Jalon introuvable.' }, { status: 404 })
        return Response.json(milestone)
      },
      DELETE: async ({ params }) => {
        const id = Number(params.id)
        if (!Number.isInteger(id)) return Response.json({ error: 'Jalon invalide.' }, { status: 400 })
        const [deleted] = await db.delete(milestones).where(eq(milestones.id, id)).returning({ id: milestones.id })
        if (!deleted) return Response.json({ error: 'Jalon introuvable.' }, { status: 404 })
        return new Response(null, { status: 204 })
      },
    },
  },
})
