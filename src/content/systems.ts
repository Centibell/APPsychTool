import type { SystemId, SystemMeta } from './types'

// Hexes mirror the `sys.*` tokens in tailwind.config.js. Keep them in sync:
// Tailwind styles the DOM, these style the WebGL scene.
export const SYSTEMS: Record<SystemId, SystemMeta> = {
  'cortex-frontal': {
    id: 'cortex-frontal',
    label: 'Frontal Lobe',
    colorToken: 'frontal',
    hex: '#6ee7b7',
    description: 'Executive function, voluntary movement, personality, speech production.',
  },
  'cortex-parietal': {
    id: 'cortex-parietal',
    label: 'Parietal Lobe',
    colorToken: 'parietal',
    hex: '#93c5fd',
    description: 'Touch, body position, and spatial processing (somatosensory cortex).',
  },
  'cortex-temporal': {
    id: 'cortex-temporal',
    label: 'Temporal Lobe',
    colorToken: 'temporal',
    hex: '#fca5a5',
    description: 'Hearing, language comprehension, and memory encoding.',
  },
  'cortex-occipital': {
    id: 'cortex-occipital',
    label: 'Occipital Lobe',
    colorToken: 'occipital',
    hex: '#c4b5fd',
    description: 'Visual processing — the destination of the visual pathway.',
  },
  limbic: {
    id: 'limbic',
    label: 'Limbic System',
    colorToken: 'limbic',
    hex: '#f0abfc',
    description: 'Emotion, memory, and motivation — hippocampus, amygdala, and more.',
  },
  brainstem: {
    id: 'brainstem',
    label: 'Brainstem',
    colorToken: 'brainstem',
    hex: '#fcd34d',
    description: 'Arousal and life-support: breathing, heart rate, sleep-wake.',
  },
  cerebellum: {
    id: 'cerebellum',
    label: 'Cerebellum',
    colorToken: 'cerebellum',
    hex: '#5eead4',
    description: 'Balance, coordination, and procedural (muscle) memory.',
  },
  deep: {
    id: 'deep',
    label: 'Deep Structures',
    colorToken: 'deep',
    hex: '#fdba74',
    description: 'Relay and regulation: thalamus, hypothalamus, basal ganglia.',
  },
  cellular: {
    id: 'cellular',
    label: 'Cellular / Schematic',
    colorToken: 'neural',
    hex: '#22d3ee',
    description: 'Where anatomy gives way to diagrams: neuron, synapse, neurotransmitters.',
  },
  eye: {
    id: 'eye',
    label: 'The Eye',
    colorToken: 'neural',
    hex: '#54e3fb',
    description: 'Sensation & perception — how light becomes sight.',
  },
}

export const systemColor = (id: SystemId): string => SYSTEMS[id].hex
