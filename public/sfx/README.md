# Nextbot game audio

Drop audio files here and they load automatically at runtime — no code change or
rebuild needed. Missing files are harmless (that cue just stays silent).

`.mp3` is safest for browser support; `.ogg`/`.wav` also work if you rename the
URLs in `src/games/audio.ts`.

**Shipped placeholders:** `stomp.wav` (synthesized thud) and `voiceline.wav`
(SAPI text-to-speech) are already here so those cues play out of the box. Replace
them with real audio whenever you like — if you use a different extension, update
the matching URL in `src/games/audio.ts`.

| File            | When it plays                                             | Notes                                  |
| --------------- | --------------------------------------------------------- | -------------------------------------- |
| `ambient.mp3`   | Loops the whole time you're playing                       | Low dread bed; keep it quiet/droney    |
| `heartbeat.mp3` | Loops; volume swells as the bot gets close                | Steady pulse; starts silent            |
| `footsteps.mp3` | Loops while the bot is **hunting** you                    | **Positional** — pans/fades in 3D from the bot |
| `stomp.mp3`     | Repeated thud as the chaser gets **near** (cadence tightens the closer he is) | One stomp; the game repeats it |
| `stalk.mp3`     | One-shot when a stalker **peeks / rushes** into view       | Short stinger                          |
| `lunge.mp3`     | One-shot when it locks on and lunges point-blank          | Short growl/whoosh                     |
| `catch.mp3`     | One-shot on capture (the jumpscare)                       | The scream stinger                     |
| `voiceline.wav` | Mr. G's line over the capture jumpscare                   | Placeholder shipped; swap for a real recording. Add more lines by extending `MANIFEST` |

To change filenames, volumes, or add sounds, edit `MANIFEST` in
`src/games/audio.ts`.
