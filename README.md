# Word Superiority Task

This browser-based classroom demonstration adapts Reicher’s (1969) letter-identification experiment. The **word superiority effect** is the tendency to identify a briefly presented letter more accurately when it appears in a word than when it appears alone. The task also includes a nonword condition to compare letter identification in real words and scrambled letter strings.

## Procedure

Participants complete **6 practice trials with feedback** and **48 scored trials without feedback**. The scored trials are shuffled, with 16 trials per condition and four trials at each letter position within each condition.

| Condition | Example stimulus | Tested position | Response options |
| --- | --- | --- | --- |
| Word | `WORD` | Fourth | `D` or `K` |
| Nonword | `OWRD` | Fourth | `D` or `K` |
| Single letter | `D` in the fourth slot | Fourth | `D` or `K` |

In the word condition, either response option completes a valid word (`WORD` or `WORK`). In the nonword condition, both options complete a nonword (`OWRD` or `OWRK`). The isolated letter occupies the same screen position as the corresponding letter in a string. The stimulus bank uses newly constructed items alongside Reicher’s published example.

### Trial sequence

1. Look at the fixation cross and select **Show stimulus**. The cross stays on screen for about **500 ms** after selection.
2. The stimulus flashes in black uppercase text on a white background for approximately **50 ms**. Actual exposure can vary with the browser and display refresh rate.
3. A mask of overlapping Xs and Os immediately replaces the stimulus. Two numbered letter choices appear above the tested position at the same time.
4. Press **1** or **2**, or select a choice on screen. The mask and choices stay visible until you answer. Guess if unsure.

## Results

The results panel shows a separate accuracy bar for **words**, **nonwords**, and **single letters**. Each bar displays the number correct out of 16 and the corresponding percentage. Compare word and single-letter accuracy to examine the word superiority effect. Individual scores can vary across 16 trials per condition, so the class average provides a more stable comparison.

## Run the demo

Open the published GitHub Pages site for this repository. To run locally, start a web server from the repository folder so the page can load `stimuli.json`.

```bash
python3 -m http.server 8000
```

Then open [localhost:8000](http://localhost:8000).

| File | Purpose |
| --- | --- |
| `index.html` | Instructions, task screens, and results |
| `style.css` | Display layout and styling |
| `script.js` | Trial timing, randomisation, and scoring |
| `stimuli.json` | Practice and scored stimulus sets |

## Reference

Reicher, G. M. (1969). Perceptual recognition as a function of meaningfulness of stimulus material. *Journal of Experimental Psychology, 81*(2), 275–280. [https://doi.org/10.1037/h0027768](https://doi.org/10.1037/h0027768)
