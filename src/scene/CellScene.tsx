import { useStore } from '../store'
import { NeuronSchematic } from './NeuronSchematic'
import { SynapseSchematic } from './SynapseSchematic'

// The cellular view. Selecting the synapse dives one level further into the
// synapse diagram; everything else shows the whole neuron.
export function CellScene() {
  const selectedId = useStore((s) => s.selectedId)
  return selectedId === 'synapse' ? <SynapseSchematic /> : <NeuronSchematic />
}
