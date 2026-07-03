import type { Question, Teaching } from '../content'

// ─────────────────────────────────────────────────────────────────────────
//  Grounding = the accuracy guardrail (handoff §5.3). A 1.5B model will invent
//  psychology "facts" if left free. So we hand it ONLY the vetted facts for the
//  current structure and instruct it to generate scenarios/phrasing around them,
//  never new claims. Output is strict JSON we validate before showing.
// ─────────────────────────────────────────────────────────────────────────

const SYSTEM = `You are an assessment writer for the AP Psychology exam (College Board, redesigned course).
You write ONE multiple-choice question at a time in the official AP style.

STRICT RULES:
- Use ONLY the facts in the "GROUNDING" block. Do NOT introduce any fact, structure, researcher, or number that is not in it.
- The question must be answerable purely from those facts.
- Exactly ONE option is correct. Write 3 plausible but clearly incorrect distractors, each with a one-line rationale for why it is wrong.
- Prefer application/scenario stems over rote definitions.
- Keep it at high-school AP level; do not overstate simplifications as absolute neuroscience.
- Output ONLY minified JSON, no markdown, matching exactly:
{"stem":string,"options":[{"text":string,"correct":boolean,"rationale":string}],"explanation":string,"targetTerm":string}
- "options" must have exactly 4 entries with exactly one "correct":true.`

function grounding(item: Teaching): string {
  const lines = [
    `Structure/Concept: ${item.displayName}`,
    `Core function: ${item.functionShort}`,
    `Detail: ${item.functionDeep}`,
    `AP key terms (use these): ${item.apTerms.join(', ')}`,
  ]
  if (item.misconceptions?.length)
    lines.push(`Common student misconceptions (good distractor fuel): ${item.misconceptions.join(' | ')}`)
  if (item.examTips?.length) lines.push(`Exam tips: ${item.examTips.join(' | ')}`)
  return lines.join('\n')
}

export function buildMessages(item: Teaching, avoidStems: string[] = []) {
  const avoid = avoidStems.length
    ? `\nDo NOT repeat the ideas of these existing questions:\n- ${avoidStems.join('\n- ')}`
    : ''
  return [
    { role: 'system' as const, content: SYSTEM },
    {
      role: 'user' as const,
      content: `GROUNDING:\n${grounding(item)}\n${avoid}\n\nWrite one AP-style multiple-choice question now.`,
    },
  ]
}

interface RawGen {
  stem?: string
  options?: { text?: string; correct?: boolean; rationale?: string }[]
  explanation?: string
  targetTerm?: string
}

/** Parse + validate model output into a Question, or null if malformed. */
export function parseGenerated(raw: string, item: Teaching, apUnit: number): Question | null {
  let obj: RawGen
  try {
    // Models sometimes wrap JSON in prose/fences — extract the first {...} block.
    const match = raw.match(/\{[\s\S]*\}/)
    obj = JSON.parse(match ? match[0] : raw)
  } catch {
    return null
  }

  const stem = obj.stem?.trim()
  const options = (obj.options ?? [])
    .filter((o) => typeof o?.text === 'string' && o.text.trim())
    .map((o) => ({ text: o.text!.trim(), correct: !!o.correct, rationale: o.rationale?.trim() }))

  if (!stem || options.length !== 4) return null
  const correctCount = options.filter((o) => o.correct).length
  if (correctCount !== 1) return null

  return {
    id: `ai-${item.id}-${stem.slice(0, 16).replace(/\W+/g, '')}-${options.length}`,
    type: 'MCQ',
    apUnit,
    contextId: item.id,
    targetTerms: obj.targetTerm ? [obj.targetTerm] : item.apTerms.slice(0, 2),
    stem,
    options,
    explanation: obj.explanation?.trim() || 'See the structure’s description for the reasoning.',
    aiGenerated: true,
  }
}
