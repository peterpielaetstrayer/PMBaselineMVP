import { z } from 'zod'

export const BaselineModeSchema = z.enum(['stabilize', 'rebuild', 'maintain', 'expand'])

export const SafetyLevelSchema = z.enum(['standard', 'support', 'urgent'])

export const ActionDomainSchema = z.enum([
  'safety',
  'recovery',
  'nutrition',
  'hydration',
  'movement',
  'regulation',
  'work',
  'environment',
  'connection',
  'custom',
])

export const BasicNeedStatusSchema = z.enum(['met', 'partial', 'unmet', 'unknown'])

export const ScoreSchema = z.number().int().min(0).max(10)

export const SleepScoreSchema = ScoreSchema.nullable()

export const InterpretationSourceSchema = z.enum(['fallback', 'ai', 'hybrid'])

export const UserDispositionSchema = z.enum(['accepted', 'edited', 'rejected'])

export const ActionSourceSchema = z.enum(['primary', 'alternative', 'user', 'fallback'])

export const ActionStatusSchema = z.enum([
  'accepted',
  'modified',
  'completed',
  'skipped',
  'cancelled',
])

export const ReflectionEffectSchema = z.enum(['helped', 'neutral', 'hurt', 'unknown'])

export const ReasonCodeSchema = z.enum([
  'URGENT_SAFETY_OVERRIDE',
  'SUPPORT_LEVEL_PRESENT',
  'UNMET_BASIC_NEEDS',
  'PARTIAL_BASIC_NEEDS',
  'HIGH_STRESS_LOW_ENERGY',
  'VERY_HIGH_STRESS',
  'VERY_LOW_ENERGY',
  'LOW_PHYSICAL_AND_MENTAL',
  'POOR_SLEEP',
  'URGENT_OBLIGATION_LOW_CAPACITY',
  'STRONG_STABLE_CAPACITY',
  'MODERATE_STABLE_CAPACITY',
  'CONTRADICTORY_SIGNALS',
  'INSUFFICIENT_INFORMATION',
  'DEFAULT_REBUILD',
])
