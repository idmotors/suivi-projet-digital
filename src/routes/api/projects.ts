import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db/index.js'
import { projects } from '../../../db/schema.js'
import { getProjects, projectValues } from '../../lib/server-projects.js'

export const Route = createFileRoute('/api/projects')({
  server: {
    handlers: {
      GET: async () => Response.json(await getProjects()),
      POST: async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        const values = projectValues(body)
        if (!values.name) return Response.json({ error: 'Le nom du projet est requis.' }, { status: 400 })

        const [project] = await db.insert(projects).values(values).returning()
        return Response.json({ ...project, milestones: [] }, { status: 201 })
      },
    },
  },
})
