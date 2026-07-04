// ─────────────────────────────────────────────────────────────────────────
//  Brain-activity scenarios — short, guided animations that light up one
//  region at a time while a caption explains what happens there. Each step's
//  `regionId` must be a brain region with geometry (see brain/regionGeometry).
//  The scene dims every other structure (the existing focus/dim mechanism) so
//  the active area stands out.
// ─────────────────────────────────────────────────────────────────────────

export interface ScenarioStep {
  /** Brain region to light up (must have geometry). */
  regionId: string
  /** Short header for the caption (usually the structure's name). */
  label: string
  /** One or two sentences: what this area does at this moment. */
  text: string
}

export interface BrainScenario {
  id: string
  title: string
  /** One-line hook for the scenario menu. */
  blurb: string
  /** Emoji shown in the menu for quick recognition. */
  icon: string
  steps: ScenarioStep[]
}

export const SCENARIOS: BrainScenario[] = [
  {
    id: 'fear-response',
    title: 'Spotting a Snake',
    blurb: 'The brain’s fast fear pathway, step by step.',
    icon: '🐍',
    steps: [
      {
        regionId: 'visual-cortex',
        label: 'Visual Cortex',
        text: 'Light from the snake reaches your eyes and travels to the visual cortex, which begins processing the shape and its sudden movement.',
      },
      {
        regionId: 'thalamus',
        label: 'Thalamus',
        text: 'The thalamus — the brain’s sensory relay — sends a fast “low road” shortcut straight to the amygdala, before the image is even fully identified.',
      },
      {
        regionId: 'amygdala',
        label: 'Amygdala',
        text: 'The amygdala flags the threat and triggers an immediate fear response, priming you to react in a split second.',
      },
      {
        regionId: 'hypothalamus',
        label: 'Hypothalamus',
        text: 'The hypothalamus launches the fight-or-flight response, signaling a surge of adrenaline: your heart pounds and your pupils widen.',
      },
      {
        regionId: 'prefrontal-cortex',
        label: 'Prefrontal Cortex',
        text: 'A moment later, the prefrontal cortex appraises the scene — “it’s only a stick” — and can override the alarm and calm you down.',
      },
    ],
  },
  {
    id: 'making-a-memory',
    title: 'Studying for a Test',
    blurb: 'How a new fact becomes a long-term memory.',
    icon: '📖',
    steps: [
      {
        regionId: 'visual-cortex',
        label: 'Visual Cortex',
        text: 'As you read your notes, the visual cortex processes the words on the page as visual information.',
      },
      {
        regionId: 'prefrontal-cortex',
        label: 'Prefrontal Cortex',
        text: 'The prefrontal cortex holds the information in working memory while you actively rehearse and make sense of it.',
      },
      {
        regionId: 'hippocampus',
        label: 'Hippocampus',
        text: 'The hippocampus encodes and consolidates the new facts, transferring them toward long-term explicit memory.',
      },
      {
        regionId: 'temporal-lobe',
        label: 'Temporal Lobe',
        text: 'Over time the memory is stored across the cortex. On test day, the hippocampus helps pull it back out of storage.',
      },
    ],
  },
  {
    id: 'riding-a-bike',
    title: 'Riding a Bike',
    blurb: 'Turning effort into an automatic motor skill.',
    icon: '🚲',
    steps: [
      {
        regionId: 'prefrontal-cortex',
        label: 'Frontal Lobe',
        text: 'You decide to start pedaling. The frontal lobe plans the sequence of movements you’re about to make.',
      },
      {
        regionId: 'motor-cortex',
        label: 'Motor Cortex',
        text: 'The motor cortex sends the actual commands down to the muscles in your legs to push the pedals.',
      },
      {
        regionId: 'cerebellum',
        label: 'Cerebellum',
        text: 'The cerebellum fine-tunes balance, timing, and coordination, keeping you smooth and upright.',
      },
      {
        regionId: 'basal-ganglia',
        label: 'Basal Ganglia',
        text: 'With repetition, the basal ganglia store the skill as an automatic habit — procedural memory you no longer have to think about.',
      },
    ],
  },
  {
    id: 'loud-noise',
    title: 'A Sudden Loud Noise',
    blurb: 'The startle and arousal response to a bang.',
    icon: '💥',
    steps: [
      {
        regionId: 'auditory-cortex',
        label: 'Auditory Cortex',
        text: 'A loud bang reaches your ears, and the auditory cortex registers the sudden sound.',
      },
      {
        regionId: 'reticular-formation',
        label: 'Reticular Formation',
        text: 'The reticular formation spikes your overall arousal and alertness, snapping your attention toward the noise.',
      },
      {
        regionId: 'amygdala',
        label: 'Amygdala',
        text: 'The amygdala evaluates the sound as a possible threat, adding an emotional startle response.',
      },
      {
        regionId: 'medulla',
        label: 'Medulla',
        text: 'Automatic survival responses kick in — the medulla drives the jump in heart rate and breathing.',
      },
    ],
  },
  {
    id: 'reward-bite',
    title: 'A Rewarding Bite',
    blurb: 'The dopamine reward pathway and reinforcement.',
    icon: '🍫',
    steps: [
      {
        regionId: 'basal-ganglia',
        label: 'Basal Ganglia',
        text: 'Eating something you love releases dopamine in the basal ganglia’s reward circuit (the nucleus accumbens), producing a hit of pleasure.',
      },
      {
        regionId: 'hypothalamus',
        label: 'Hypothalamus',
        text: 'The hypothalamus registers the satisfaction and helps regulate hunger and the drive to seek more.',
      },
      {
        regionId: 'prefrontal-cortex',
        label: 'Prefrontal Cortex',
        text: 'The prefrontal cortex ties the reward to your choice, reinforcing the behavior so you’re likely to repeat it.',
      },
      {
        regionId: 'hippocampus',
        label: 'Hippocampus',
        text: 'The hippocampus files away the memory of what delivered the reward — and where to find it again.',
      },
    ],
  },
  {
    id: 'falling-asleep',
    title: 'Falling Asleep',
    blurb: 'How the brain powers down for the night.',
    icon: '😴',
    steps: [
      {
        regionId: 'reticular-formation',
        label: 'Reticular Formation',
        text: 'As you wind down, the reticular formation dials back arousal, letting alertness fade.',
      },
      {
        regionId: 'hypothalamus',
        label: 'Hypothalamus',
        text: 'The hypothalamus’s internal clock (your circadian rhythm) senses darkness and signals for melatonin to be released.',
      },
      {
        regionId: 'pons',
        label: 'Pons',
        text: 'Once asleep, the pons helps generate REM sleep — vivid dreaming while your voluntary muscles are briefly paralyzed.',
      },
      {
        regionId: 'hippocampus',
        label: 'Hippocampus',
        text: 'Through the night, the hippocampus replays the day, consolidating new memories into long-term storage.',
      },
    ],
  },
  {
    id: 'stubbing-toe',
    title: 'Stubbing Your Toe',
    blurb: 'How a pain signal reaches awareness.',
    icon: '🦶',
    steps: [
      {
        regionId: 'thalamus',
        label: 'Thalamus',
        text: 'Pain signals from your toe race up the spinal cord to the thalamus, the brain’s sensory relay station.',
      },
      {
        regionId: 'somatosensory-cortex',
        label: 'Somatosensory Cortex',
        text: 'The somatosensory cortex pinpoints the pain — exactly which toe, and how much it hurts.',
      },
      {
        regionId: 'amygdala',
        label: 'Amygdala',
        text: 'The amygdala adds the emotional sting and frustration, driving your immediate “ow!” reaction.',
      },
    ],
  },
  {
    id: 'mr-g-pen',
    title: 'Mr. G Throws a Pen',
    blurb: 'A wrong answer, an incoming pen, and positive punishment.',
    icon: '🖊️',
    steps: [
      {
        regionId: 'visual-cortex',
        label: 'Visual Cortex',
        text: 'You blurt out a wrong answer — and catch a pen flying toward you. Your visual cortex tracks the incoming projectile.',
      },
      {
        regionId: 'amygdala',
        label: 'Amygdala',
        text: 'The amygdala sounds an instant threat alarm, before you’ve consciously processed what’s happening.',
      },
      {
        regionId: 'motor-cortex',
        label: 'Motor Cortex',
        text: 'The motor cortex fires commands to your skeletal muscles through the somatic nervous system — you flinch and duck.',
      },
      {
        regionId: 'cerebellum',
        label: 'Cerebellum',
        text: 'The cerebellum coordinates the dodge, keeping the sudden movement balanced and smooth.',
      },
      {
        regionId: 'prefrontal-cortex',
        label: 'Prefrontal Cortex',
        text: 'Afterward, the prefrontal cortex ties the embarrassment to that wrong answer — a dose of positive punishment that makes you think twice next time.',
      },
    ],
  },
  {
    id: 'conditioned-marker',
    title: 'The Conditioned Marker',
    blurb: 'Classical conditioning turns a marker into a fear trigger.',
    icon: '🖍️',
    steps: [
      {
        regionId: 'visual-cortex',
        label: 'Visual Cortex',
        text: 'Mr. G brings a marker toward your hand. Your visual cortex recognizes it — the very marker he uses to draw on students to demonstrate conditioning.',
      },
      {
        regionId: 'hippocampus',
        label: 'Hippocampus',
        text: 'The hippocampus retrieves the memory of that cold squeak across your skin — the learned pairing of marker (neutral stimulus) with being drawn on (the aversive event).',
      },
      {
        regionId: 'amygdala',
        label: 'Amygdala',
        text: 'Trained by that repeated pairing, the amygdala fires a conditioned fear response: the marker has become a conditioned stimulus.',
      },
      {
        regionId: 'hypothalamus',
        label: 'Hypothalamus',
        text: 'The hypothalamus triggers fight-or-flight through the sympathetic nervous system — your hand jerks back, heart pounding. That reflexive recoil is the conditioned response.',
      },
    ],
  },
]
