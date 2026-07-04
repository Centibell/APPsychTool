import { useStore } from '../store'
import { SYNAPSE_SCENE_IDS } from '../content'
import { NeuronSchematic } from './NeuronSchematic'
import { SynapseSchematic } from './SynapseSchematic'

// The cellular view. Selecting the synapse (or any of its sub-parts) dives one
// level further into the synapse diagram; everything else shows the whole neuron.
export function CellScene() {
  const selectedId = useStore((s) => s.selectedId)
  return selectedId && SYNAPSE_SCENE_IDS.has(selectedId) ? <SynapseSchematic /> : <NeuronSchematic />
}
