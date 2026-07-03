import type { Question } from './types'

// ─────────────────────────────────────────────────────────────────────────
//  Seed question bank — human-vetted. Three jobs:
//   1. The universal fallback (works on every device, no model needed).
//   2. Context-aware practice (filtered by the region/concept being explored).
//   3. Few-shot exemplars that steer the on-device model toward correct AP
//      style and grounded facts (see Phase 5).
//  `correct: true` marks the key. Order is shuffled at render time.
// ─────────────────────────────────────────────────────────────────────────

export const QUESTIONS: Question[] = [
  // ── Biological bases: structures ─────────────────────────────────────────
  {
    id: 'q-hippocampus-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'hippocampus',
    targetTerms: ['hippocampus', 'explicit memory', 'anterograde amnesia'],
    stem: 'After surgery damaged his hippocampus, patient H.M. could still learn new motor skills but could not remember meeting his doctors. This best illustrates the hippocampus’s role in:',
    options: [
      { text: 'Forming new explicit (conscious) memories', correct: true },
      { text: 'Storing implicit motor skills', correct: false, rationale: 'Motor skills are implicit memory, handled by the cerebellum — which is why H.M. could still learn them.' },
      { text: 'Regulating fear responses', correct: false, rationale: 'Fear is primarily the amygdala’s role.' },
      { text: 'Coordinating balance and movement', correct: false, rationale: 'That is the cerebellum.' },
    ],
    explanation:
      'The hippocampus consolidates new explicit (declarative) memories. Damage causes anterograde amnesia — new facts/events cannot be stored — while implicit skill learning (cerebellum) remains intact.',
    misconceptionAddressed: 'Explicit (hippocampus) vs. implicit (cerebellum) memory.',
  },
  {
    id: 'q-amygdala-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'amygdala',
    targetTerms: ['amygdala', 'emotion', 'fight-or-flight'],
    stem: 'A researcher electrically stimulates a specific structure in a rat’s brain, and the rat immediately shows an aggressive, fearful reaction. Which structure was most likely stimulated?',
    options: [
      { text: 'Amygdala', correct: true },
      { text: 'Hippocampus', correct: false, rationale: 'The hippocampus forms memories, not emotional reactions.' },
      { text: 'Cerebellum', correct: false, rationale: 'The cerebellum controls coordination.' },
      { text: 'Medulla', correct: false, rationale: 'The medulla controls heartbeat and breathing.' },
    ],
    explanation: 'The amygdala drives strong emotional responses, especially fear and aggression.',
  },
  {
    id: 'q-cerebellum-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'cerebellum',
    targetTerms: ['cerebellum', 'coordination', 'implicit memory'],
    stem: 'Damage to the cerebellum would most likely result in difficulty with:',
    options: [
      { text: 'Smooth, coordinated movement and balance', correct: true },
      { text: 'Recalling a list of vocabulary words', correct: false, rationale: 'That is explicit memory (hippocampus).' },
      { text: 'Understanding spoken language', correct: false, rationale: 'That is Wernicke’s area.' },
      { text: 'Regulating body temperature', correct: false, rationale: 'That is the hypothalamus.' },
    ],
    explanation: 'The cerebellum coordinates voluntary movement and balance and stores procedural (implicit) memories.',
  },
  {
    id: 'q-thalamus-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'thalamus',
    targetTerms: ['thalamus', 'sensory relay'],
    stem: 'Which sense does NOT route its signals through the thalamus on the way to the cortex?',
    options: [
      { text: 'Smell (olfaction)', correct: true },
      { text: 'Vision', correct: false, rationale: 'Vision passes through the thalamus (LGN).' },
      { text: 'Hearing', correct: false, rationale: 'Hearing is relayed by the thalamus.' },
      { text: 'Touch', correct: false, rationale: 'Touch is relayed by the thalamus.' },
    ],
    explanation: 'The thalamus is the sensory relay station for every sense except smell, which connects directly to areas of emotion and memory.',
    misconceptionAddressed: 'Smell bypasses the thalamus.',
  },
  {
    id: 'q-medulla-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'medulla',
    targetTerms: ['medulla', 'brainstem'],
    stem: 'Which brain structure is most directly responsible for keeping a person breathing and their heart beating?',
    options: [
      { text: 'Medulla', correct: true },
      { text: 'Frontal lobe', correct: false, rationale: 'The frontal lobe handles executive function and movement.' },
      { text: 'Hippocampus', correct: false, rationale: 'The hippocampus forms memories.' },
      { text: 'Occipital lobe', correct: false, rationale: 'The occipital lobe processes vision.' },
    ],
    explanation: 'The medulla, at the base of the brainstem, controls vital automatic functions like heartbeat and breathing.',
  },
  {
    id: 'q-aphasia-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'brocas-area',
    targetTerms: ["Broca's area", "Broca's aphasia", 'aphasia'],
    stem: 'A patient can understand everything said to her but speaks only in slow, halting, effortful phrases. Damage has most likely occurred to:',
    options: [
      { text: "Broca's area", correct: true },
      { text: "Wernicke's area", correct: false, rationale: 'Wernicke’s damage produces fluent but meaningless speech with poor comprehension.' },
      { text: 'The angular gyrus', correct: false, rationale: 'This is linked to reading, not halting speech production.' },
      { text: 'The cerebellum', correct: false, rationale: 'The cerebellum coordinates movement, not speech production specifically.' },
    ],
    explanation:
      "Broca's area (frontal lobe) produces speech. Damage causes Broca's (expressive) aphasia: labored speech with intact comprehension.",
    misconceptionAddressed: "Broca's (production) vs. Wernicke's (comprehension).",
  },
  {
    id: 'q-motor-somato-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'somatosensory-cortex',
    targetTerms: ['somatosensory cortex', 'motor cortex', 'contralateral control'],
    stem: 'The somatosensory cortex and motor cortex sit next to each other but do opposite jobs. The somatosensory cortex is best described as handling information that is:',
    options: [
      { text: 'Coming IN — receiving touch sensations from the body', correct: true },
      { text: 'Going OUT — sending commands for voluntary movement', correct: false, rationale: 'That describes the motor cortex.' },
      { text: 'Processing visual input', correct: false, rationale: 'Vision is the occipital lobe.' },
      { text: 'Producing speech', correct: false, rationale: 'That is Broca’s area.' },
    ],
    explanation:
      'The somatosensory cortex (parietal lobe) receives touch; the motor cortex (frontal lobe) sends movement commands. Each processes the opposite side of the body.',
  },

  // ── Biological bases: cellular ───────────────────────────────────────────
  {
    id: 'q-action-potential-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'action-potential',
    targetTerms: ['all-or-none', 'action potential', 'threshold'],
    stem: 'A stronger stimulus applied to a neuron will cause the neuron to:',
    options: [
      { text: 'Fire more frequently, but each impulse is the same strength', correct: true },
      { text: 'Fire a single, more powerful action potential', correct: false, rationale: 'Violates the all-or-none law — impulse strength is constant.' },
      { text: 'Fire more slowly', correct: false, rationale: 'Stronger stimuli increase firing rate, not decrease it.' },
      { text: 'Stop firing entirely', correct: false, rationale: 'A stronger (above-threshold) stimulus increases firing.' },
    ],
    explanation:
      'By the all-or-none law, a neuron fires at full strength or not at all. Stimulus intensity is encoded by how OFTEN it fires, not how strongly.',
    misconceptionAddressed: 'All-or-none: rate, not amplitude, codes intensity.',
  },
  {
    id: 'q-synapse-agonist-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'synapse',
    targetTerms: ['agonist', 'antagonist', 'neurotransmitter'],
    stem: 'A drug that binds to a receptor and mimics the effect of a neurotransmitter, increasing its activity, is called a(n):',
    options: [
      { text: 'Agonist', correct: true },
      { text: 'Antagonist', correct: false, rationale: 'An antagonist blocks or reduces neurotransmitter activity.' },
      { text: 'Reuptake inhibitor', correct: false, rationale: 'A reuptake inhibitor blocks reabsorption rather than binding to mimic the neurotransmitter.' },
      { text: 'Precursor', correct: false, rationale: 'A precursor is a building block, not a receptor-binding mimic.' },
    ],
    explanation: 'An agonist mimics or boosts a neurotransmitter’s action; an antagonist blocks it.',
  },
  {
    id: 'q-dopamine-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'nt-dopamine',
    targetTerms: ['dopamine', 'schizophrenia', "Parkinson's disease"],
    stem: 'Overactivity of which neurotransmitter is most associated with the symptoms of schizophrenia?',
    options: [
      { text: 'Dopamine', correct: true },
      { text: 'Serotonin', correct: false, rationale: 'Low serotonin is linked to depression.' },
      { text: 'GABA', correct: false, rationale: 'Low GABA is linked to anxiety.' },
      { text: 'Acetylcholine', correct: false, rationale: 'ACh loss is linked to Alzheimer’s.' },
    ],
    explanation:
      'The dopamine hypothesis links overactive dopamine systems to schizophrenia’s positive symptoms; too little dopamine causes Parkinson’s.',
  },
  {
    id: 'q-serotonin-1',
    type: 'MCQ',
    apUnit: 5,
    contextId: 'nt-serotonin',
    targetTerms: ['serotonin', 'depression', 'SSRIs'],
    stem: 'SSRIs treat depression by blocking the reuptake of which neurotransmitter, leaving more of it available in the synapse?',
    options: [
      { text: 'Serotonin', correct: true },
      { text: 'Dopamine', correct: false, rationale: 'Dopamine is targeted more in schizophrenia and Parkinson’s treatments.' },
      { text: 'Glutamate', correct: false, rationale: 'Glutamate is the main excitatory neurotransmitter, not the SSRI target.' },
      { text: 'Endorphins', correct: false, rationale: 'Endorphins relate to pain relief, not SSRIs.' },
    ],
    explanation: 'SSRIs (selective serotonin reuptake inhibitors) block serotonin reuptake; low serotonin activity is linked to depression.',
  },
  {
    id: 'q-ach-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'nt-acetylcholine',
    targetTerms: ['acetylcholine', "Alzheimer's disease"],
    stem: 'The deterioration of neurons that produce acetylcholine is most closely associated with:',
    options: [
      { text: 'Alzheimer’s disease', correct: true },
      { text: 'Parkinson’s disease', correct: false, rationale: 'Parkinson’s involves dopamine loss.' },
      { text: 'Schizophrenia', correct: false, rationale: 'Schizophrenia involves excess dopamine activity.' },
      { text: 'Anxiety disorders', correct: false, rationale: 'Anxiety is linked to low GABA.' },
    ],
    explanation: 'Acetylcholine enables muscle movement and supports memory; loss of ACh neurons is a hallmark of Alzheimer’s disease.',
  },

  // ── Sensation & perception ───────────────────────────────────────────────
  {
    id: 'q-rods-cones-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'eye-rods-cones',
    targetTerms: ['rods', 'cones'],
    stem: 'While walking on a dark, moonlit path, you can see shapes in your peripheral vision but cannot make out their colors. This is because dim, peripheral vision relies on:',
    options: [
      { text: 'Rods', correct: true },
      { text: 'Cones', correct: false, rationale: 'Cones need bright light and detect color and detail, concentrated at the fovea.' },
      { text: 'Bipolar cells only', correct: false, rationale: 'Bipolar cells relay signals but are not the light receptors responsible for dim vision.' },
      { text: 'The fovea', correct: false, rationale: 'The fovea is packed with cones and gives sharp, central color vision.' },
    ],
    explanation: 'Rods handle dim-light and peripheral vision in black-and-white; cones handle color and detail in bright light.',
    misconceptionAddressed: 'Rods = dim/peripheral/no color; cones = bright/color/detail.',
  },
  {
    id: 'q-transduction-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'eye-retina',
    targetTerms: ['transduction', 'retina'],
    stem: 'In vision, the conversion of light energy into neural signals the brain can interpret is called transduction. Where does it occur?',
    options: [
      { text: 'The retina', correct: true },
      { text: 'The cornea', correct: false, rationale: 'The cornea focuses light but does not transduce it.' },
      { text: 'The optic chiasm', correct: false, rationale: 'The optic chiasm is where nerve fibers cross, after transduction.' },
      { text: 'The visual cortex', correct: false, rationale: 'The visual cortex interprets signals that were already transduced at the retina.' },
    ],
    explanation: 'Transduction — turning a physical stimulus into neural signals — happens at the retina, where rods and cones fire.',
  },
  {
    id: 'q-optic-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'eye-optic-nerve',
    targetTerms: ['optic nerve', 'visual pathway', 'occipital lobe'],
    stem: 'Visual information leaving the eye through the optic nerve ultimately arrives for processing at the:',
    options: [
      { text: 'Occipital lobe', correct: true },
      { text: 'Temporal lobe', correct: false, rationale: 'The temporal lobe processes hearing and language.' },
      { text: 'Frontal lobe', correct: false, rationale: 'The frontal lobe handles executive function and movement.' },
      { text: 'Cerebellum', correct: false, rationale: 'The cerebellum coordinates movement.' },
    ],
    explanation: 'The visual pathway runs retina → optic nerve → optic chiasm → thalamus → occipital lobe, where "seeing" actually occurs.',
  },
  {
    id: 'q-split-brain-1',
    type: 'MCQ',
    apUnit: 1,
    contextId: 'corpus-callosum',
    targetTerms: ['corpus callosum', 'split brain'],
    stem: 'Split-brain research became possible after surgeons cut which structure to reduce severe seizures?',
    options: [
      { text: 'The corpus callosum', correct: true },
      { text: 'The reticular formation', correct: false, rationale: 'Cutting the reticular formation would affect arousal/consciousness.' },
      { text: 'The thalamus', correct: false, rationale: 'The thalamus is the sensory relay, not the hemisphere bridge.' },
      { text: 'The spinal cord', correct: false, rationale: 'The spinal cord connects brain and body, not the two hemispheres.' },
    ],
    explanation: 'The corpus callosum connects the hemispheres; severing it produces split-brain patients (Sperry, Gazzaniga).',
  },

  // ── Learning, cognition, social, development, methods ─────────────────────
  {
    id: 'q-classical-1',
    type: 'MCQ',
    apUnit: 3,
    contextId: 'concept-classical-conditioning',
    targetTerms: ['classical conditioning', 'conditioned stimulus', 'conditioned response'],
    stem: 'A dog learns to salivate at the sound of a bell that has repeatedly preceded food. In this example, the bell is the:',
    options: [
      { text: 'Conditioned stimulus', correct: true },
      { text: 'Unconditioned stimulus', correct: false, rationale: 'The food is the unconditioned stimulus.' },
      { text: 'Unconditioned response', correct: false, rationale: 'Salivation to food is the unconditioned response.' },
      { text: 'Neutral stimulus', correct: false, rationale: 'The bell WAS neutral, but after learning it is the conditioned stimulus.' },
    ],
    explanation:
      'After pairing, the once-neutral bell becomes the conditioned stimulus, triggering the conditioned response (salivation).',
  },
  {
    id: 'q-operant-1',
    type: 'MCQ',
    apUnit: 3,
    contextId: 'concept-operant-conditioning',
    targetTerms: ['negative reinforcement', 'operant conditioning'],
    stem: 'A driver buckles their seatbelt to stop an annoying beeping sound. The removal of the beeping to increase seatbelt use is an example of:',
    options: [
      { text: 'Negative reinforcement', correct: true },
      { text: 'Positive reinforcement', correct: false, rationale: 'Positive reinforcement ADDS a pleasant stimulus; here something unpleasant is removed.' },
      { text: 'Positive punishment', correct: false, rationale: 'Punishment decreases behavior; here the behavior increases.' },
      { text: 'Negative punishment', correct: false, rationale: 'Punishment decreases behavior; buckling up increases.' },
    ],
    explanation:
      'Negative reinforcement strengthens a behavior by removing something unpleasant (the beep). It is reinforcement because the behavior increases.',
    misconceptionAddressed: 'Negative reinforcement increases behavior; it is not punishment.',
  },
  {
    id: 'q-fae-1',
    type: 'MCQ',
    apUnit: 4,
    contextId: 'concept-fae',
    targetTerms: ['fundamental attribution error'],
    stem: 'Seeing a classmate trip, Maria thinks "how clumsy." When she trips later, she thinks "the floor was slippery." Maria’s judgment of her classmate illustrates the:',
    options: [
      { text: 'Fundamental attribution error', correct: true },
      { text: 'Self-serving bias', correct: false, rationale: 'Self-serving bias is about crediting our own successes to ourselves; this item is about explaining OTHERS’ behavior.' },
      { text: 'Mere exposure effect', correct: false, rationale: 'That concerns liking things through repeated exposure.' },
      { text: 'Cognitive dissonance', correct: false, rationale: 'Dissonance is discomfort from clashing attitudes and actions.' },
    ],
    explanation:
      'The fundamental attribution error is overestimating disposition ("clumsy") and underestimating situation ("slippery floor") when judging others.',
  },
  {
    id: 'q-correlation-1',
    type: 'MCQ',
    apUnit: 0,
    contextId: 'concept-correlation',
    targetTerms: ['correlation', 'causation', 'third variable problem'],
    stem: 'A study finds that ice cream sales and drowning deaths are strongly positively correlated. The best conclusion is that:',
    options: [
      { text: 'A third variable, such as hot weather, likely explains both', correct: true },
      { text: 'Eating ice cream causes drowning', correct: false, rationale: 'Correlation does not prove causation.' },
      { text: 'Drowning causes people to buy ice cream', correct: false, rationale: 'Reversing the causal claim is still unjustified from a correlation.' },
      { text: 'The correlation must be a coincidence with no explanation', correct: false, rationale: 'A confounding variable is a more parsimonious explanation than coincidence.' },
    ],
    explanation:
      'Correlation does not imply causation. Here a third variable — hot weather — plausibly raises both ice cream sales and swimming (and thus drownings).',
    misconceptionAddressed: 'Correlation ≠ causation; watch for third variables.',
  },

  // ── New exam format exemplars (AAQ / EBQ) ────────────────────────────────
  {
    id: 'q-aaq-1',
    type: 'AAQ',
    apUnit: 1,
    contextId: 'hippocampus',
    targetTerms: ['independent variable', 'dependent variable', 'hippocampus', 'operational definition'],
    scenario:
      'Researchers randomly assigned 60 adults to either an 8-week aerobic exercise program or a stretching-only control group. Before and after, all participants completed a standardized memory test in which they studied and later recalled a list of 30 words. MRI scans measured hippocampal volume. The exercise group showed both greater hippocampal volume and higher recall scores than the control group.',
    stem:
      'Using this study, respond to the following:\n(A) Identify the independent variable.\n(B) Identify the operational definition of memory used.\n(C) Explain one reason random assignment strengthens the researchers’ ability to draw a causal conclusion.',
    explanation:
      '(A) The independent variable is the type of activity program (aerobic exercise vs. stretching control). (B) Memory is operationally defined as the number of words correctly recalled from the 30-word list. (C) Random assignment distributes confounding variables (e.g., baseline fitness, age) evenly across groups, so a post-study difference can be attributed to the exercise manipulation rather than pre-existing differences.',
    misconceptionAddressed: 'AAQ answers must cite the study’s specifics — name the actual IV and the operational definition given.',
  },
  {
    id: 'q-ebq-1',
    type: 'EBQ',
    apUnit: 2,
    contextId: 'hippocampus',
    targetTerms: ['memory consolidation', 'REM sleep', 'sleep', 'encoding'],
    scenario:
      'Study 1: Participants who slept for 8 hours after learning word pairs recalled 25% more pairs than those kept awake the same duration.\n' +
      'Study 2: Brain imaging showed the hippocampus and cortex reactivating the same patterns during sleep that appeared during learning.\n' +
      'Study 3: Participants selectively deprived of REM sleep showed impaired recall of an emotional story compared with those who kept REM.',
    stem:
      'Develop an argument for the claim that sleep supports memory. Use at least two of the three studies as evidence, and explain how each supports your claim.',
    explanation:
      'A strong response states a clear claim (sleep aids memory consolidation) and links evidence: Study 1 shows a behavioral benefit of sleep on recall; Study 2 provides a mechanism (hippocampal-cortical reactivation/consolidation during sleep); Study 3 shows that losing a specific stage (REM) selectively impairs memory. Citing two studies with explicit reasoning — not just summary — earns the argument points.',
    misconceptionAddressed: 'EBQ credit comes from USING evidence to reason, not merely restating each study.',
  },
]
