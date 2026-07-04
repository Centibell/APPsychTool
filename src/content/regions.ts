import type { Region } from './types'

// ─────────────────────────────────────────────────────────────────────────
//  Brain regions — Unit 1 (Biological Bases of Behavior), with anchors into
//  Units 2–5 (memory, learning, disorders). AP-level accuracy; simplifications
//  the AP course makes (e.g. "amygdala = fear") are flagged as such, not stated
//  as absolute neuroscience.
// ─────────────────────────────────────────────────────────────────────────

export const REGIONS: Region[] = [
  // ── Frontal lobe ─────────────────────────────────────────────────────────
  {
    id: 'frontal-lobe',
    displayName: 'Frontal Lobe',
    kind: 'anatomical',
    system: 'cortex-frontal',
    detailLevel: 1,
    childIds: ['prefrontal-cortex', 'motor-cortex', 'brocas-area'],
    oneLiner: 'The "executive" lobe — planning, judgment, movement, and speech.',
    functionShort:
      'The frontal lobe handles executive function (planning, decision-making, impulse control), voluntary movement, and speech production.',
    functionDeep:
      'The largest lobe, sitting behind the forehead. Its prefrontal region governs judgment and personality; the motor cortex at its rear edge commands voluntary movement; and Broca’s area (usually on the left) produces speech. It is the last brain area to fully mature — into the mid-20s.',
    apUnits: [1, 3, 4],
    apTerms: ['frontal lobe', 'motor cortex', 'prefrontal cortex', 'executive function', "Broca's area"],
    relatedIds: ['prefrontal-cortex', 'motor-cortex', 'brocas-area', 'parietal-lobe'],
    misconceptions: ['The frontal lobe is not fully developed by the teenage years — it matures into the mid-20s.'],
    examTips: ['Phineas Gage’s personality change after frontal damage is the classic case study.'],
  },
  {
    id: 'prefrontal-cortex',
    displayName: 'Prefrontal Cortex',
    kind: 'anatomical',
    system: 'cortex-frontal',
    detailLevel: 2,
    parentId: 'frontal-lobe',
    oneLiner: 'Judgment, decision-making, and impulse control.',
    functionShort:
      'The prefrontal cortex is the seat of executive function: planning, decision-making, impulse control, and personality.',
    functionDeep:
      'The very front of the frontal lobe. It weighs consequences, restrains impulses, and organizes goal-directed behavior. Because it matures last, adolescents often rely more on the amygdala’s emotional responses than adult-level prefrontal control.',
    apUnits: [1, 3, 4, 5],
    apTerms: ['prefrontal cortex', 'executive function', 'impulse control'],
    relatedIds: ['frontal-lobe', 'amygdala', 'basal-ganglia'],
    examTips: ['Links to adolescent development (Unit 3) and disorders involving impulse control (Unit 5).'],
    mnemonic: 'PRE-frontal = thinking BEFORE (pre) acting.',
  },
  {
    id: 'motor-cortex',
    displayName: 'Motor Cortex',
    kind: 'anatomical',
    system: 'cortex-frontal',
    detailLevel: 2,
    parentId: 'frontal-lobe',
    oneLiner: 'Sends commands for voluntary movement.',
    functionShort:
      'A strip at the rear of the frontal lobe that controls voluntary movement, with each side controlling the opposite side of the body.',
    functionDeep:
      'Runs along the precentral gyrus. Areas needing fine control (hands, face) get disproportionate space — the "motor homunculus." It sits directly across the central sulcus from the somatosensory cortex.',
    apUnits: [1],
    apTerms: ['motor cortex', 'contralateral control'],
    relatedIds: ['somatosensory-cortex', 'frontal-lobe', 'cerebellum'],
    examTips: ['Often paired/contrasted with the somatosensory cortex (movement OUT vs. touch IN).'],
  },
  {
    id: 'brocas-area',
    displayName: "Broca's Area",
    kind: 'anatomical',
    system: 'cortex-frontal',
    detailLevel: 2,
    parentId: 'frontal-lobe',
    oneLiner: 'Produces spoken language.',
    functionShort:
      "Usually in the left frontal lobe, Broca's area controls the muscle movements that produce speech.",
    functionDeep:
      "Damage causes Broca's (expressive) aphasia: speech becomes slow and labored, but comprehension stays largely intact. Contrast this with Wernicke's area in the temporal lobe.",
    apUnits: [1, 2],
    apTerms: ["Broca's area", "Broca's aphasia", 'aphasia'],
    relatedIds: ['wernickes-area', 'frontal-lobe'],
    misconceptions: ["Broca's area is about producing speech, not understanding it — that's Wernicke's area."],
    examTips: ["BROca = BROken/halting speech. Comprehension is fine."],
    mnemonic: 'Broca = Broken speech (production).',
  },

  // ── Parietal lobe ─────────────────────────────────────────────────────────
  {
    id: 'parietal-lobe',
    displayName: 'Parietal Lobe',
    kind: 'anatomical',
    system: 'cortex-parietal',
    detailLevel: 1,
    childIds: ['somatosensory-cortex'],
    oneLiner: 'Processes touch, body position, and spatial awareness.',
    functionShort:
      'The parietal lobe processes bodily sensations — touch, temperature, pain — and helps you sense where your body is in space.',
    functionDeep:
      'Sits at the top-rear of the cortex. Its leading edge, the somatosensory cortex, maps sensation from across the body. The parietal lobe also supports spatial navigation and attention.',
    apUnits: [1],
    apTerms: ['parietal lobe', 'somatosensory cortex'],
    relatedIds: ['somatosensory-cortex', 'frontal-lobe', 'occipital-lobe'],
  },
  {
    id: 'somatosensory-cortex',
    displayName: 'Somatosensory Cortex',
    kind: 'anatomical',
    system: 'cortex-parietal',
    detailLevel: 2,
    parentId: 'parietal-lobe',
    oneLiner: 'Registers touch from all over the body.',
    functionShort:
      'A strip at the front of the parietal lobe that receives and processes touch, temperature, and pain sensations from the body.',
    functionDeep:
      'Runs along the postcentral gyrus, mirroring the motor cortex across the central sulcus. More sensitive areas (lips, fingertips) claim more cortical space — the "sensory homunculus." Sensation from one side of the body registers on the opposite hemisphere.',
    apUnits: [1],
    apTerms: ['somatosensory cortex', 'contralateral control'],
    relatedIds: ['motor-cortex', 'parietal-lobe'],
    examTips: ['Touch IN (somatosensory) vs. movement OUT (motor) — they sit on opposite sides of the central sulcus.'],
  },

  // ── Temporal lobe ─────────────────────────────────────────────────────────
  {
    id: 'temporal-lobe',
    displayName: 'Temporal Lobe',
    kind: 'anatomical',
    system: 'cortex-temporal',
    detailLevel: 1,
    childIds: ['auditory-cortex', 'wernickes-area'],
    oneLiner: 'Hearing, language comprehension, and memory.',
    functionShort:
      'The temporal lobe processes sound (auditory cortex), understands language (Wernicke’s area), and helps form memories.',
    functionDeep:
      'Located near the temples, above the ears. It houses the auditory cortex and Wernicke’s area, and its inner surface wraps around the hippocampus and amygdala, tying it closely to memory and emotion.',
    apUnits: [1, 2],
    apTerms: ['temporal lobe', 'auditory cortex', "Wernicke's area"],
    relatedIds: ['auditory-cortex', 'wernickes-area', 'hippocampus'],
  },
  {
    id: 'auditory-cortex',
    displayName: 'Auditory Cortex',
    kind: 'anatomical',
    system: 'cortex-temporal',
    detailLevel: 2,
    parentId: 'temporal-lobe',
    oneLiner: 'Processes what you hear.',
    functionShort:
      'The auditory cortex receives and interprets sound information relayed from the ears (via the thalamus).',
    functionDeep:
      'Sound energy transduced by the cochlea travels through the thalamus to the auditory cortex, where pitch and loudness are interpreted. It connects sensation & perception (Unit 1) to the ear’s mechanics.',
    apUnits: [1],
    apTerms: ['auditory cortex', 'transduction'],
    relatedIds: ['temporal-lobe', 'thalamus'],
  },
  {
    id: 'wernickes-area',
    displayName: "Wernicke's Area",
    kind: 'anatomical',
    system: 'cortex-temporal',
    detailLevel: 2,
    parentId: 'temporal-lobe',
    oneLiner: 'Understands spoken and written language.',
    functionShort:
      "Usually in the left temporal lobe, Wernicke's area is responsible for language comprehension.",
    functionDeep:
      "Damage causes Wernicke's (receptive) aphasia: speech stays fluent and grammatically smooth but is often meaningless, and comprehension is impaired. Pair it with Broca's area to remember the two halves of language.",
    apUnits: [1, 2],
    apTerms: ["Wernicke's area", "Wernicke's aphasia", 'aphasia'],
    relatedIds: ['brocas-area', 'temporal-lobe'],
    misconceptions: ["Wernicke's area handles understanding language; producing it is Broca's area."],
    examTips: ['Wernicke = Word salad (fluent but meaningless).'],
  },

  // ── Occipital lobe ────────────────────────────────────────────────────────
  {
    id: 'occipital-lobe',
    displayName: 'Occipital Lobe',
    kind: 'anatomical',
    system: 'cortex-occipital',
    detailLevel: 1,
    childIds: ['visual-cortex'],
    oneLiner: 'The brain’s visual processing center.',
    functionShort:
      'The occipital lobe, at the back of the head, receives and processes visual information from the eyes.',
    functionDeep:
      'It is the endpoint of the visual pathway: signals travel from the retina, through the optic nerve and thalamus, to the occipital lobe. This is where "seeing" actually happens — not in the eyes.',
    apUnits: [1],
    apTerms: ['occipital lobe', 'visual cortex', 'visual pathway'],
    relatedIds: ['visual-cortex', 'eye-retina', 'eye-optic-nerve'],
    examTips: ['A blow to the BACK of the head can cause vision problems — the eyes are fine, but the occipital lobe is hit.'],
  },
  {
    id: 'visual-cortex',
    displayName: 'Visual Cortex',
    kind: 'anatomical',
    system: 'cortex-occipital',
    detailLevel: 2,
    parentId: 'occipital-lobe',
    oneLiner: 'Builds images from feature detectors.',
    functionShort:
      'The visual cortex processes incoming visual signals using feature detectors — neurons that respond to specific edges, angles, and movements.',
    functionDeep:
      'Hubel and Wiesel discovered feature-detector cells here that fire for specific visual features. Higher areas then combine these features into whole perceptions. It is the brain terminal of the eye’s optic nerve.',
    apUnits: [1],
    apTerms: ['visual cortex', 'feature detectors', 'visual pathway'],
    relatedIds: ['occipital-lobe', 'eye-optic-nerve', 'eye-retina'],
    examTips: ['Hubel & Wiesel = feature detectors. The eye’s optic nerve leads here.'],
  },

  // ── Cerebellum ────────────────────────────────────────────────────────────
  {
    id: 'cerebellum',
    displayName: 'Cerebellum',
    kind: 'anatomical',
    system: 'cerebellum',
    detailLevel: 1,
    oneLiner: 'The "little brain" — balance, coordination, and procedural memory.',
    functionShort:
      'The cerebellum coordinates voluntary movement, balance, and fine motor skills, and stores procedural (implicit) memories like riding a bike.',
    functionDeep:
      'Tucked beneath the occipital lobe at the back of the brainstem. Beyond smooth movement and balance, it helps form implicit memories — automatic, "how-to" skills you perform without conscious recall. Damage causes jerky, uncoordinated movement.',
    apUnits: [1, 2],
    apTerms: ['cerebellum', 'procedural memory', 'implicit memory'],
    relatedIds: ['hippocampus', 'motor-cortex', 'basal-ganglia'],
    misconceptions: ['The cerebellum is more than just balance — it stores implicit/procedural memories too.'],
    examTips: ['Cerebellum = implicit memory (skills); hippocampus = explicit memory (facts/events).'],
    mnemonic: 'CerebELLUM helps you spELL out smooth movements.',
  },

  // ── Corpus callosum ───────────────────────────────────────────────────────
  {
    id: 'corpus-callosum',
    displayName: 'Corpus Callosum',
    kind: 'anatomical',
    system: 'deep',
    detailLevel: 1,
    oneLiner: 'The bridge between the two hemispheres.',
    functionShort:
      'A thick band of axons connecting the left and right hemispheres, letting them share information.',
    functionDeep:
      'Cutting it (to treat severe epilepsy) creates "split-brain" patients — the basis of Sperry and Gazzaniga’s research showing the hemispheres can process independently when disconnected.',
    apUnits: [1],
    apTerms: ['corpus callosum', 'split brain', 'hemispheric specialization', 'lateralization'],
    relatedIds: ['frontal-lobe', 'occipital-lobe'],
    examTips: ['Corpus callosum = the star of split-brain research (Sperry, Gazzaniga).'],
  },

  // ── Limbic system ─────────────────────────────────────────────────────────
  {
    id: 'limbic-system',
    displayName: 'Limbic System',
    kind: 'anatomical',
    system: 'limbic',
    detailLevel: 1,
    childIds: ['hippocampus', 'amygdala', 'cingulate-cortex'],
    oneLiner: 'The emotional and memory core of the brain.',
    functionShort:
      'A group of structures — including the hippocampus and amygdala — that drive emotion, memory, and motivation.',
    functionDeep:
      'Nestled between the cortex and brainstem, the limbic system ties together emotional responses (amygdala), memory formation (hippocampus), and drives regulated by the nearby hypothalamus.',
    apUnits: [1, 2, 3],
    apTerms: ['limbic system', 'hippocampus', 'amygdala'],
    relatedIds: ['hippocampus', 'amygdala', 'hypothalamus', 'cingulate-cortex'],
  },
  {
    id: 'hippocampus',
    displayName: 'Hippocampus',
    kind: 'anatomical',
    system: 'limbic',
    detailLevel: 2,
    parentId: 'limbic-system',
    oneLiner: 'Forms new explicit memories.',
    functionShort:
      'The hippocampus processes and consolidates new explicit (conscious) memories — facts and events — for long-term storage.',
    functionDeep:
      'It acts like a "save button," transferring new declarative memories into cortical storage. Damage (as in patient H.M.) causes anterograde amnesia — the inability to form new long-term memories, while old ones remain.',
    apUnits: [1, 2],
    apTerms: ['hippocampus', 'explicit memory', 'memory consolidation', 'anterograde amnesia'],
    relatedIds: ['amygdala', 'cerebellum', 'temporal-lobe'],
    misconceptions: ['The hippocampus consolidates memories; it is not where memories are permanently stored.'],
    examTips: ['Hippocampus = explicit (facts/events); cerebellum = implicit (skills). Patient H.M. is the case study.'],
    mnemonic: 'HIPPO on campus never forgets a new fact — until its hippocampus is damaged.',
  },
  {
    id: 'amygdala',
    displayName: 'Amygdala',
    kind: 'anatomical',
    system: 'limbic',
    detailLevel: 2,
    parentId: 'limbic-system',
    oneLiner: 'Drives emotion — especially fear and aggression.',
    functionShort:
      'The amygdala processes strong emotions, particularly fear and aggression, and tags memories with emotional significance.',
    functionDeep:
      'Two almond-shaped clusters that trigger rapid emotional and fight-or-flight responses, working with the hypothalamus. AP courses often call it the "fear center," but that is a simplification — it responds to many emotionally significant stimuli, not fear alone.',
    apUnits: [1, 2, 5],
    apTerms: ['amygdala', 'fight-or-flight', 'emotion'],
    relatedIds: ['hippocampus', 'hypothalamus', 'prefrontal-cortex'],
    misconceptions: ['Calling the amygdala simply the "fear center" is an AP-level simplification — it handles emotional salience broadly.'],
    examTips: ['Amygdala = emotion/fear; links to anxiety disorders (Unit 5) and emotional memory (Unit 2).'],
    mnemonic: 'A-M-Y-G-DALA sounds an alarm — think fear.',
  },
  {
    id: 'cingulate-cortex',
    displayName: 'Cingulate Cortex',
    kind: 'anatomical',
    system: 'limbic',
    detailLevel: 2,
    parentId: 'limbic-system',
    oneLiner: 'Links emotion with attention and decision-making.',
    functionShort:
      'The cingulate cortex helps regulate emotion, focus attention, and monitor conflict between choices.',
    functionDeep:
      'Curving above the corpus callosum, it bridges the emotional limbic system and the thinking cortex — involved in emotional regulation, error detection, and pain perception.',
    apUnits: [1],
    apTerms: ['cingulate cortex', 'limbic system'],
    relatedIds: ['limbic-system', 'prefrontal-cortex'],
  },

  // ── Deep structures (diencephalon + basal ganglia + endocrine link) ───────
  {
    id: 'thalamus',
    displayName: 'Thalamus',
    kind: 'anatomical',
    system: 'deep',
    detailLevel: 2,
    oneLiner: 'The brain’s sensory relay station.',
    functionShort:
      'The thalamus routes incoming sensory information (all senses except smell) to the correct cortical areas.',
    functionDeep:
      'A central "switchboard" sitting on top of the brainstem. Vision, hearing, taste, and touch pass through it on the way to the cortex — but smell bypasses it, connecting directly to emotion and memory.',
    apUnits: [1],
    apTerms: ['thalamus', 'sensory relay'],
    relatedIds: ['visual-cortex', 'auditory-cortex', 'hypothalamus'],
    misconceptions: ['Every sense routes through the thalamus EXCEPT smell (olfaction).'],
    examTips: ['Thalamus = sensory switchboard. Exception: smell.'],
    mnemonic: 'THALamus = the hall/hub everything passes through (except smell).',
  },
  {
    id: 'hypothalamus',
    displayName: 'Hypothalamus',
    kind: 'anatomical',
    system: 'deep',
    detailLevel: 2,
    childIds: ['pituitary'],
    oneLiner: 'Maintains homeostasis and directs the endocrine system.',
    functionShort:
      'The hypothalamus regulates hunger, thirst, body temperature, and sexual behavior, and controls the pituitary gland.',
    functionDeep:
      'A small but powerful regulator that keeps the body in balance (homeostasis) and links the nervous and endocrine systems by directing the pituitary gland. It also contains reward centers and helps trigger the fight-or-flight response.',
    apUnits: [1, 3],
    apTerms: ['hypothalamus', 'homeostasis', 'endocrine system', 'pituitary gland'],
    relatedIds: ['pituitary', 'amygdala', 'thalamus'],
    examTips: ['Hypothalamus controls the 4 F’s: Feeding, Fighting, Fleeing, and... reproduction. It commands the pituitary.'],
    mnemonic: 'hypoTHALAMUS keeps the "thermostat" of the body steady.',
  },
  {
    id: 'pituitary',
    displayName: 'Pituitary Gland',
    kind: 'anatomical',
    system: 'deep',
    detailLevel: 2,
    parentId: 'hypothalamus',
    oneLiner: 'The endocrine "master gland."',
    functionShort:
      'Directed by the hypothalamus, the pituitary releases hormones that control other glands throughout the body.',
    functionDeep:
      'Though called the "master gland," it takes orders from the hypothalamus. It secretes growth hormone and signals other endocrine glands, connecting the brain to slow, widespread hormonal communication.',
    apUnits: [1],
    apTerms: ['pituitary gland', 'endocrine system', 'hormones', 'master gland'],
    relatedIds: ['hypothalamus'],
    misconceptions: ['The pituitary is the "master gland," but the hypothalamus is really in charge of it.'],
  },
  {
    id: 'basal-ganglia',
    displayName: 'Basal Ganglia',
    kind: 'anatomical',
    system: 'deep',
    detailLevel: 2,
    oneLiner: 'Controls movement, habits, and reward.',
    functionShort:
      'The basal ganglia help control voluntary movement and form habits; they include the nucleus accumbens, a hub of the dopamine reward pathway.',
    functionDeep:
      'Deep clusters that smooth out movement and build procedural habits through repetition. The nucleus accumbens is central to reward and reinforcement learning. Loss of dopamine input here produces Parkinson’s tremors.',
    apUnits: [1, 3, 5],
    apTerms: ['basal ganglia', 'nucleus accumbens', 'reward pathway', 'dopamine'],
    relatedIds: ['nt-dopamine', 'cerebellum', 'prefrontal-cortex'],
    examTips: ['Nucleus accumbens + dopamine = the reward pathway behind reinforcement and addiction (Unit 3/5).'],
  },

  // ── Brainstem ─────────────────────────────────────────────────────────────
  {
    id: 'brainstem',
    displayName: 'Brainstem',
    kind: 'anatomical',
    system: 'brainstem',
    detailLevel: 1,
    childIds: ['midbrain', 'pons', 'medulla', 'reticular-formation'],
    oneLiner: 'The oldest brain region — automatic survival functions.',
    functionShort:
      'The brainstem connects the brain to the spinal cord and controls automatic survival functions like heartbeat and breathing.',
    functionDeep:
      'The evolutionarily oldest part of the brain, made of the midbrain, pons, and medulla. It keeps you alive without conscious effort and regulates arousal and alertness through the reticular formation.',
    apUnits: [1],
    apTerms: ['brainstem', 'medulla', 'reticular formation'],
    relatedIds: ['medulla', 'reticular-formation', 'cerebellum'],
  },
  {
    id: 'midbrain',
    displayName: 'Midbrain',
    kind: 'anatomical',
    system: 'brainstem',
    detailLevel: 2,
    parentId: 'brainstem',
    oneLiner: 'Relays movement and sensory signals; supports arousal.',
    functionShort:
      'The midbrain coordinates movement, eye reflexes, and relays sensory information, and contributes to arousal and alertness.',
    functionDeep:
      'The uppermost brainstem segment. It routes visual and auditory reflexes and contains dopamine-producing neurons involved in movement and reward.',
    apUnits: [1],
    apTerms: ['midbrain', 'brainstem'],
    relatedIds: ['reticular-formation', 'pons'],
  },
  {
    id: 'pons',
    displayName: 'Pons',
    kind: 'anatomical',
    system: 'brainstem',
    detailLevel: 2,
    parentId: 'brainstem',
    oneLiner: 'A bridge for movement, sleep, and arousal.',
    functionShort:
      'The pons helps coordinate movement and regulates sleep, arousal, and facial expressions, bridging the brainstem and cerebellum.',
    functionDeep:
      'Latin for "bridge," the pons relays signals between the cerebrum and cerebellum and plays a role in generating sleep and dreaming (REM).',
    apUnits: [1],
    apTerms: ['pons', 'brainstem', 'sleep'],
    relatedIds: ['medulla', 'cerebellum', 'reticular-formation'],
  },
  {
    id: 'medulla',
    displayName: 'Medulla',
    kind: 'anatomical',
    system: 'brainstem',
    detailLevel: 2,
    parentId: 'brainstem',
    oneLiner: 'Controls heartbeat and breathing.',
    functionShort:
      'The medulla controls vital automatic functions — heartbeat, breathing, and blood pressure.',
    functionDeep:
      'The base of the brainstem, just above the spinal cord. Because it governs breathing and heart rate, damage here is often fatal — no conscious effort keeps these functions running.',
    apUnits: [1],
    apTerms: ['medulla', 'brainstem'],
    relatedIds: ['pons', 'brainstem'],
    mnemonic: 'MEDulla keeps you alive — think MEDical basics: heartbeat & breathing.',
  },
  {
    id: 'reticular-formation',
    displayName: 'Reticular Formation',
    kind: 'anatomical',
    system: 'brainstem',
    detailLevel: 2,
    parentId: 'brainstem',
    oneLiner: 'The gatekeeper of arousal and attention.',
    functionShort:
      'A nerve network running through the brainstem that controls arousal, alertness, and filters incoming stimuli.',
    functionDeep:
      'The reticular formation regulates the sleep-wake cycle and consciousness, screening out routine stimuli so important signals reach the cortex. Damage can cause a permanent coma.',
    apUnits: [1],
    apTerms: ['reticular formation', 'arousal', 'consciousness'],
    relatedIds: ['brainstem', 'thalamus'],
    examTips: ['Reticular formation = arousal/alertness filter. Damage → coma.'],
  },

  // ── Cellular / schematic (Level 3) ────────────────────────────────────────
  {
    id: 'neuron',
    displayName: 'Neuron',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    childIds: ['dendrites', 'cell-body', 'action-potential', 'myelin-sheath', 'nodes-of-ranvier', 'axon-terminals', 'synapse'],
    oneLiner: 'The brain’s basic signaling cell.',
    functionShort:
      'A neuron receives signals through its dendrites, integrates them in the cell body, and fires an electrical impulse down its axon to the terminal buttons.',
    functionDeep:
      'Dendrites receive input; the soma (cell body) sums it; if it crosses the threshold, an all-or-none action potential travels down the axon. A myelin sheath insulates the axon and speeds transmission. Glial cells support and nourish neurons.',
    apUnits: [1],
    apTerms: ['neuron', 'dendrite', 'axon', 'cell body', 'myelin sheath', 'glial cells', 'terminal buttons'],
    relatedIds: ['action-potential', 'synapse'],
    misconceptions: ['Neural transmission is electrochemical: electrical WITHIN a neuron, chemical BETWEEN neurons.'],
    examTips: ['Signal path: dendrites → cell body → axon → terminal buttons → synapse.'],
  },
  {
    id: 'dendrites',
    displayName: 'Dendrites',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'neuron',
    oneLiner: 'Branches that receive incoming signals.',
    functionShort:
      'Dendrites are the branching fibers that receive neurotransmitter messages from other neurons and carry them toward the cell body.',
    functionDeep:
      'The more dendrites and connections a neuron has, the more input it can integrate. Incoming signals are either excitatory (nudging the neuron toward firing) or inhibitory (nudging it away); the cell body adds them all together.',
    apUnits: [1],
    apTerms: ['dendrites', 'excitatory', 'inhibitory'],
    relatedIds: ['cell-body', 'neuron', 'synapse'],
    mnemonic: 'Dendrites Detect incoming signals.',
  },
  {
    id: 'cell-body',
    displayName: 'Cell Body (Soma)',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'neuron',
    oneLiner: 'The neuron’s control center, holding the nucleus.',
    functionShort:
      'The cell body (soma) contains the nucleus and sums up the signals arriving from the dendrites.',
    functionDeep:
      'If the combined input crosses the neuron’s threshold, the cell body triggers an action potential that fires down the axon. The nucleus houses the cell’s DNA and keeps the neuron alive.',
    apUnits: [1],
    apTerms: ['cell body', 'soma', 'nucleus', 'threshold'],
    relatedIds: ['dendrites', 'action-potential', 'neuron'],
  },
  {
    id: 'action-potential',
    displayName: 'Action Potential',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'neuron',
    oneLiner: 'The neuron’s all-or-none electrical impulse.',
    functionShort:
      'An action potential is a brief electrical charge that travels down the axon when a neuron’s input crosses its threshold.',
    functionDeep:
      'At rest the neuron is negatively charged (resting potential). Enough stimulation reaches the threshold, triggering depolarization — an all-or-none firing at full strength. A brief refractory period must pass before it can fire again. Stronger stimuli mean more frequent firing, not bigger impulses.',
    apUnits: [1],
    apTerms: ['action potential', 'resting potential', 'threshold', 'all-or-none', 'refractory period', 'depolarization'],
    relatedIds: ['neuron', 'synapse'],
    misconceptions: ['"All-or-none" means a neuron fires at full strength or not at all — intensity is coded by firing RATE, not size.'],
    examTips: ['All-or-none law + refractory period are frequent MCQ targets.'],
  },
  {
    id: 'myelin-sheath',
    displayName: 'Myelin Sheath',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'neuron',
    oneLiner: 'Fatty insulation that speeds the signal.',
    functionShort:
      'The myelin sheath is a fatty layer that insulates the axon and dramatically speeds up neural transmission.',
    functionDeep:
      'Instead of traveling the whole axon continuously, the impulse leaps between gaps in the myelin — the nodes of Ranvier — in "saltatory" conduction. When myelin degenerates (as in multiple sclerosis), signals slow or fail.',
    apUnits: [1],
    apTerms: ['myelin sheath', 'multiple sclerosis', 'glial cells'],
    relatedIds: ['nodes-of-ranvier', 'action-potential', 'neuron'],
    mnemonic: 'Myelin = insulation on a wire; strip it and the signal breaks up.',
  },
  {
    id: 'nodes-of-ranvier',
    displayName: 'Nodes of Ranvier',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'neuron',
    oneLiner: 'Gaps in the myelin where the impulse jumps.',
    functionShort:
      'The nodes of Ranvier are the uninsulated gaps between myelin segments, where the action potential is regenerated.',
    functionDeep:
      'The impulse hops from node to node (saltatory conduction), which is far faster than creeping down a bare axon. This is how myelinated neurons transmit signals so quickly.',
    apUnits: [1],
    apTerms: ['nodes of Ranvier', 'saltatory conduction'],
    relatedIds: ['myelin-sheath', 'action-potential', 'neuron'],
  },
  {
    id: 'axon-terminals',
    displayName: 'Axon Terminals',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'neuron',
    oneLiner: 'The signal’s end — where neurotransmitters release.',
    functionShort:
      'The axon terminals (terminal buttons) at the axon’s end release neurotransmitters into the synapse when the action potential arrives.',
    functionDeep:
      'Each terminal button holds vesicles of neurotransmitter. When the impulse reaches it, the vesicles dump their chemicals across the synaptic gap to the next neuron — the hand-off from electrical signaling to chemical signaling.',
    apUnits: [1],
    apTerms: ['terminal buttons', 'axon terminals', 'neurotransmitter'],
    relatedIds: ['synapse', 'action-potential', 'neuron'],
  },
  {
    id: 'synapse',
    displayName: 'Synapse',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'neuron',
    childIds: ['synaptic-vesicles', 'synaptic-gap', 'receptor-sites', 'reuptake'],
    oneLiner: 'The chemical junction between neurons.',
    functionShort:
      'At the synapse, neurotransmitters cross the tiny gap between neurons to pass the signal chemically from one cell to the next.',
    functionDeep:
      'When the action potential reaches the terminal buttons, it releases neurotransmitters into the synaptic gap. These bind to receptor sites on the next neuron, then are cleared by reuptake. Drugs act here as agonists (mimic/boost) or antagonists (block).',
    apUnits: [1],
    apTerms: ['synapse', 'synaptic gap', 'neurotransmitter', 'receptor sites', 'reuptake', 'agonist', 'antagonist'],
    relatedIds: ['neuron', 'nt-dopamine', 'nt-serotonin', 'nt-gaba', 'nt-acetylcholine'],
    examTips: ['Agonist = mimics/increases a neurotransmitter; antagonist = blocks it.'],
  },
  {
    id: 'synaptic-vesicles',
    displayName: 'Synaptic Vesicles',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'synapse',
    oneLiner: 'Tiny sacs that store neurotransmitters.',
    functionShort:
      'Synaptic vesicles are small sacs in the terminal button that store neurotransmitters until the neuron fires.',
    functionDeep:
      'When the action potential arrives, vesicles fuse with the membrane and release their neurotransmitters into the synaptic gap. They are then refilled and recycled for the next signal.',
    apUnits: [1],
    apTerms: ['synaptic vesicles', 'neurotransmitter'],
    relatedIds: ['synapse', 'axon-terminals'],
  },
  {
    id: 'synaptic-gap',
    displayName: 'Synaptic Gap',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'synapse',
    oneLiner: 'The tiny space the chemicals cross.',
    functionShort:
      'The synaptic gap (or synaptic cleft) is the microscopic space between two neurons that neurotransmitters diffuse across.',
    functionDeep:
      'Neurons never actually touch. The releasing (presynaptic) neuron sends neurotransmitters across this gap to the receiving (postsynaptic) neuron — the reason communication between neurons is chemical, not electrical.',
    apUnits: [1],
    apTerms: ['synaptic gap', 'synaptic cleft'],
    relatedIds: ['synapse', 'receptor-sites'],
    misconceptions: ['Signaling WITHIN a neuron is electrical; BETWEEN neurons (across the gap) it is chemical.'],
  },
  {
    id: 'receptor-sites',
    displayName: 'Receptor Sites',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'synapse',
    oneLiner: 'The "locks" neurotransmitter "keys" fit into.',
    functionShort:
      'Receptor sites on the receiving neuron are shaped so that only specific neurotransmitters can bind to them, like a lock and key.',
    functionDeep:
      'When a neurotransmitter binds, it either excites or inhibits the next neuron. Drugs act here: agonists mimic a neurotransmitter and activate the receptor, while antagonists block it so the real neurotransmitter can’t bind.',
    apUnits: [1],
    apTerms: ['receptor sites', 'agonist', 'antagonist', 'lock-and-key'],
    relatedIds: ['synapse', 'synaptic-gap', 'reuptake'],
    examTips: ['Agonist = mimics/activates the receptor; antagonist = blocks it.'],
  },
  {
    id: 'reuptake',
    displayName: 'Reuptake',
    kind: 'schematic',
    system: 'cellular',
    detailLevel: 3,
    parentId: 'synapse',
    oneLiner: 'Leftover neurotransmitter is reabsorbed.',
    functionShort:
      'Reuptake is the process where the sending neuron reabsorbs excess neurotransmitter from the gap, ending the signal.',
    functionDeep:
      'After neurotransmitters have done their job, reuptake clears them so the synapse can reset. Many antidepressants (SSRIs) block serotonin reuptake, leaving more of it in the gap to keep signaling.',
    apUnits: [1, 5],
    apTerms: ['reuptake', 'reuptake inhibitor', 'SSRIs'],
    relatedIds: ['synapse', 'receptor-sites', 'nt-serotonin'],
    examTips: ['SSRIs block serotonin reuptake → more serotonin stays in the synapse.'],
  },
]
