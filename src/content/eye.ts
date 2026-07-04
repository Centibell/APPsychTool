import type { EyeStructure } from './types'

// ─────────────────────────────────────────────────────────────────────────
//  The eye — Unit 1, Sensation & Perception. Same drill-down treatment as the
//  brain. The optic nerve links straight into the occipital lobe's visual
//  cortex, reinforcing the visual pathway as one continuous system.
// ─────────────────────────────────────────────────────────────────────────

export const EYE_STRUCTURES: EyeStructure[] = [
  {
    id: 'eye-cornea',
    displayName: 'Cornea',
    detailLevel: 1,
    oneLiner: 'The clear front window that bends incoming light.',
    functionShort:
      'The cornea is the transparent outer layer that protects the eye and begins focusing light as it enters.',
    functionDeep:
      'Light first passes through the cornea, which does most of the eye’s bending (refraction) before the lens fine-tunes the focus. Its shape matters: an irregular cornea causes astigmatism.',
    apUnits: [1],
    apTerms: ['cornea', 'refraction'],
    relatedIds: ['eye-lens', 'eye-pupil'],
  },
  {
    id: 'eye-pupil',
    displayName: 'Pupil',
    detailLevel: 1,
    oneLiner: 'The adjustable opening that lets light in.',
    functionShort:
      'The pupil is the opening in the center of the eye whose size controls how much light enters.',
    functionDeep:
      'The pupil widens in dim light and narrows in bright light. It also dilates with arousal and emotion — a link to the autonomic nervous system.',
    apUnits: [1],
    apTerms: ['pupil'],
    relatedIds: ['eye-iris', 'eye-cornea'],
  },
  {
    id: 'eye-iris',
    displayName: 'Iris',
    detailLevel: 1,
    oneLiner: 'The colored muscle that resizes the pupil.',
    functionShort:
      'The iris is the colored ring of muscle that adjusts the size of the pupil to regulate incoming light.',
    functionDeep:
      'By contracting and relaxing, the iris controls the pupil’s diameter, balancing enough light for vision against protecting the retina from glare.',
    apUnits: [1],
    apTerms: ['iris'],
    relatedIds: ['eye-pupil'],
  },
  {
    id: 'eye-lens',
    displayName: 'Lens',
    detailLevel: 1,
    oneLiner: 'Focuses light through accommodation.',
    functionShort:
      'The lens changes shape to focus light onto the retina — a process called accommodation.',
    functionDeep:
      'To focus on near objects the lens thickens; for distant objects it flattens. If the eyeball shape throws the image off the retina, the result is nearsightedness (image lands short) or farsightedness (image lands long).',
    apUnits: [1],
    apTerms: ['lens', 'accommodation', 'nearsightedness', 'farsightedness'],
    relatedIds: ['eye-cornea', 'eye-retina'],
    examTips: ['Accommodation = the lens changing shape to focus. Don’t confuse with sensory adaptation.'],
  },
  {
    id: 'eye-retina',
    displayName: 'Retina',
    detailLevel: 1,
    childIds: ['eye-rods', 'eye-cones', 'eye-fovea', 'eye-blind-spot', 'eye-trichromatic', 'eye-opponent-process'],
    oneLiner: 'The light-sensitive screen where transduction happens.',
    functionShort:
      'The retina is the inner layer of receptor cells that converts light into neural signals — the moment of transduction.',
    functionDeep:
      'Light striking the retina triggers transduction: rods and cones fire, passing signals to bipolar cells and then ganglion cells, whose axons form the optic nerve. This is where physical light energy becomes information the brain can use.',
    apUnits: [1],
    apTerms: ['retina', 'transduction', 'rods', 'cones', 'bipolar cells', 'ganglion cells'],
    relatedIds: ['eye-rods', 'eye-cones', 'eye-optic-nerve', 'visual-cortex'],
    examTips: ['Transduction = converting a stimulus (light) into neural signals. It happens at the retina.'],
  },
  {
    id: 'eye-rods',
    displayName: 'Rods',
    detailLevel: 2,
    parentId: 'eye-retina',
    oneLiner: 'Receptors for dim light, night, and peripheral vision.',
    functionShort:
      'Rods are photoreceptors that detect dim light and enable black-and-white and peripheral vision; they do not sense color.',
    functionDeep:
      'About 120 million rods sit toward the retina’s periphery. They are extremely light-sensitive, so they dominate night vision and picking up motion out of the corner of your eye — but they cannot distinguish color. Dark adaptation, the gradual rise in sensitivity after the lights go out, is largely a rod process.',
    apUnits: [1],
    apTerms: ['rods', 'dark adaptation', 'peripheral vision'],
    relatedIds: ['eye-cones', 'eye-fovea', 'eye-retina'],
    misconceptions: ['Rods see no color — they handle dim light and peripheral vision.'],
    examTips: ['Rods dominate at night and in the periphery; cones need bright light.'],
    mnemonic: 'Rods = dim Rooms (night, black-and-white).',
  },
  {
    id: 'eye-cones',
    displayName: 'Cones',
    detailLevel: 2,
    parentId: 'eye-retina',
    oneLiner: 'Receptors for color and fine detail in bright light.',
    functionShort:
      'Cones are photoreceptors that detect color and fine detail; they work best in bright light and cluster at the fovea.',
    functionDeep:
      'About 6 million cones concentrate at the fovea, giving sharp central vision and color. Trichromatic (Young-Helmholtz) theory explains color here: three cone types — red, green, and blue — combine to produce every hue. Because cones need more light than rods, colors wash out in the dark.',
    apUnits: [1],
    apTerms: ['cones', 'trichromatic theory', 'Young-Helmholtz theory', 'visual acuity'],
    relatedIds: ['eye-rods', 'eye-fovea', 'eye-retina'],
    misconceptions: ['Cones need bright light — that’s why you can’t see color well at night.'],
    examTips: ['Trichromatic (three cones) explains color at the RETINA; opponent-process explains afterimages further along.'],
    mnemonic: 'Cones = Color (and Clarity).',
  },
  {
    id: 'eye-fovea',
    displayName: 'Fovea',
    detailLevel: 2,
    parentId: 'eye-retina',
    oneLiner: 'The retina’s point of sharpest vision.',
    functionShort:
      'The fovea is the central pit of the retina, densely packed with cones, where visual acuity is greatest.',
    functionDeep:
      'When you look directly at something, its image falls on the fovea. Because cones cluster here and thin out toward the edges, detail is sharp at the center and blurry in peripheral vision.',
    apUnits: [1],
    apTerms: ['fovea', 'cones', 'visual acuity'],
    relatedIds: ['eye-cones', 'eye-retina'],
  },
  {
    id: 'eye-blind-spot',
    displayName: 'Blind Spot',
    detailLevel: 2,
    parentId: 'eye-retina',
    oneLiner: 'Where the optic nerve leaves — no receptors.',
    functionShort:
      'The blind spot (optic disc) is the point where the optic nerve exits the eye, leaving a gap with no rods or cones.',
    functionDeep:
      'Because there are no receptors here, each eye has a small area it cannot see. You don’t notice it because the brain fills in the missing information — a vivid example of perception constructing reality.',
    apUnits: [1],
    apTerms: ['blind spot', 'optic disc'],
    relatedIds: ['eye-optic-nerve', 'eye-retina'],
    examTips: ['The blind spot exists because the optic disc has no receptors; the brain "fills in" the gap.'],
  },
  {
    id: 'eye-trichromatic',
    displayName: 'Trichromatic Theory',
    detailLevel: 2,
    parentId: 'eye-retina',
    oneLiner: 'Three cone types combine to make every color.',
    functionShort:
      'Trichromatic (Young-Helmholtz) theory says the retina has three cone types — red, green, and blue — whose combined activity produces all the colors we see.',
    functionDeep:
      'Different wavelengths of light stimulate the three cones in different ratios, and the brain reads that mix as a specific hue. This theory explains color vision at the cone level, and why most color blindness comes from a missing or faulty cone type (often red-green).',
    apUnits: [1],
    apTerms: ['trichromatic theory', 'Young-Helmholtz theory', 'cones', 'color blindness'],
    relatedIds: ['eye-cones', 'eye-opponent-process', 'eye-retina'],
    examTips: ['Trichromatic = color starts at the three CONES (retina level).'],
  },
  {
    id: 'eye-opponent-process',
    displayName: 'Opponent-Process Theory',
    detailLevel: 2,
    parentId: 'eye-retina',
    oneLiner: 'Color is coded in opposing pairs — and it explains afterimages.',
    functionShort:
      'Opponent-process theory says color is processed in opposing pairs (red–green, blue–yellow, black–white) after the cones, which is why we see negative afterimages.',
    functionDeep:
      'Cells are excited by one color of a pair and inhibited by the other. Stare at green and those cells fatigue; look away at white and the red side rebounds, producing a red afterimage. Trichromatic and opponent-process both operate — just at different stages of the visual pathway. Open the afterimage demo to try it.',
    apUnits: [1],
    apTerms: ['opponent-process theory', 'afterimage', 'color vision'],
    relatedIds: ['eye-trichromatic', 'eye-cones', 'visual-cortex'],
    examTips: ['Opponent-process explains AFTERIMAGES; it works AFTER the cones, further along the pathway.'],
  },
  {
    id: 'eye-optic-nerve',
    displayName: 'Optic Nerve',
    detailLevel: 1,
    jumpToRegionId: 'visual-cortex',
    oneLiner: 'Carries vision from eye to brain — follow it to the visual cortex.',
    functionShort:
      'The optic nerve is the bundle of ganglion-cell axons that carries visual information from the retina toward the brain.',
    functionDeep:
      'From each retina, the optic nerve travels to the optic chiasm (where halves cross), then through the thalamus (LGN) to the visual cortex in the occipital lobe. That final stop — not the eye — is where you actually "see." Follow this nerve to jump into the visual cortex.',
    apUnits: [1],
    apTerms: ['optic nerve', 'optic chiasm', 'visual pathway', 'feature detectors'],
    relatedIds: ['visual-cortex', 'occipital-lobe', 'thalamus', 'eye-retina'],
    examTips: ['Visual pathway: retina → optic nerve → optic chiasm → thalamus (LGN) → occipital lobe.'],
  },
]
