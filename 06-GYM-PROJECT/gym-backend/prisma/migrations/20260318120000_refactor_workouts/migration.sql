-- Drop legacy execution tables (FK order)
DROP TABLE IF EXISTS "set_informations";
DROP TABLE IF EXISTS "set_executions";
DROP TABLE IF EXISTS "exercise_executions";

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "notes" TEXT,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_blocks" (
    "id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "block_type" TEXT NOT NULL DEFAULT 'SINGLE',
    "notes" TEXT,

    CONSTRAINT "workout_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "id" TEXT NOT NULL,
    "workout_block_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_sets" (
    "id" TEXT NOT NULL,
    "workout_exercise_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "reps" INTEGER,
    "weight" DOUBLE PRECISION,
    "duration_seconds" INTEGER,
    "distance" DOUBLE PRECISION,
    "intensity_type" TEXT DEFAULT 'REGULAR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_workout_block_order" ON "workout_blocks"("workout_id", "sequence");

-- CreateIndex
CREATE INDEX "idx_block_exercise_order" ON "workout_exercises"("workout_block_id", "sequence");

-- CreateIndex
CREATE INDEX "idx_exercise_set_order" ON "exercise_sets"("workout_exercise_id", "sequence");

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_blocks" ADD CONSTRAINT "workout_blocks_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_block_id_fkey" FOREIGN KEY ("workout_block_id") REFERENCES "workout_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
