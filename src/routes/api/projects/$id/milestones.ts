import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../../../db/index.js'
import { milestones } from '../../../../../db/schema.js'
import { milestoneValues, projectExists } from '../../../../lib/server-projects.js'

export const Route = createFileRoute('/api/projects/$id/milestones')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const projectId = Number(params.id)
        if (!Number.isInteger(projectId) || !(await projectExists(projectId))) {
          return Response.json({ error: 'Projet introuvable.' }, { status: 404 })
        }

        const body = (await request.json()) as Record<string, unknown>
        const values = milestoneValues(body)
        if (!values.title) return Response.json({ error: 'Le titre du jalon est requis.' }, { status: 400 })

        const [milestone] = await db.insert(milestones).values({ ...values, projectId }).returning()
        return Response.json(milestone, { status: 201 })
      },
    },
  },
})
