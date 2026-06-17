-- CreateTable
CREATE TABLE "muscle_groups" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "muscle_groups_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN "muscle_group_id" TEXT;

INSERT INTO "muscle_groups" ("id", "label", "updated_at") VALUES
    ('chest', 'Peito', CURRENT_TIMESTAMP),
    ('back', 'Costas', CURRENT_TIMESTAMP),
    ('shoulders', 'Ombros', CURRENT_TIMESTAMP),
    ('biceps', 'Bíceps', CURRENT_TIMESTAMP),
    ('triceps', 'Tríceps', CURRENT_TIMESTAMP),
    ('legs', 'Pernas', CURRENT_TIMESTAMP),
    ('glutes', 'Glúteos', CURRENT_TIMESTAMP),
    ('core', 'Core', CURRENT_TIMESTAMP),
    ('cardio', 'Cardio', CURRENT_TIMESTAMP),
    ('full_body', 'Corpo inteiro', CURRENT_TIMESTAMP),
    ('other', 'Outro', CURRENT_TIMESTAMP);

UPDATE "exercises" SET "muscle_group_id" = "muscle_group";

ALTER TABLE "exercises" ALTER COLUMN "muscle_group_id" SET NOT NULL;
ALTER TABLE "exercises" DROP COLUMN "muscle_group";

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_muscle_group_id_fkey" FOREIGN KEY ("muscle_group_id") REFERENCES "muscle_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
