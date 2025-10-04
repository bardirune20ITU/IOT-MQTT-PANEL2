import Mustache from 'mustache'
import { JSONPath } from 'jsonpath-plus'
import type { AnimationSpec, StateRule, VisualState, WidgetCommonConfig } from '@/core/types'

export interface EvaluateOptions {
  parseAsJson?: boolean
  jsonPath?: string
  valueTemplate?: string
  valueTransformJs?: string
  sandboxEnabled?: boolean
  defaultState?: VisualState
}

export interface EvaluateResult {
  valueRaw: unknown
  valueTransformed: unknown
  matchedRule?: StateRule
  visual: VisualState
}

function coerceRegex(input: string | number | { regex: string; flags?: string }): RegExp | null {
  if (typeof input === 'number') return new RegExp(`^${input}$`)
  if (typeof input === 'string') {
    // Support /pattern/flags literal
    if (input.startsWith('/') && input.lastIndexOf('/') > 0) {
      const last = input.lastIndexOf('/')
      const pattern = input.slice(1, last)
      const flags = input.slice(last + 1)
      try {
        return new RegExp(pattern, flags)
      } catch {
        return null
      }
    }
    // exact string, case-insensitive
    return new RegExp(`^${escapeRegex(input)}$`, 'i')
  }
  try {
    return new RegExp(input.regex, input.flags)
  } catch {
    return null
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function tryParseJson(input: unknown): unknown {
  if (typeof input !== 'string') return input
  try {
    return JSON.parse(input)
  } catch {
    return input
  }
}

function extractJsonPath(value: unknown, jsonPath?: string): unknown {
  if (!jsonPath) return value
  try {
    const result = JSONPath({ path: jsonPath as any, json: value as any } as any)
    if (Array.isArray(result)) return result[0]
    return result
  } catch {
    return undefined
  }
}

function applyTemplate(value: unknown, template?: string): unknown {
  if (!template) return value
  try {
    return Mustache.render(template, { value })
  } catch {
    return value
  }
}

function applySandbox(value: unknown, code?: string, enabled?: boolean): unknown {
  if (!enabled || !code) return value
  try {
    // Extremely restricted sandbox: only value in scope
    // eslint-disable-next-line no-new-func
    const fn = new Function('value', `'use strict'; ${code}; return typeof transform === 'function' ? transform(value) : value;`)
    return fn(value)
  } catch {
    return value
  }
}

export function evaluateState(
  incoming: unknown,
  rules: StateRule[] | undefined,
  options: EvaluateOptions
): EvaluateResult {
  const defaultVisual: VisualState = options.defaultState ?? { label: 'Unknown' }
  const valueRaw = options.parseAsJson ? tryParseJson(incoming) : incoming
  const extracted = options.parseAsJson ? extractJsonPath(valueRaw, options.jsonPath) : incoming
  const templated = applyTemplate(extracted, options.valueTemplate)
  const valueTransformed = applySandbox(templated, options.valueTransformJs, options.sandboxEnabled)

  let matchedRule: StateRule | undefined
  if (rules && rules.length > 0) {
    for (const rule of rules) {
      const rx = coerceRegex(rule.match)
      const asString = String(valueTransformed)
      if (rx && rx.test(asString)) {
        matchedRule = rule
        break
      }
      // numeric comparison if both are numeric-like
      const numericIncoming = Number(asString)
      if (!Number.isNaN(numericIncoming) && typeof rule.match === 'number') {
        if (numericIncoming === rule.match) {
          matchedRule = rule
          break
        }
      }
    }
  }

  const visual: VisualState = matchedRule
    ? {
        icon: matchedRule.icon ?? defaultVisual.icon,
        color: matchedRule.color ?? defaultVisual.color,
        label: matchedRule.label ?? defaultVisual.label,
        ariaLabel: matchedRule.ariaLabel ?? defaultVisual.ariaLabel,
        animation: matchedRule.animation ?? defaultVisual.animation,
      }
    : defaultVisual

  return { valueRaw, valueTransformed, matchedRule, visual }
}

export function buildEvaluateOptionsFromConfig(cfg: WidgetCommonConfig): EvaluateOptions {
  return {
    parseAsJson: cfg.parseAsJson,
    jsonPath: cfg.jsonPath,
    valueTemplate: cfg.valueTemplate,
    valueTransformJs: cfg.valueTransformJs,
    sandboxEnabled: cfg.sandboxEnabled,
    defaultState: cfg.defaultState,
  }
}

export function animationToStyle(anim?: AnimationSpec): React.CSSProperties {
  if (!anim || anim.type === 'none') return {}
  return { ['--icon-speed' as any]: String(anim.speed ?? 1) }
}
