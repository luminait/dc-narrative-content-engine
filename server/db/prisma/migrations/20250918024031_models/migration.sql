-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('client', 'admin');

-- CreateEnum
CREATE TYPE "public"."Weekdays" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "public"."EventCadence" AS ENUM ('daily', 'weekly', 'monthly');

-- CreateEnum
CREATE TYPE "public"."PostType" AS ENUM ('single_image', 'video', 'carousel');

-- CreateEnum
CREATE TYPE "public"."CaptionLength" AS ENUM ('short', 'medium', 'long');

-- CreateEnum
CREATE TYPE "public"."MoralAlignment" AS ENUM ('Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil');

-- CreateEnum
CREATE TYPE "public"."MergeFieldValueType" AS ENUM ('image', 'text', 'video', 'audio_voice', 'audio_music', 'gen_ai_image', 'gen_ai_text', 'gen_ai_video', 'gen_ai_voice', 'gen_ai_music', 'image_or_video');

-- CreateEnum
CREATE TYPE "public"."MergeFieldType" AS ENUM ('text', 'character', 'environment', 'music', 'voiceover', 'sfx', 'luma_matte');

-- CreateTable
CREATE TABLE "public"."campaigns" (
    "id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "campaign_objective" TEXT NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,
    "days_of_week" "public"."Weekdays"[],
    "frequency" "public"."EventCadence",
    "post_type" "public"."PostType" NOT NULL DEFAULT 'single_image',
    "post_caption_length" "public"."CaptionLength" NOT NULL DEFAULT 'short',
    "post_video_length" INTEGER,
    "start_date" DATE,
    "end_date" DATE,
    "narrative_context" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users_and_roles" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,
    "user_id" UUID NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'client',

    CONSTRAINT "users_and_roles_pkey" PRIMARY KEY ("id","user_id")
);

-- CreateTable
CREATE TABLE "public"."characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,
    "is_human" BOOLEAN DEFAULT false,
    "is_trainer" BOOLEAN DEFAULT false,
    "character_types" TEXT,
    "personality" TEXT,
    "height_centimeters" INTEGER,
    "weight_grams" INTEGER,
    "moral_alignment" "public"."MoralAlignment",

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaigns_characters" (
    "campaign_id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,

    CONSTRAINT "campaigns_characters_pkey" PRIMARY KEY ("campaign_id","character_id")
);

-- CreateTable
CREATE TABLE "public"."personas" (
    "key" SERIAL NOT NULL,
    "label" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."campaigns_personas" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "persona_key" INTEGER,

    CONSTRAINT "campaigns_personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."character_assets" (
    "id" TEXT NOT NULL,
    "character_id" TEXT,
    "asset_ref" UUID NOT NULL,
    "label" TEXT,
    "attributes" JSONB,
    "is_primary" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "character_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."objects" (
    "id" UUID NOT NULL,

    CONSTRAINT "objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shotstack_merge_fields" (
    "id" TEXT NOT NULL,
    "merge_field" TEXT NOT NULL,
    "description" TEXT,
    "media_value_type" "public"."MergeFieldValueType" NOT NULL DEFAULT 'image',
    "start_time" DECIMAL(65,30),
    "end_time" DECIMAL(65,30),
    "campaign_id" TEXT NOT NULL,
    "merge_field_type" "public"."MergeFieldType",
    "default_value" TEXT,

    CONSTRAINT "shotstack_merge_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shotstack_renders" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "status" TEXT,
    "url" TEXT,
    "campaign_id" TEXT,

    CONSTRAINT "shotstack_renders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_and_roles_email_key" ON "public"."users_and_roles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_and_roles_user_id_key" ON "public"."users_and_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_personas_campaign_id_persona_key_key" ON "public"."campaigns_personas"("campaign_id", "persona_key");

-- CreateIndex
CREATE UNIQUE INDEX "shotstack_merge_fields_campaign_id_merge_field_key" ON "public"."shotstack_merge_fields"("campaign_id", "merge_field");

-- AddForeignKey
ALTER TABLE "public"."campaigns" ADD CONSTRAINT "campaigns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users_and_roles"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users_and_roles" ADD CONSTRAINT "users_and_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns_characters" ADD CONSTRAINT "campaigns_characters_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns_characters" ADD CONSTRAINT "campaigns_characters_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns_personas" ADD CONSTRAINT "campaigns_personas_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns_personas" ADD CONSTRAINT "campaigns_personas_persona_key_fkey" FOREIGN KEY ("persona_key") REFERENCES "public"."personas"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_assets" ADD CONSTRAINT "character_assets_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_assets" ADD CONSTRAINT "character_assets_asset_ref_fkey" FOREIGN KEY ("asset_ref") REFERENCES "public"."objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shotstack_merge_fields" ADD CONSTRAINT "shotstack_merge_fields_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shotstack_renders" ADD CONSTRAINT "shotstack_renders_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shotstack_renders" ADD CONSTRAINT "shotstack_renders_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
