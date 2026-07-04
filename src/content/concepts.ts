import type { ConceptCard } from './types'

// ─────────────────────────────────────────────────────────────────────────
//  Concept cards — content with no fixed geometry. Neurotransmitters anchor to
//  the synapse/regions; the rest spans Units 0–5 so the concept browser and the
//  quiz generator cover the whole course, not just anatomy. This set is a
//  strong seed; Phase 6 expands it toward full CED coverage.
// ─────────────────────────────────────────────────────────────────────────

export const CONCEPTS: ConceptCard[] = [
  // ── Neurotransmitters (anchored to the synapse) ──────────────────────────
  {
    id: 'nt-dopamine',
    topic: 'Neurotransmitters',
    displayName: 'Dopamine',
    anchorRegionId: 'basal-ganglia',
    oneLiner: 'Reward, motivation, and movement.',
    functionShort:
      'Dopamine drives reward, motivation, and smooth movement. Too much is linked to schizophrenia; too little to Parkinson’s disease.',
    functionDeep:
      'Dopamine fuels the brain’s reward pathway (nucleus accumbens), reinforcing behaviors and underlying addiction. Excess dopamine activity is associated with schizophrenia’s positive symptoms; degeneration of dopamine neurons causes Parkinson’s tremors.',
    apUnits: [1, 3, 5],
    apTerms: ['dopamine', 'reward pathway', 'schizophrenia', "Parkinson's disease"],
    relatedIds: ['basal-ganglia', 'synapse', 'dis-schizophrenia'],
    examTips: ['Dopamine: too MUCH → schizophrenia; too LITTLE → Parkinson’s.'],
  },
  {
    id: 'nt-serotonin',
    topic: 'Neurotransmitters',
    displayName: 'Serotonin',
    anchorRegionId: 'synapse',
    oneLiner: 'Mood, sleep, and appetite.',
    functionShort:
      'Serotonin regulates mood, sleep, hunger, and arousal. Low levels are linked to depression.',
    functionDeep:
      'Serotonin stabilizes mood and helps control sleep and appetite. Because low serotonin activity is tied to depression, many antidepressants (SSRIs) work by blocking its reuptake, leaving more available in the synapse.',
    apUnits: [1, 5],
    apTerms: ['serotonin', 'depression', 'SSRIs', 'reuptake'],
    relatedIds: ['synapse', 'dis-depression'],
    examTips: ['Low serotonin ↔ depression; SSRIs block serotonin reuptake.'],
  },
  {
    id: 'nt-gaba',
    topic: 'Neurotransmitters',
    displayName: 'GABA',
    anchorRegionId: 'synapse',
    oneLiner: 'The brain’s main "brake" (inhibitory).',
    functionShort:
      'GABA is the major inhibitory neurotransmitter, calming neural activity. Low levels are linked to anxiety and seizures.',
    functionDeep:
      'GABA reduces the likelihood that neurons fire, keeping the nervous system in balance. Too little GABA activity is associated with anxiety, and many anti-anxiety drugs enhance its calming effect.',
    apUnits: [1, 5],
    apTerms: ['GABA', 'inhibitory neurotransmitter', 'anxiety'],
    relatedIds: ['synapse', 'nt-glutamate', 'amygdala'],
    examTips: ['GABA = inhibitory (brake); glutamate = excitatory (gas).'],
  },
  {
    id: 'nt-glutamate',
    topic: 'Neurotransmitters',
    displayName: 'Glutamate',
    anchorRegionId: 'synapse',
    oneLiner: 'The brain’s main "gas pedal" (excitatory).',
    functionShort:
      'Glutamate is the major excitatory neurotransmitter, involved in learning and memory. Excess is linked to migraines and seizures.',
    functionDeep:
      'Glutamate increases the chance neurons fire and is central to long-term potentiation, the strengthening of synapses that underlies learning and memory. Overactivity can overexcite neurons, contributing to seizures.',
    apUnits: [1, 2],
    apTerms: ['glutamate', 'excitatory neurotransmitter', 'long-term potentiation'],
    relatedIds: ['synapse', 'nt-gaba', 'hippocampus'],
  },
  {
    id: 'nt-acetylcholine',
    topic: 'Neurotransmitters',
    displayName: 'Acetylcholine (ACh)',
    anchorRegionId: 'synapse',
    oneLiner: 'Muscle movement and memory.',
    functionShort:
      'Acetylcholine enables muscle contraction and plays a key role in learning and memory. Its loss is linked to Alzheimer’s disease.',
    functionDeep:
      'ACh is released at every junction between motor neurons and muscles, making movement possible. In the brain it supports memory; the degeneration of ACh-producing neurons is a hallmark of Alzheimer’s disease.',
    apUnits: [1, 2, 5],
    apTerms: ['acetylcholine', "Alzheimer's disease", 'memory'],
    relatedIds: ['synapse', 'hippocampus', 'motor-cortex'],
    examTips: ['ACh: muscles + memory. Loss ↔ Alzheimer’s.'],
  },
  {
    id: 'nt-norepinephrine',
    topic: 'Neurotransmitters',
    displayName: 'Norepinephrine',
    anchorRegionId: 'synapse',
    oneLiner: 'Alertness and arousal.',
    functionShort:
      'Norepinephrine controls alertness and arousal and helps drive the fight-or-flight response. Low levels can depress mood.',
    functionDeep:
      'As both a neurotransmitter and a stress hormone, norepinephrine raises heart rate and readies the body for action. Undersupply is associated with depressed mood and low energy.',
    apUnits: [1, 5],
    apTerms: ['norepinephrine', 'arousal', 'fight-or-flight'],
    relatedIds: ['synapse', 'amygdala', 'hypothalamus'],
  },
  {
    id: 'nt-endorphins',
    topic: 'Neurotransmitters',
    displayName: 'Endorphins',
    anchorRegionId: 'synapse',
    oneLiner: 'Natural pain relief and pleasure.',
    functionShort:
      'Endorphins reduce pain and boost pleasure — the source of the "runner’s high."',
    functionDeep:
      'Released during exercise, excitement, and pain, endorphins are the body’s natural opioids. Opiate drugs like morphine mimic them, which is why the brain may reduce its own production with prolonged use.',
    apUnits: [1],
    apTerms: ['endorphins', 'pain', 'opiates'],
    relatedIds: ['synapse'],
    examTips: ['ENDorphins END pain (natural painkillers).'],
  },

  // ── Neural communication (Unit 1) ────────────────────────────────────────
  {
    id: 'concept-neuron-types',
    topic: 'Neural Communication',
    displayName: 'Neuron Types & the Reflex Arc',
    anchorRegionId: 'neuron',
    oneLiner: 'Sensory in, motor out, interneurons between.',
    functionShort:
      'Sensory (afferent) neurons carry information in from the senses, motor (efferent) neurons carry commands out to muscles, and interneurons connect them within the CNS.',
    functionDeep:
      'In a reflex arc, a sensory neuron sends a signal (like pain) to the spinal cord, an interneuron relays it, and a motor neuron pulls your hand away — before the brain is even involved. Glial cells support, insulate, and nourish all these neurons.',
    apUnits: [1],
    apTerms: ['sensory neurons', 'motor neurons', 'interneurons', 'afferent', 'efferent', 'reflex arc', 'glial cells'],
    relatedIds: ['neuron', 'synapse', 'action-potential'],
    mnemonic: 'Afferent Arrives (sensory in); Efferent Exits (motor out).',
  },

  // ── Sleep & consciousness (Unit 1) ───────────────────────────────────────
  {
    id: 'concept-rem-sleep',
    topic: 'Sleep & Consciousness',
    displayName: 'REM Sleep',
    anchorRegionId: 'pons',
    oneLiner: 'The dreaming, "paradoxical" sleep stage.',
    functionShort:
      'REM (rapid eye movement) sleep is the stage where vivid dreaming occurs, the brain is active, yet the body’s voluntary muscles are paralyzed.',
    functionDeep:
      'Called "paradoxical sleep" because brain activity resembles wakefulness while the body is still. REM supports memory consolidation, and time in REM increases across the night. It recurs in a roughly 90-minute cycle with NREM stages.',
    apUnits: [1, 2],
    apTerms: ['REM sleep', 'sleep cycle', 'circadian rhythm', 'paradoxical sleep'],
    relatedIds: ['pons', 'hippocampus'],
  },

  // ── Research methods (Unit 0) ────────────────────────────────────────────
  {
    id: 'concept-experiment',
    topic: 'Research Methods',
    displayName: 'The Experiment',
    oneLiner: 'The only method that shows cause and effect.',
    functionShort:
      'An experiment manipulates an independent variable and measures a dependent variable, using random assignment to establish cause and effect.',
    functionDeep:
      'The experimenter changes the independent variable (the cause) and measures the dependent variable (the effect), while random assignment spreads confounding variables evenly across groups. A control group and operational definitions make the comparison fair and repeatable.',
    apUnits: [0],
    apTerms: ['independent variable', 'dependent variable', 'random assignment', 'control group', 'confounding variable', 'operational definition'],
    relatedIds: ['concept-correlation'],
    examTips: ['IV = what you change; DV = what you measure. Random ASSIGNMENT (to groups) ≠ random SELECTION (sampling).'],
  },
  {
    id: 'concept-correlation',
    topic: 'Research Methods',
    displayName: 'Correlation',
    oneLiner: 'Relationship, not causation.',
    functionShort:
      'Correlation measures how two variables relate, but it cannot prove that one causes the other.',
    functionDeep:
      'A correlation coefficient runs from −1 to +1; the sign shows direction and the number shows strength. A strong correlation may reflect a hidden third variable, so correlation alone never establishes causation.',
    apUnits: [0],
    apTerms: ['correlation', 'correlation coefficient', 'third variable problem', 'positive correlation', 'negative correlation'],
    relatedIds: ['concept-experiment'],
    misconceptions: ['Correlation does NOT prove causation — a third variable may explain the link.'],
  },

  // ── Learning (Unit 3) ────────────────────────────────────────────────────
  {
    id: 'concept-classical-conditioning',
    topic: 'Learning',
    displayName: 'Classical Conditioning',
    oneLiner: 'Learning by association (Pavlov).',
    functionShort:
      'Classical conditioning is learning to associate a neutral stimulus with a meaningful one, producing a conditioned response.',
    functionDeep:
      'Pavlov paired a bell (neutral) with food (unconditioned stimulus) until the bell alone (conditioned stimulus) triggered salivation (conditioned response). It explains many automatic, involuntary emotional reactions, like phobias.',
    apUnits: [3],
    apTerms: ['classical conditioning', 'unconditioned stimulus', 'conditioned stimulus', 'conditioned response', 'acquisition', 'extinction'],
    relatedIds: ['concept-operant-conditioning', 'amygdala'],
    examTips: ['Classical = involuntary/automatic responses; operant = voluntary behaviors shaped by consequences.'],
  },
  {
    id: 'concept-operant-conditioning',
    topic: 'Learning',
    displayName: 'Operant Conditioning',
    oneLiner: 'Learning through consequences (Skinner).',
    functionShort:
      'Operant conditioning shapes voluntary behavior through reinforcement (which increases behavior) and punishment (which decreases it).',
    functionDeep:
      'Skinner showed that consequences mold behavior: positive/negative reinforcement strengthens actions, while punishment weakens them. Schedules of reinforcement determine how persistent the learned behavior becomes.',
    apUnits: [3],
    apTerms: ['operant conditioning', 'reinforcement', 'punishment', 'positive reinforcement', 'negative reinforcement', 'shaping'],
    relatedIds: ['concept-classical-conditioning', 'basal-ganglia', 'nt-dopamine'],
    misconceptions: ['Negative reinforcement is not punishment — it strengthens behavior by REMOVING something unpleasant.'],
  },

  // ── Memory (Unit 2) ──────────────────────────────────────────────────────
  {
    id: 'concept-memory-models',
    topic: 'Memory',
    displayName: 'Explicit vs. Implicit Memory',
    anchorRegionId: 'hippocampus',
    oneLiner: 'Two memory systems, two brain regions.',
    functionShort:
      'Explicit (declarative) memory holds facts and events; implicit (procedural) memory holds skills and conditioned responses.',
    functionDeep:
      'Explicit memories — consciously recalled facts and experiences — depend on the hippocampus. Implicit memories — automatic skills like typing — rely on the cerebellum and basal ganglia. Patient H.M. could form new implicit but not explicit memories.',
    apUnits: [2],
    apTerms: ['explicit memory', 'implicit memory', 'procedural memory', 'declarative memory'],
    relatedIds: ['hippocampus', 'cerebellum'],
    examTips: ['Explicit = hippocampus (facts); implicit = cerebellum (skills).'],
  },

  // ── Social psychology (Unit 4) ───────────────────────────────────────────
  {
    id: 'concept-fae',
    topic: 'Social Psychology',
    displayName: 'Fundamental Attribution Error',
    oneLiner: 'Blaming the person, ignoring the situation.',
    functionShort:
      'The fundamental attribution error is the tendency to overestimate personality and underestimate the situation when explaining others’ behavior.',
    functionDeep:
      'When someone else stumbles we blame their character ("they’re clumsy"); when we stumble we blame circumstances ("the floor was wet"). This bias shapes stereotypes and everyday judgments of others.',
    apUnits: [4],
    apTerms: ['fundamental attribution error', 'attribution theory', 'dispositional attribution', 'situational attribution'],
    relatedIds: ['concept-cognitive-dissonance'],
  },
  {
    id: 'concept-cognitive-dissonance',
    topic: 'Social Psychology',
    displayName: 'Cognitive Dissonance',
    oneLiner: 'Discomfort from clashing thoughts and actions.',
    functionShort:
      'Cognitive dissonance is the tension we feel when our attitudes and behaviors conflict, which pushes us to change one of them.',
    functionDeep:
      'Festinger showed that when actions contradict beliefs, people often adjust their attitudes to match their behavior to reduce discomfort — for example, deciding a boring task was actually interesting after being paid little to say so.',
    apUnits: [4],
    apTerms: ['cognitive dissonance', 'attitude', 'Festinger'],
    relatedIds: ['concept-fae'],
  },

  // ── Personality (Unit 4) ─────────────────────────────────────────────────
  {
    id: 'concept-big-five',
    topic: 'Personality',
    displayName: 'Big Five Traits',
    oneLiner: 'Five dimensions that describe personality.',
    functionShort:
      'The Big Five model describes personality along five trait dimensions: openness, conscientiousness, extraversion, agreeableness, and neuroticism.',
    functionDeep:
      'Remembered by OCEAN, these traits are relatively stable, appear across cultures, and each exist on a continuum. The trait approach contrasts with psychodynamic and humanistic theories of personality.',
    apUnits: [4],
    apTerms: ['Big Five', 'trait theory', 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
    relatedIds: [],
    mnemonic: 'OCEAN: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism.',
  },

  // ── Development (Unit 3) ──────────────────────────────────────────────────
  {
    id: 'concept-piaget',
    topic: 'Development',
    displayName: "Piaget's Stages",
    oneLiner: 'How children’s thinking develops in stages.',
    functionShort:
      'Piaget proposed four stages of cognitive development: sensorimotor, preoperational, concrete operational, and formal operational.',
    functionDeep:
      'Children build understanding through schemas, assimilation, and accommodation. Key milestones include object permanence (sensorimotor) and conservation (concrete operational). Later research suggests development is more continuous than his discrete stages imply.',
    apUnits: [3],
    apTerms: ['Piaget', 'sensorimotor', 'preoperational', 'concrete operational', 'formal operational', 'object permanence', 'conservation'],
    relatedIds: ['prefrontal-cortex'],
  },

  // ── Mental & physical health (Unit 5) ────────────────────────────────────
  {
    id: 'dis-depression',
    topic: 'Disorders & Health',
    displayName: 'Major Depressive Disorder',
    anchorRegionId: 'nt-serotonin',
    oneLiner: 'Persistent low mood and loss of interest.',
    functionShort:
      'Major depressive disorder involves at least two weeks of depressed mood or loss of interest, plus changes in sleep, energy, and concentration.',
    functionDeep:
      'The biopsychosocial model explains depression through biology (low serotonin/norepinephrine activity), psychology (negative thought patterns), and social stressors. Treatments include SSRIs and cognitive-behavioral therapy.',
    apUnits: [5],
    apTerms: ['major depressive disorder', 'serotonin', 'biopsychosocial model', 'cognitive-behavioral therapy'],
    relatedIds: ['nt-serotonin', 'dis-schizophrenia'],
  },
  {
    id: 'dis-schizophrenia',
    topic: 'Disorders & Health',
    displayName: 'Schizophrenia',
    anchorRegionId: 'nt-dopamine',
    oneLiner: 'A split from reality — hallucinations and delusions.',
    functionShort:
      'Schizophrenia is a disorder marked by disorganized thinking, hallucinations, and delusions (positive symptoms) alongside flat affect and withdrawal (negative symptoms).',
    functionDeep:
      'The dopamine hypothesis links positive symptoms to overactive dopamine systems, and antipsychotics that block dopamine reduce them. Schizophrenia reflects an interaction of genetic vulnerability and environmental stress (diathesis-stress model).',
    apUnits: [5],
    apTerms: ['schizophrenia', 'dopamine hypothesis', 'positive symptoms', 'negative symptoms', 'delusions', 'hallucinations'],
    relatedIds: ['nt-dopamine', 'dis-depression'],
    misconceptions: ['Schizophrenia is not "split personality" — that’s a different concept (dissociative identity).'],
  },
]
