# Jalons

Jalons est un outil en ligne de pilotage multi-projets. Il centralise l’avancement, les responsables, les budgets, les priorités, les échéances et les jalons dans une interface claire et responsive.

## Fonctionnalités

- création, modification et suppression de projets ;
- création, modification et suppression des jalons associés ;
- suivi de la progression, du statut, de la priorité et des dates ;
- recherche et filtrage du portefeuille ;
- indicateurs de synthèse et détection des jalons en retard ;
- stockage persistant dans Netlify Database.

## Technologies

- TanStack Start et React 19 ;
- TypeScript et Vite ;
- Tailwind CSS 4 pour le pipeline CSS, complété par un design system personnalisé ;
- Netlify Database (Postgres) avec Drizzle ORM ;
- API server-side via les routes TanStack Start déployées sur Netlify.

## Lancer localement

```bash
pnpm install
netlify dev --port 8889
```

L’application est alors disponible sur `http://localhost:8889`. La base Netlify est provisionnée automatiquement lors de la première connexion dans l’environnement Netlify.

## Base de données

Le schéma se trouve dans `db/schema.ts`. Après toute modification :

```bash
pnpm exec drizzle-kit generate --name add_example_field
```

Les migrations générées dans `netlify/database/migrations/` sont appliquées automatiquement au déploiement.
