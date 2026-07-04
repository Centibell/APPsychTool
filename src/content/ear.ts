import type { EarStructure } from './types'

// ─────────────────────────────────────────────────────────────────────────
//  The ear — Unit 1, Sensation (audition). Same drill-down treatment as the
//  eye. Sound is funneled in, transduced in the cochlea, and the auditory
//  nerve links straight into the temporal lobe's auditory cortex. The cochlea
//  groups the three AP theories of pitch perception: place, frequency, volley.
// ─────────────────────────────────────────────────────────────────────────

export const EAR_STRUCTURES: EarStructure[] = [
  {
    id: 'ear-pinna',
    displayName: 'Outer Ear (Pinna)',
    detailLevel: 1,
    oneLiner: 'Funnels sound waves into the ear.',
    functionShort:
      'The pinna is the visible outer ear that collects sound waves and channels them into the ear canal.',
    functionDeep:
      'Its curved shape gathers sound and helps you locate where a sound is coming from. Sound waves it collects travel down the ear canal toward the eardrum.',
    apUnits: [1],
    apTerms: ['pinna', 'outer ear', 'sound waves'],
    relatedIds: ['ear-eardrum'],
  },
  {
    id: 'ear-eardrum',
    displayName: 'Eardrum',
    detailLevel: 1,
    oneLiner: 'A membrane that vibrates with sound.',
    functionShort:
      'The eardrum (tympanic membrane) is a tight membrane that vibrates when sound waves hit it.',
    functionDeep:
      'These vibrations pass to the three tiny bones of the middle ear. Damage to the eardrum or middle ear causes conduction deafness — the mechanical system can’t pass sound along.',
    apUnits: [1],
    apTerms: ['eardrum', 'tympanic membrane', 'conduction deafness'],
    relatedIds: ['ear-ossicles', 'ear-pinna'],
  },
  {
    id: 'ear-ossicles',
    displayName: 'Ossicles (Middle Ear)',
    detailLevel: 1,
    oneLiner: 'Three tiny bones that amplify vibration.',
    functionShort:
      'The ossicles — hammer, anvil, and stirrup — are three tiny bones that amplify the eardrum’s vibrations and pass them to the cochlea.',
    functionDeep:
      'This lever system concentrates sound energy onto the small oval window of the cochlea, boosting the vibrations enough to move the fluid inside the inner ear.',
    apUnits: [1],
    apTerms: ['ossicles', 'hammer', 'anvil', 'stirrup', 'middle ear'],
    relatedIds: ['ear-eardrum', 'ear-cochlea'],
    mnemonic: 'Hammer → Anvil → Stirrup (the middle-ear relay).',
  },
  {
    id: 'ear-cochlea',
    displayName: 'Cochlea',
    detailLevel: 1,
    childIds: ['ear-hair-cells', 'ear-place-theory', 'ear-frequency-theory', 'ear-volley-theory'],
    oneLiner: 'The coiled inner ear where transduction happens.',
    functionShort:
      'The cochlea is the fluid-filled, coiled tube of the inner ear where sound vibrations are transduced into neural signals.',
    functionDeep:
      'Vibrations ripple through the cochlear fluid, bending hair cells on the basilar membrane. This is auditory transduction — mechanical energy becomes neural impulses that travel up the auditory nerve. How the cochlea encodes pitch is explained by place, frequency, and volley theory.',
    apUnits: [1],
    apTerms: ['cochlea', 'basilar membrane', 'transduction', 'inner ear'],
    relatedIds: ['ear-hair-cells', 'ear-auditory-nerve', 'auditory-cortex'],
    examTips: ['Transduction of sound happens in the cochlea (inner ear).'],
  },
  {
    id: 'ear-hair-cells',
    displayName: 'Hair Cells',
    detailLevel: 2,
    parentId: 'ear-cochlea',
    oneLiner: 'The receptor cells that convert vibration to signals.',
    functionShort:
      'Hair cells sit on the basilar membrane; when the cochlear fluid bends them, they fire neural signals — the actual transduction of sound.',
    functionDeep:
      'There are only about 16,000 hair cells per ear, and they don’t regenerate — loud noise that destroys them causes permanent sensorineural (nerve) deafness. Their location along the membrane helps code a sound’s pitch (place theory).',
    apUnits: [1],
    apTerms: ['hair cells', 'basilar membrane', 'sensorineural deafness', 'transduction'],
    relatedIds: ['ear-cochlea', 'ear-place-theory'],
    misconceptions: ['Hair cells don’t grow back — loud-noise damage (sensorineural deafness) is permanent.'],
  },
  {
    id: 'ear-place-theory',
    displayName: 'Place Theory',
    detailLevel: 2,
    parentId: 'ear-cochlea',
    oneLiner: 'Pitch = which place on the membrane vibrates.',
    functionShort:
      'Place theory says we sense a sound’s pitch by which location on the basilar membrane (and which hair cells) vibrates most.',
    functionDeep:
      'High-pitched sounds peak near the stiff base of the cochlea; the apex responds to lower tones. Place theory explains high-frequency pitches well but struggles with very low ones, where the whole membrane moves.',
    apUnits: [1],
    apTerms: ['place theory', 'basilar membrane', 'pitch perception'],
    relatedIds: ['ear-frequency-theory', 'ear-volley-theory', 'ear-hair-cells'],
    examTips: ['Place theory = WHERE the membrane vibrates. Best for HIGH pitches.'],
  },
  {
    id: 'ear-frequency-theory',
    displayName: 'Frequency Theory',
    detailLevel: 2,
    parentId: 'ear-cochlea',
    oneLiner: 'Pitch = how fast the neurons fire.',
    functionShort:
      'Frequency theory says pitch is coded by the rate of neural firing: the auditory nerve fires at the same frequency as the sound wave.',
    functionDeep:
      'A 100 Hz tone makes the nerve fire 100 times per second. This explains low pitches well, but neurons can’t fire faster than about 1000 times per second, so it fails for higher tones on its own.',
    apUnits: [1],
    apTerms: ['frequency theory', 'pitch perception', 'neural firing rate'],
    relatedIds: ['ear-place-theory', 'ear-volley-theory'],
    examTips: ['Frequency theory = firing RATE matches the sound. Best for LOW pitches.'],
  },
  {
    id: 'ear-volley-theory',
    displayName: 'Volley Theory',
    detailLevel: 2,
    parentId: 'ear-cochlea',
    oneLiner: 'Neurons take turns firing to code high pitches.',
    functionShort:
      'Volley theory says groups of neurons fire in alternating volleys — taking turns — so their combined rate can encode pitches too fast for any single neuron.',
    functionDeep:
      'Because one neuron maxes out near 1000 firings per second, teams of neurons fire out of phase, like soldiers firing volleys in rotation. Together they signal frequencies well above what one neuron could — bridging the gap between frequency and place theory in the middle range.',
    apUnits: [1],
    apTerms: ['volley theory', 'volley principle', 'pitch perception'],
    relatedIds: ['ear-frequency-theory', 'ear-place-theory'],
    examTips: ['Volley theory = neurons TAKE TURNS firing so the group beats the ~1000/sec single-neuron limit.'],
  },
  {
    id: 'ear-auditory-nerve',
    displayName: 'Auditory Nerve',
    detailLevel: 1,
    jumpToRegionId: 'auditory-cortex',
    oneLiner: 'Carries sound from ear to brain — follow it to the cortex.',
    functionShort:
      'The auditory nerve carries the neural signals from the cochlea’s hair cells toward the brain.',
    functionDeep:
      'Signals travel from the auditory nerve through the thalamus to the auditory cortex in the temporal lobe, where pitch and loudness are interpreted. That final stop — not the ear — is where you actually "hear." Follow this nerve to jump into the auditory cortex.',
    apUnits: [1],
    apTerms: ['auditory nerve', 'auditory pathway', 'auditory cortex'],
    relatedIds: ['auditory-cortex', 'temporal-lobe', 'thalamus', 'ear-cochlea'],
    examTips: ['Auditory pathway: cochlea → auditory nerve → thalamus → auditory cortex (temporal lobe).'],
  },
]
