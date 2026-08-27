CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"owner" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'À venir' NOT NULL,
	"due_date" date,
	"progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"owner" text DEFAULT '' NOT NULL,
	"category" text DEFAULT 'Produit' NOT NULL,
	"status" text DEFAULT 'En cours' NOT NULL,
	"priority" text DEFAULT 'Moyenne' NOT NULL,
	"color" text DEFAULT '#f05a28' NOT NULL,
	"start_date" date,
	"target_date" date,
	"budget" integer DEFAULT 0 NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;
--> statement-breakpoint
INSERT INTO "projects" ("name", "description", "owner", "category", "status", "priority", "color", "start_date", "target_date", "budget", "progress") VALUES
('Refonte de la plateforme', 'Moderniser le parcours principal et unifier l’expérience sur tous les écrans.', 'Camille Martin', 'Produit', 'En cours', 'Haute', '#f05a28', '2026-07-15', '2026-10-30', 85000, 58),
('Lancement marché Benelux', 'Préparer l’offre, les partenaires et la campagne de lancement régional.', 'Nora Petit', 'Go-to-market', 'En cours', 'Critique', '#7357d9', '2026-08-01', '2026-12-15', 120000, 34),
('Programme qualité 2026', 'Réduire les incidents récurrents et formaliser les standards de livraison.', 'Julien Moreau', 'Opérations', 'Planifié', 'Moyenne', '#1f9d78', '2026-09-01', '2027-01-31', 42000, 12);
--> statement-breakpoint
INSERT INTO "milestones" ("project_id", "title", "description", "owner", "status", "due_date", "progress") VALUES
(1, 'Validation des parcours', 'Arbitrage final avec les équipes métier et produit.', 'Camille Martin', 'Terminé', '2026-08-18', 100),
(1, 'Prototype haute fidélité', 'Finaliser les écrans critiques et le prototype testable.', 'Lina Roux', 'En cours', '2026-09-10', 72),
(1, 'Mise en production', 'Déploiement progressif et suivi des indicateurs.', 'Yanis Bernard', 'À venir', '2026-10-30', 0),
(2, 'Sélection des partenaires', 'Qualifier les partenaires commerciaux prioritaires.', 'Nora Petit', 'En cours', '2026-09-18', 55),
(2, 'Kit de lancement localisé', 'Adapter les contenus pour les trois marchés.', 'Emma Dubois', 'À venir', '2026-10-20', 20),
(3, 'Cartographie des incidents', 'Analyser les causes et prioriser les chantiers.', 'Julien Moreau', 'À venir', '2026-09-30', 10);
