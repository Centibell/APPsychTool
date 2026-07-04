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
      'ACh is released at every junction between motor neurons and muscles, enabling voluntary movement through the somatic nervous system; it also acts in the parasympathetic nervous system to calm the body (for example, slowing the heart). In the brain it supports memory; the degeneration of ACh-producing neurons is a hallmark of Alzheimer’s disease.',
    apUnits: [1, 2, 5],
    apTerms: ['acetylcholine', "Alzheimer's disease", 'memory', 'somatic nervous system', 'parasympathetic nervous system'],
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
      'As both a neurotransmitter and a stress hormone, norepinephrine raises heart rate and readies the body for action, driving the sympathetic nervous system’s fight-or-flight arousal. Undersupply is associated with depressed mood and low energy.',
    apUnits: [1, 5],
    apTerms: ['norepinephrine', 'arousal', 'fight-or-flight', 'sympathetic nervous system'],
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
    id: 'concept-nervous-system',
    topic: 'Neural Communication',
    displayName: 'Nervous System Organization',
    oneLiner: 'CNS + PNS, split into somatic and autonomic (sympathetic vs. parasympathetic).',
    functionShort:
      'The nervous system divides into the central nervous system (brain + spinal cord) and the peripheral nervous system, which splits into the somatic (voluntary) and autonomic (involuntary) systems.',
    functionDeep:
      'The autonomic nervous system splits further into the sympathetic branch (fight-or-flight, which arouses the body) and the parasympathetic branch (rest-and-digest, which calms it back down). Together these branches keep the body in balance. Use the “Nervous system map” button in the sidebar to see the full breakdown as a diagram.',
    apUnits: [1],
    apTerms: [
      'central nervous system',
      'peripheral nervous system',
      'somatic nervous system',
      'autonomic nervous system',
      'sympathetic nervous system',
      'parasympathetic nervous system',
    ],
    relatedIds: ['concept-neuron-types', 'neuron', 'hypothalamus'],
    examTips: [
      'Sympathetic = fight-or-flight (arouses); parasympathetic = rest-and-digest (calms). Somatic = voluntary; autonomic = involuntary.',
    ],
    mnemonic: 'ParaSympathetic = Peaceful/Pause; Sympathetic = Stress/Sprint.',
  },
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

  // ── Sensation & Perception (Unit 1) ──────────────────────────────────────
  {
    id: 'concept-thresholds',
    topic: 'Sensation & Perception',
    displayName: 'Thresholds & Signal Detection',
    oneLiner: 'The limits of what we can detect.',
    functionShort:
      'The absolute threshold is the weakest stimulus you can detect 50% of the time; the difference threshold (JND) is the smallest change you can notice.',
    functionDeep:
      'Weber’s law says the difference threshold is a constant proportion of the original stimulus, not a fixed amount. Signal detection theory adds that detection also depends on expectations, motivation, and alertness — not just the signal. Stimuli below the absolute threshold are subliminal.',
    apUnits: [1],
    apTerms: ['absolute threshold', 'difference threshold', 'just noticeable difference', 'Weber’s law', 'signal detection theory', 'subliminal'],
    relatedIds: ['concept-sensory-adaptation', 'eye-retina'],
    examTips: ['Absolute threshold = detect it at all (50%); difference threshold (JND) = notice a change.'],
  },
  {
    id: 'concept-sensory-adaptation',
    topic: 'Sensation & Perception',
    displayName: 'Sensory Adaptation',
    oneLiner: 'Constant stimuli fade from awareness.',
    functionShort:
      'Sensory adaptation is the reduced sensitivity to a constant, unchanging stimulus — like no longer noticing a smell or the feel of your clothes.',
    functionDeep:
      'By tuning out steady, unchanging input, your senses stay alert to changes in the environment, which carry more useful information. Don’t confuse it with accommodation (the lens focusing) — adaptation is about fading sensitivity over time.',
    apUnits: [1],
    apTerms: ['sensory adaptation', 'habituation'],
    relatedIds: ['concept-thresholds'],
    misconceptions: ['Sensory adaptation (fading sensitivity) is different from accommodation (the lens changing shape).'],
  },
  {
    id: 'concept-taste',
    topic: 'Sensation & Perception',
    displayName: 'Taste (Gustation)',
    oneLiner: 'Five basic tastes from receptors on the tongue.',
    functionShort:
      'Taste, or gustation, is a chemical sense: taste receptors detect five basic qualities — sweet, sour, salty, bitter, and umami (savory).',
    functionDeep:
      'Taste buds transduce chemicals in food into neural signals. Taste is heavily shaped by smell and texture (sensory interaction), which is why food seems flavorless with a stuffy nose. “Supertasters” have unusually dense taste buds.',
    apUnits: [1],
    apTerms: ['gustation', 'taste', 'umami', 'sensory interaction', 'supertasters'],
    relatedIds: ['concept-smell', 'concept-sensory-interaction'],
    mnemonic: 'Five tastes: sweet, sour, salty, bitter, umami.',
  },
  {
    id: 'concept-smell',
    topic: 'Sensation & Perception',
    displayName: 'Smell (Olfaction)',
    oneLiner: 'The chemical sense wired straight to emotion & memory.',
    functionShort:
      'Smell, or olfaction, detects airborne molecules with receptors high in the nose — the only sense that bypasses the thalamus.',
    functionDeep:
      'Because olfactory signals go directly to the limbic system (amygdala and hippocampus), smells trigger emotion and memory unusually strongly. This direct route is the exception to the rule that senses relay through the thalamus.',
    apUnits: [1],
    apTerms: ['olfaction', 'smell', 'limbic system'],
    relatedIds: ['thalamus', 'concept-taste', 'hippocampus'],
    examTips: ['Smell is the ONE sense that skips the thalamus — it goes straight to the limbic system.'],
  },
  {
    id: 'concept-touch-pain',
    topic: 'Sensation & Perception',
    displayName: 'Touch & Pain (Gate-Control)',
    oneLiner: 'Skin senses, and how the spinal cord gates pain.',
    functionShort:
      'The skin senses register pressure, warmth, cold, and pain. Gate-control theory explains how the spinal cord can block or allow pain signals to reach the brain.',
    functionDeep:
      'According to gate-control theory, the spinal cord has a neural “gate” that either lets pain signals through or blocks them. Rubbing a bumped elbow closes the gate; attention, mood, and expectation (top-down from the brain) can open or close it too — which is why distraction eases pain.',
    apUnits: [1],
    apTerms: ['gate-control theory', 'pain', 'skin senses', 'somatosensory cortex'],
    relatedIds: ['somatosensory-cortex', 'nt-endorphins'],
    examTips: ['Gate-control: the spinal cord gates pain; distraction/rubbing can “close the gate.”'],
  },
  {
    id: 'concept-vestibular-kinesthetic',
    topic: 'Sensation & Perception',
    displayName: 'Balance & Body Position',
    oneLiner: 'The vestibular and kinesthetic senses.',
    functionShort:
      'The vestibular sense tracks balance and head position using the inner ear; the kinesthetic sense tracks the position and movement of your body parts.',
    functionDeep:
      'Fluid-filled semicircular canals in the inner ear detect head tilt and rotation for the vestibular sense. Kinesthetic receptors in muscles, tendons, and joints let you touch your nose with your eyes closed. Together they keep you upright and coordinated.',
    apUnits: [1],
    apTerms: ['vestibular sense', 'kinesthetic sense', 'semicircular canals'],
    relatedIds: ['ear-cochlea', 'cerebellum'],
    mnemonic: 'Vestibular = balance (head); kinesthetic = body-part position.',
  },
  {
    id: 'concept-sensory-interaction',
    topic: 'Sensation & Perception',
    displayName: 'Sensory Interaction',
    oneLiner: 'Senses influence one another.',
    functionShort:
      'Sensory interaction is when one sense affects another — most famously how smell shapes taste to create flavor.',
    functionDeep:
      'The McGurk effect (seeing lip movements changes the sound you hear) shows vision shaping audition. In synesthesia, senses blend involuntarily — a person may “see” sounds or “taste” words.',
    apUnits: [1],
    apTerms: ['sensory interaction', 'McGurk effect', 'synesthesia'],
    relatedIds: ['concept-taste', 'concept-smell'],
  },
  {
    id: 'concept-endocrine',
    topic: 'Neural Communication',
    displayName: 'The Endocrine System',
    anchorRegionId: 'pituitary',
    oneLiner: 'The body’s slower, hormone-based messaging system.',
    functionShort:
      'The endocrine system is a network of glands that release hormones into the bloodstream — a slower but longer-lasting form of communication than the nervous system.',
    functionDeep:
      'The hypothalamus directs the pituitary (the “master gland”), which signals other glands. The adrenal glands release adrenaline (epinephrine) and cortisol during stress; the pineal gland releases melatonin for sleep; leptin and ghrelin regulate hunger; oxytocin supports bonding. Hormones act more slowly than neurotransmitters but their effects linger.',
    apUnits: [1],
    apTerms: ['endocrine system', 'hormones', 'adrenaline', 'epinephrine', 'cortisol', 'adrenal glands', 'pituitary gland', 'melatonin'],
    relatedIds: ['pituitary', 'hypothalamus', 'nt-norepinephrine'],
    examTips: ['Nervous system = fast, brief (neurotransmitters). Endocrine = slower, longer-lasting (hormones).'],
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
