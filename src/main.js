import './style.css'
import Reveal from 'reveal.js'
import 'reveal.js/reveal.css'
import './theme.css'
import Zoom from 'reveal.js/plugin/zoom'

document.querySelector('#app').innerHTML = `
  <div class="reveal">
    <div class="slides">

      <!-- 1. Title -->
      <section class="title-slide" data-background-color="#1a3560">
        <h1>Conditional Diffusion Models for Downscaling &amp; Bias Correction of ESM Precipitation</h1>
        <h3>Aich et al. (2024/2026) <sup>[1]</sup></h3>
        <p>Narjes Mathlouthi</p>
        <img src="${import.meta.env.BASE_URL}img/ddpm.gif" alt="DDPM" class="title-slide-gif">
      </section>

      <!-- 2. Motivation (keep) -->
      <section>
        <h2>Motivation</h2>
        <div class="slide-two-col mt-md">
          <ul class="motivation-list">
            <li>Earth system models (ESM) are often too coarse for local precipitation analysis.</li>
            <li>Downscaling helps recover finer spatial structure.</li>
            <li>Bias correction helps align model output with observed precipitation patterns.</li>
            <li>Conditional diffusion models can be used to downscale and bias correct ESM precipitation.</li>
          </ul>
          <figure class="slide-figure">
            <img src="${import.meta.env.BASE_URL}img/motivation.png" alt="Workflow Overview">
            <figcaption>Fig. 1. Workflow overview: from coarse ESM to downscaled, bias-corrected precipitation.</figcaption>
          </figure>
        </div>
        <p class="motivation-note mt-md">GFDL-ESM4 captures broad large-scale precipitation patterns, but coarse resolution and parameterized convection limit its regional rainfall realism. ERA5 is global too, but as an observation-constrained reanalysis it is the better target field for training and evaluation.</p>
      </section>

      <!-- 3. Data Overview -->
      <section>
        <h2>Data Overview</h2>
        <p class="slide-sub">ERA5 <sup>[7]</sup> (observations) &amp; GFDL-ESM4 <sup>[8]</sup> (model)</p>
        <a class="github-source-link" href="https://github.com/aim56009/ESM_cdifffusion_downscaling_bc/tree/main" target="_blank" rel="noopener">
          <svg class="github-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          Source code
        </a>
        <div class="two-col mt-lg data-tables-col">

          <!-- ERA5 -->
          <div>
            <a class="data-table-label label--blue dt-link" href="https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview" target="_blank" rel="noopener">
              ERA5 <sup>[7]</sup> — Observational Target
            </a>
            <table class="data-table">
              <tbody>
                <tr><td class="dt-prop">Product</td><td>ECMWF global reanalysis (5th gen.)</td></tr>
                <tr><td class="dt-prop">Variable</td><td><code>tp</code> — total precipitation</td></tr>
                <tr><td class="dt-prop">Native units</td><td>m/day → mm/day (× 1000)</td></tr>
                <tr><td class="dt-prop">Temporal res.</td><td>Daily totals (<code>daymean</code>)</td></tr>
                <tr><td class="dt-prop">Spatial res.</td><td>0.25° &nbsp;<span class="res-badge res--high">~28 km</span>&nbsp; · 256 × 256</td></tr>
                <tr><td class="dt-prop">Period</td><td>1992–2014</td></tr>
                <tr><td class="dt-prop">Train / Val</td><td>1992–2011 &nbsp;/&nbsp; 2011–2014</td></tr>
                <tr><td class="dt-prop">Normalization</td><td>log + standardise + [−1, 1] rescale</td></tr>
                <tr><td class="dt-prop">Array size</td><td>256 × 256 (HR target)</td></tr>
                <tr class="dt-note"><td class="dt-prop">Note</td><td>Not ERA5-Land (0.1°, land-only) · Not hourly</td></tr>
              </tbody>
            </table>
          </div>

          <!-- GFDL -->
          <div>
            <a class="data-table-label label--orange dt-link" href="https://doi.org/10.22033/ESGF/CMIP6.1414" target="_blank" rel="noopener">
              GFDL-ESM4 <sup>[8]</sup> — Earth System Model
            </a>
            <table class="data-table">
              <tbody>
                <tr><td class="dt-prop">Product</td><td>NOAA GFDL-ESM4 (CMIP6)</td></tr>
                <tr><td class="dt-prop">Variable</td><td><code>pr</code> — precipitation flux</td></tr>
                <tr><td class="dt-prop">Raw units</td><td>kg m⁻² s⁻¹ → mm/day (× 86 400)</td></tr>
                <tr><td class="dt-prop">Temporal res.</td><td>Daily</td></tr>
                <tr><td class="dt-prop">Spatial res.</td><td>~1° lat × 1.25° lon &nbsp;<span class="res-badge res--low">~100 km</span></td></tr>
                <tr><td class="dt-prop">Period</td><td>historical (1950–2014) + SSP5-8.5 (2015–2100)</td></tr>
                <tr><td class="dt-prop">Train / Val</td><td>1992–2011 &nbsp;/&nbsp; 2011–2014</td></tr>
                <tr><td class="dt-prop">Normalization</td><td>log + standardise + [−1, 1] rescale</td></tr>
                <tr><td class="dt-prop">Array size</td><td>64 × 64 (LR input) → 256 × 256 (HR)</td></tr>
                <tr><td class="dt-prop">Realization</td><td><code>r1i1p1f1</code> · grid <code>gr1</code> · regrid to 1° × 1°</td></tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      <!-- 5. Core Challenge -->
      <section class="core-challenge-slide">
        <h2>The Core Challenge: Unpaired Data</h2>
        <p class="slide-sub">Why standard supervised machine learning fails here</p>
        <div class="three-col mt-lg">
          <div class="card card--blue">
            <div class="core-challenge-logo">
              <img src="${import.meta.env.BASE_URL}era5-logo.png" alt="ERA5" class="core-challenge-icon">
            </div>
            <h4 class="card-heading blue">OBS (ERA5)</h4>
            <p class="small muted">High resolution, accurate</p>
            <div class="data-box data-box--blue">Actual Weather (Day X)</div>
          </div>
          <div class="divider-col">
            <span class="tag tag--red">Chaotic Divergence</span>
            <p class="small muted mt-sm">Not the same weather on the same day!</p>
          </div>
          <div class="card card--orange">
            <div class="core-challenge-logo">
              <a href="https://commons.wikimedia.org/w/index.php?curid=3703247" target="_blank" rel="noopener" title="GFDL logo by Eric Marshall, Public Domain">
                <img src="${import.meta.env.BASE_URL}gfdl-logo.svg" alt="GFDL NOAA" class="core-challenge-icon">
              </a>
            </div>
            <h4 class="card-heading orange">ESM (GFDL)</h4>
            <p class="small muted">Low resolution, biased</p>
            <div class="data-box data-box--orange">Simulated Weather (Day X)</div>
          </div>
        </div>
        <div class="highlight-box highlight--blue mt-lg">
          <strong>The Aich et al. <sup>[1]</sup> Solution:</strong> Since we can't map ESM directly to OBS (they are unpaired and structurally different), we map <em>both</em> into a <em>shared embedding space</em> where they become statistically identical, then train a model to reverse the observation mapping.
        </div>
      </section>

      <!-- Core Challenge: ERA5 vs GFDL image frame -->
      <section>
        <h2>ERA5 vs GFDL</h2>
        <p class="slide-sub">Observations vs Earth System Model</p>
        <figure class="image-frame mt-lg">
          <img src="${import.meta.env.BASE_URL}img/gfdl_era5.png" alt="ERA5 and GFDL comparison">
          <figcaption>Fig. 2. Side-by-side comparison of ERA5 reanalysis (observations) and GFDL-ESM4 model output for the same region and time period.</figcaption>
        </figure>
      </section>

      <!-- 4. Shared Embedding Space -->
      <section class="methodology-slide">
        <h2>The Methodology: Shared Embedding Space</h2>
        <p class="slide-sub">Both branches enter V<sub>emb</sub>; diffusion acts only after the merge</p>

        <div class="methodology-pipeline mt-md">
          <!-- Row 1: OBS → f(OBS) → V_emb → Diffusion Model → HR output -->
          <!-- Row 2: ESM → g(ESM) → joins V_emb (parallel to row 1) -->
          <div class="methodology-grid">
            <div class="methodology-box methodology-box--obs">
              <span class="methodology-box-label">OBS (ERA5)</span>
            </div>
            <span class="methodology-arrow">→</span>
            <div class="methodology-box methodology-box--fn">
              <code>f(OBS)</code>
              <span class="methodology-box-hint">downsample + upsample + noise</span>
            </div>
            <span class="methodology-arrow">→</span>
            <div class="methodology-box methodology-box--vemb">
              <span class="methodology-box-label">V<sub>emb</sub></span>
              <span class="methodology-box-hint">f(OBS) ≈ g(ESM) in distribution</span>
            </div>
            <span class="methodology-arrow">→</span>
            <div class="methodology-box methodology-box--dm">
              <span class="methodology-box-label">Diffusion Model</span>
            </div>
            <span class="methodology-arrow">→</span>
            <div class="methodology-box methodology-box--output">
              <span class="methodology-box-label">HR ERA5-like output</span>
            </div>
            <!-- Row 2: ESM aligned under OBS -->
            <div class="methodology-box methodology-box--esm">
              <span class="methodology-box-label">ESM (GFDL)</span>
            </div>
            <span class="methodology-arrow">→</span>
            <div class="methodology-box methodology-box--fn methodology-box--orange">
              <code>g(ESM)</code>
              <span class="methodology-box-hint">upsample + QDM + noise</span>
            </div>
            <span class="methodology-arrow">→</span>
            <div class="methodology-join-cell">
              <span class="methodology-arrow methodology-arrow--diag">↗</span>
              <span class="methodology-join-label">joins V<sub>emb</sub></span>
            </div>
          </div>
        </div>

        <div class="highlight-box highlight--blue mt-lg methodology-key-idea">
          Both branches enter the shared space; only then does the diffusion model act. The model is trained to recover the observation side (V<sub>emb</sub> → OBS).
        </div>
      </section>

      <!-- 5. Role of QDM -->
      <section>
        <h2>The Role of Quantile Delta Mapping (QDM) <sup>[10]</sup></h2>
        <p class="slide-sub">Aligning the large-scale marginals before diffusion</p>
        <div class="qdm-layout mt-md">
          <div class="qdm-charts">
            <div id="qdm-pdf-chart" class="qdm-chart-box"></div>
            <div id="qdm-cdf-chart" class="qdm-chart-box"></div>
          </div>
          <ul class="qdm-figure-notes mt-md">
            <li><strong>Left (PDF):</strong> The climate model’s precipitation distribution (dashed) is shifted relative to observations (solid), indicating systematic bias before correction.</li>
            <li><strong>Right (CDF):</strong> QDM <sup>[10]</sup> maps the GFDL model value x<sub>m</sub> to the observed quantile F<sub>o</sub><sup>−1</sup>(F<sub>m</sub>(x<sub>m</sub>)) by matching cumulative probabilities across the two distributions.</li>
          </ul>
        </div>
      </section>

      <!-- Key Assumptions of the Framework -->
      <section>
        <h2>Key Assumptions of the Framework</h2>
        <p class="slide-sub">What theoretical and physical assumptions underpin this approach?</p>
        <div class="three-col mt-lg">
          <div class="card assumption-card">
            <div class="icon-badge badge--blue">1</div>
            <h4 class="card-heading blue mt-sm">Large-Scale Reliability</h4>
            <p class="small">Assumes that ESMs capture broad large-scale precipitation patterns reasonably well. After QDM <sup>[10]</sup> aligns the marginal distributions, this macro-scale structure is used as the conditioning signal.</p>
          </div>
          <div class="card assumption-card">
            <div class="icon-badge badge--purple">2</div>
            <h4 class="card-heading purple mt-sm">Noise as an Effective Low-Pass Filter</h4>
            <p class="small">Assumes that at a suitable noise scale <code>s</code>, Gaussian noise suppresses unreliable fine-scale details more than the large-scale pattern, helping transformed OBS and ESM fields become comparable.</p>
          </div>
          <div class="card assumption-card">
            <div class="icon-badge badge--green">3</div>
            <h4 class="card-heading green mt-sm">Distributional Transferability</h4>
            <p class="small">Assumes that if $f(\\mathrm{OBS})$ and $g(\\mathrm{ESM})$ are sufficiently aligned in distribution, a model trained on OBS can generalize to ESM inputs during inference.</p>
          </div>
        </div>
      </section>

      <!-- Inside the Conditional Diffusion Model -->
      <section class="dm-slide">
        <h2>Inside the Conditional Diffusion Model <sup>[11]</sup></h2>
        <p class="slide-sub">The mathematics of generating high-resolution spatial details</p>
        <div class="two-col mt-md">

          <div class="card dm-card dm-card--blue">
            <h4 class="card-heading blue">1. Forward Process (Fixed Noising)</h4>
            <p class="small mt-sm">Gradually destroys the clean image $x_0$ by adding Gaussian noise over $T$ steps. Any timestep can be sampled directly:</p>
            <div class="eq-box eq-box--latex mt-sm">$$x_t = \\sqrt{\\bar{\\alpha}_t} \\, x_0 + \\sqrt{1 - \\bar{\\alpha}_t} \\, \\varepsilon$$</div>
            <p class="small muted center-text mt-sm">$\\varepsilon \\sim \\mathcal{N}(0, I)$</p>
            <ul class="var-legend small mt-sm">
              <li><strong>$x_0$</strong> — clean image</li>
              <li><strong>$x_t$</strong> — noisy image at step $t$</li>
              <li><strong>$\\bar{\\alpha}_t$</strong> — cumulative noise schedule (controls how much signal vs. noise)</li>
              <li><strong>$\\varepsilon$</strong> — standard Gaussian noise</li>
            </ul>
            <figure class="dm-card-gif mt-sm">
              <img src="${import.meta.env.BASE_URL}img/gradual-image-noise-addition-over-time.gif" alt="Gradual noise addition over time">
              <figcaption>Fig. 3. Forward process: gradual addition of Gaussian noise over time steps.</figcaption>
            </figure>
          </div>

          <div class="card dm-card dm-card--purple">
            <h4 class="card-heading purple">2. Reverse Process (Denoising)</h4>
            <p class="small mt-sm">A U-Net $\\varepsilon_\\theta$ predicts and removes noise at each step to recover $x_{t-1}$:</p>
            <div class="eq-box eq-box--latex mt-sm">$$x_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}} \\left[ x_t - \\frac{\\beta_t}{\\sqrt{1-\\bar{\\alpha}_t}} \\, \\varepsilon_\\theta(x_t, c, t) \\right] + \\sigma_t z$$</div>
            <p class="small muted center-text mt-sm">$z \\sim \\mathcal{N}(0, I)$</p>
            <ul class="var-legend small mt-sm">
              <li><strong>$\\varepsilon_\\theta$</strong> — U-Net predicting the noise</li>
              <li><strong>$c$</strong> — condition (low-res QDM field)</li>
              <li><strong>$\\alpha_t$, $\\beta_t$</strong> — noise schedule parameters</li>
              <li><strong>$\\sigma_t z$</strong> — stochastic term (optional, zero for DDIM)</li>
            </ul>
            <figure class="dm-card-gif mt-sm">
              <img src="${import.meta.env.BASE_URL}img/image8.gif" alt="Reverse denoising process">
              <figcaption>Fig. 4. Reverse process: iterative denoising to recover the clean image.</figcaption>
            </figure>
          </div>

        </div>
        <div class="highlight-box highlight--green mt-lg">
          <strong>The Condition c:</strong> During training <code>c = f(OBS)</code>; during inference <code>c = g(ESM)</code>. The condition is concatenated as an extra spatial channel into the U-Net, guiding it to fill in high-resolution detail consistent with the large-scale macro-pattern.
        </div>
      </section>

      <!-- U-Net Architecture -->
      <section>
        <h2>The U-Net Backbone <sup>[12]</sup></h2>
        <p class="slide-sub">Encoder–decoder architecture with skip connections for spatial detail recovery</p>
        <div class="unet-layout mt-md">
          <figure class="unet-figure">
            <img src="${import.meta.env.BASE_URL}img/aich_ddpm_architecture.png" alt="Aich et al. DDPM architecture">
            <figcaption>Fig. 5. U-Net architecture for conditional diffusion (Aich et al. <sup>[1]</sup>; Palette-style <sup>[12]</sup>).</figcaption>
          </figure>
          <div class="unet-notes">
            <ul class="unet-bullets">
              <li><strong>Inputs:</strong> Noisy precipitation field x<sub>t</sub> plus conditioning field c from the shared embedding space</li>
              <li><strong>Encoder:</strong> Progressively downsamples to extract multi-scale features and large-scale context</li>
              <li><strong>Bottleneck:</strong> Lowest-resolution representation with the broadest spatial context</li>
              <li><strong>Decoder:</strong> Upsamples and combines context with skip-connected local detail to reconstruct the high-resolution field</li>
              <li><strong>Skip connections:</strong> Preserve fine-grained spatial structure by passing local features directly across the network</li>
              <li><strong>Output:</strong> A denoising prediction used at each reverse step to recover the clean high-resolution precipitation field</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Main Results — Paper Summary Table -->
      <section class="results-summary-slide">
        <h2>Main Results — Paper Summary Table</h2>
        <p class="slide-sub">A compact summary of the main quantitative and qualitative findings in <em>Aich et al. (2026) <sup>[1]</sup></em>. The diffusion model substantially improves <strong>small-scale spatial structure</strong> while preserving the trusted large-scale signal.</p>
        <div class="table-scroll mt-md">
          <table class="slide-table slide-table--compact">
            <thead>
              <tr>
                <th>Evaluation area</th>
                <th>Result</th>
                <th>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Embedding quality</td>
                <td><code>f(ERA5)</code> and <code>g(GFDL)</code> become statistically similar with closely aligned PSDs</td>
                <td>The shared embedding space works as intended</td>
              </tr>
              <tr>
                <td>Reconstruction of observations</td>
                <td>Mean bias reduced from <strong>0.27</strong> to <strong>0.21 mm d⁻¹</strong></td>
                <td>The diffusion model approximates <code>f⁻¹</code> well</td>
              </tr>
              <tr>
                <td>Large-scale preservation (ERA5)</td>
                <td><strong>SSIM = 0.85</strong>, <strong>Pearson r = 0.95</strong></td>
                <td>Large-scale patterns are preserved during reconstruction</td>
              </tr>
              <tr>
                <td>Climatology bias</td>
                <td>Absolute bias: <strong>GFDL = 0.69</strong>, <strong>DM = 0.32</strong>, <strong>QM = 0.26 mm d⁻¹</strong></td>
                <td>DM strongly improves climatology and approaches QM on large-scale mean bias</td>
              </tr>
              <tr>
                <td>Spatial climatology correlation</td>
                <td><strong>0.83 → 0.98</strong> (ERA5 vs GFDL → ERA5 vs DM)</td>
                <td>DM recovers the spatial climatology structure extremely well</td>
              </tr>
              <tr>
                <td>Small-scale spatial structure</td>
                <td>PSD of DM-corrected output aligns much more closely with ERA5 than QM or raw GFDL</td>
                <td>The main gain is realistic fine-scale spatial variability</td>
              </tr>
              <tr>
                <td>Large-scale preservation (GFDL inference)</td>
                <td><strong>SSIM = 0.77</strong>, <strong>Pearson r = 0.90</strong></td>
                <td>Trusted large-scale ESM information is retained after correction</td>
              </tr>
              <tr>
                <td>Extreme precipitation</td>
                <td>DM improves R95p and corrects return periods much better than raw GFDL</td>
                <td>Strong skill on tail behavior and rare-event statistics</td>
              </tr>
              <tr>
                <td>Future SSP5-8.5 climate signal</td>
                <td>Mean and extreme precipitation trends are preserved in downscaled output</td>
                <td>Good out-of-distribution generalization to future climates</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="three-col mt-lg">
          <div class="card limit-card limit--green">
            <h4 class="card-heading" style="color:#16a34a;">Extremes</h4>
            <p class="small">For &gt;50 mm d⁻¹ events: <strong>ERA5 4.11 y</strong>, <strong>GFDL 3.33 y</strong>, <strong>DM 4.18 y</strong>. For &gt;80 mm d⁻¹: <strong>ERA5 7.38 y</strong>, <strong>GFDL 4.60 y</strong>, <strong>DM 7.98 y</strong>.</p>
          </div>
          <div class="card limit-card limit--orange">
            <h4 class="card-heading" style="color:#c2611a;">Uncertainty</h4>
            <p class="small">50-member DM ensemble: mean CRPS <strong>0.76 vs 0.90 mm d⁻¹</strong> (bilinear baseline), with spread-skill behavior close to 1:1.</p>
          </div>
          <div class="card limit-card limit--yellow">
            <h4 class="card-heading" style="color:#ca8a04;">Generalization</h4>
            <p class="small">Performs well over South Asia and transfers to <strong>MPI-ESM-HR</strong> without retraining when the embedding scale is compatible.</p>
          </div>
        </div>
      </section>

      <!-- Main Results — Visual Comparison -->
      <section class="results-visual-slide">
        <h2>Main Results — Climate Change Signal Over South America</h2>
        <p class="slide-sub">Projected relative change: diffusion-model downscaled (0.25°) vs. original GFDL (1°)</p>
        <figure class="results-figure mt-md">
          <img src="${import.meta.env.BASE_URL}img/diffusion_results.png" alt="Climate change signal comparison">
          <figcaption>Fig. 6. Projected relative climate-change signal over South America: diffusion-model downscaled output at 0.25° versus original coarse GFDL at 1°.</figcaption>
        </figure>
        <div class="results-figure-notes mt-md">
          <div class="results-notes-col">
            <h4 class="results-notes-heading">How to read</h4>
            <ul class="results-visual-bullets">
              <li><strong>Left (A, C, E):</strong> Diffusion-model output at 0.25°</li>
              <li><strong>Right (B, D, F):</strong> Original GFDL at 1°</li>
              <li><strong>Red:</strong> Increase in future vs. historical baseline</li>
              <li><strong>Blue:</strong> Decrease</li>
              <li>Diffusion panels are smoother and more spatially detailed at finer resolution.</li>
            </ul>
          </div>
          <div class="results-notes-col">
            <h4 class="results-notes-heading">What each row shows</h4>
            <ul class="results-visual-bullets">
              <li><strong>Top (A, B):</strong> Change in mean precipitation</li>
              <li><strong>Middle (C, D):</strong> Change in Rx1Day (annual wettest day)</li>
              <li><strong>Bottom (E, F):</strong> Change in R95p (precipitation from very wet days above 95th percentile)</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 7. Situating in the Generative Landscape (hidden) -->
      <section data-visibility="hidden">
        <h2>Situating Aich et al. in the Generative Landscape</h2>
        <p class="slide-sub">Comparing Climate Downscaling to Financial Time-Series AI</p>
        <div class="two-col mt-lg">
          <div class="card compare-card compare--blue">
            <h3 class="compare-heading blue">Climate (Aich et al.)</h3>
            <ul class="plain-list">
              <li><strong>Data Type:</strong> 2D Spatial Grids (Images)</li>
              <li><strong>Core Problem:</strong> Unpaired translation — ESM is physically chaotic.</li>
              <li><strong>Conditioning:</strong> Spatial map via channel concatenation.</li>
              <li><strong>Structural Bias:</strong> Addressed via QDM <em>before</em> diffusion.</li>
            </ul>
          </div>
          <div class="card compare-card compare--green">
            <h3 class="compare-heading green">Finance (Syllabus Papers)</h3>
            <ul class="plain-list">
              <li><strong>Data Type:</strong> 1D Time Series / Tabular</li>
              <li><strong>Core Problem:</strong> Forecasting or unconditional synthetic generation.</li>
              <li><strong>Conditioning:</strong> Historical sequences (ScoreGrad), Financial Factors (Gao, Chen).</li>
              <li><strong>Structural Bias:</strong> Factor models or dynamic optimal transport.</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Literature Network Map -->
      <section class="literature-network-slide">
        <h2>Situating Aich et al. in the Generative Landscape</h2>
        <p class="slide-sub">Connecting Methodologies Across Domains</p>
        <div class="net-wrap mt-md">
          <svg viewBox="0 0 860 390" class="net-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"/>
              </marker>
            </defs>

            <!-- Edge: Aich → ScoreGrad -->
            <line x1="340" y1="165" x2="210" y2="85" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr)"/>
            <rect x="220" y="108" width="120" height="22" rx="4" fill="#f8fafc" stroke="#dbeafe"/>
            <text x="280" y="123" text-anchor="middle" font-size="9" fill="#64748b" font-family="IBM Plex Sans,sans-serif">Spatial vs Recurrent</text>

            <!-- Edge: Aich → SBTS -->
            <line x1="340" y1="195" x2="210" y2="305" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr)"/>
            <rect x="218" y="238" width="130" height="22" rx="4" fill="#f8fafc" stroke="#dbeafe"/>
            <text x="283" y="253" text-anchor="middle" font-size="9" fill="#64748b" font-family="IBM Plex Sans,sans-serif">Static Map vs Transport</text>

            <!-- Edge: Aich → Chen -->
            <line x1="520" y1="165" x2="650" y2="85" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr)"/>
            <rect x="520" y="108" width="130" height="22" rx="4" fill="#f8fafc" stroke="#dbeafe"/>
            <text x="585" y="123" text-anchor="middle" font-size="9" fill="#64748b" font-family="IBM Plex Sans,sans-serif">Marginal vs Systematic</text>

            <!-- Edge: Aich → Gao -->
            <line x1="520" y1="195" x2="650" y2="305" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr)"/>
            <rect x="520" y="238" width="120" height="22" rx="4" fill="#f8fafc" stroke="#dbeafe"/>
            <text x="580" y="253" text-anchor="middle" font-size="9" fill="#64748b" font-family="IBM Plex Sans,sans-serif">Exogenous Anchors</text>

            <!-- Edge: Aich → Uehara -->
            <line x1="430" y1="215" x2="430" y2="318" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr)"/>
            <rect x="355" y="260" width="150" height="22" rx="4" fill="#f8fafc" stroke="#dbeafe"/>
            <text x="430" y="275" text-anchor="middle" font-size="9" fill="#64748b" font-family="IBM Plex Sans,sans-serif">Input vs Output (RL)</text>

            <!-- Edge: ScoreGrad → SBTS -->
            <line x1="130" y1="100" x2="130" y2="295" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr)"/>
            <rect x="50" y="190" width="108" height="22" rx="4" fill="#f8fafc" stroke="#dbeafe"/>
            <text x="104" y="205" text-anchor="middle" font-size="9" fill="#64748b" font-family="IBM Plex Sans,sans-serif">Generative Time-Series</text>

            <!-- Edge: Chen → Gao -->
            <line x1="730" y1="100" x2="730" y2="295" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr)"/>
            <rect x="678" y="190" width="104" height="22" rx="4" fill="#f8fafc" stroke="#dbeafe"/>
            <text x="730" y="205" text-anchor="middle" font-size="9" fill="#64748b" font-family="IBM Plex Sans,sans-serif">Financial Factors</text>

            <!-- Node: Aich (center, navy) -->
            <rect x="340" y="140" width="180" height="75" rx="10" fill="#1a3560" stroke="#1e5fa8" stroke-width="2"/>
            <text x="430" y="170" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff" font-family="IBM Plex Serif,serif">Aich et al. (2024)</text>
            <text x="430" y="188" text-anchor="middle" font-size="10" fill="#93c5fd" font-family="IBM Plex Sans,sans-serif">Climate Downscaling</text>
            <text x="430" y="206" text-anchor="middle" font-size="9" fill="#bfdbfe" font-family="IBM Plex Sans,sans-serif">★ Central Paper</text>

            <!-- Node: ScoreGrad (top-left, green) -->
            <rect x="50" y="48" width="160" height="60" rx="8" fill="#14532d" stroke="#16a34a" stroke-width="1.5"/>
            <text x="130" y="73" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff" font-family="IBM Plex Serif,serif">ScoreGrad (2021)</text>
            <text x="130" y="91" text-anchor="middle" font-size="10" fill="#86efac" font-family="IBM Plex Sans,sans-serif">TS Feature Extraction</text>

            <!-- Node: SBTS (bottom-left, purple) -->
            <rect x="50" y="295" width="160" height="60" rx="8" fill="#3b0764" stroke="#7c3aed" stroke-width="1.5"/>
            <text x="130" y="320" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff" font-family="IBM Plex Serif,serif">Hamdouche (SBTS)</text>
            <text x="130" y="338" text-anchor="middle" font-size="10" fill="#d8b4fe" font-family="IBM Plex Sans,sans-serif">Optimal Transport</text>

            <!-- Node: Chen (top-right, green) -->
            <rect x="650" y="48" width="160" height="60" rx="8" fill="#14532d" stroke="#16a34a" stroke-width="1.5"/>
            <text x="730" y="73" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff" font-family="IBM Plex Serif,serif">Chen et al. (2025)</text>
            <text x="730" y="91" text-anchor="middle" font-size="10" fill="#86efac" font-family="IBM Plex Sans,sans-serif">Diffusion Factor Models</text>

            <!-- Node: Gao (bottom-right, green) -->
            <rect x="650" y="295" width="160" height="60" rx="8" fill="#14532d" stroke="#16a34a" stroke-width="1.5"/>
            <text x="730" y="320" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff" font-family="IBM Plex Serif,serif">Gao et al. (2025)</text>
            <text x="730" y="338" text-anchor="middle" font-size="10" fill="#86efac" font-family="IBM Plex Sans,sans-serif">Factor Conditional Portfolios</text>

            <!-- Node: Uehara/Yoon (bottom-center, amber) -->
            <rect x="340" y="318" width="180" height="60" rx="8" fill="#451a03" stroke="#ca8a04" stroke-width="1.5"/>
            <text x="430" y="343" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff" font-family="IBM Plex Serif,serif">Uehara / Yoon / Yuan</text>
            <text x="430" y="361" text-anchor="middle" font-size="10" fill="#fde68a" font-family="IBM Plex Sans,sans-serif">RL &amp; Entropy Control</text>
          </svg>
        </div>
        <table class="slide-table slide-table--compact mt-md">
          <thead>
            <tr>
              <th>Paper / Theme</th>
              <th>Core Problem</th>
              <th>How Bias/Shift is Handled</th>
              <th>Role of Diffusion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="cell--blue">Aich et al. (Climate) <sup>[1]</sup></td>
              <td>Unpaired Spatial Data</td>
              <td>Input mapping (QDM <sup>[10]</sup> + Noise)</td>
              <td>Small-scale texture generation</td>
            </tr>
            <tr>
              <td class="cell--green">Chen et al. (Finance) <sup>[3]</sup></td>
              <td>High-Dim Structure</td>
              <td>Factor models isolate systematic risk</td>
              <td>Idiosyncratic noise generation</td>
            </tr>
            <tr>
              <td class="cell--yellow">Uehara / Yoon (RL on DM) <sup>[6]</sup></td>
              <td>Optimizing specific goals</td>
              <td>RL fine-tuning (Rewards)</td>
              <td>Prior distribution to guide RL</td>
            </tr>
            <tr>
              <td class="cell--purple">Hamdouche (SBTS) <sup>[5]</sup></td>
              <td>Time series interpolation</td>
              <td>Optimal Transport (Schrödinger)</td>
              <td>Dynamic bridging b/w marginals</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Limitations & Future Directions -->
      <section>
        <h2>Limitations &amp; Future Directions</h2>
        <p class="slide-sub">Current constraints of the methodology</p>
        <div class="stack mt-lg">
          <div class="limit-card limit--red">
            <h4 class="card-heading" style="color:#dc2626;">1. Lack of Small-Scale Temporal Consistency</h4>
            <p class="small">The model processes 2D spatial snapshots independently. While large-scale temporal consistency is inherited from the ESM condition, small-scale stochastic noise is not linked day-to-day. </p>
          </div>
          <div class="two-col">
            <div class="limit-card limit--orange">
              <h4 class="card-heading" style="color:#c2611a;">2. Hyperparameter Tuning</h4>
              <p class="small">The noise scale <code>s</code> must be determined by finding where OBS and ESM power spectra intersect — and rechecked for every new ESM introduced.</p>
            </div>
            <div class="limit-card limit--yellow">
              <h4 class="card-heading" style="color:#ca8a04;">3. Computational Expense</h4>
              <p class="small">Like all DDPMs, inference requires many iterative reverse steps (100 in this paper), making it slower than GANs or one-step consistency models.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Summary -->
      <section class="summary-slide">
        <h2>Summary</h2>
        <p class="slide-sub">Key conceptual takeaways from the Aich et al. framework</p>
        <ul class="summary-points mt-lg">
          <li><strong>Conditional score-based generative model:</strong> The framework learns $\\nabla_x \\log p(x_t | c)$ implicitly through $\\varepsilon_\\theta$.</li>
          <li><strong>Embedding as domain adaptation:</strong> The embedding strategy can be viewed as aligning $p_{\\mathrm{ESM}}$ and $p_{\\mathrm{OBS}}$ via Gaussian convolution.</li>
          <li><strong>Noise injection as diffusion bridge:</strong> Intentionally degrading both sources to a common information level — analogous to the diffusion bridge concept.</li>
        </ul>
      </section>

      <!-- Thank You -->
      <section>
        <h2>Thank You</h2>
      </section>

      <!-- Q&A -->
      <section>
        <h2>Questions &amp; Discussion</h2>
      </section>

      <!-- References -->
      <section class="references-slide">
        <h2>References</h2>
        <div class="references-list">
          <p><sup>[1]</sup> Aich, S., et al. (2024). Conditional diffusion models for downscaling and bias correction of Earth system model precipitation. <em>arXiv:2404.14416</em>. Published in <em>Geosci. Model Dev.</em> 19, 1791–1816 (2026).</p>
          <p><sup>[2]</sup> Yan, T., et al. (2021). ScoreGrad: Multivariate probabilistic time series forecasting with continuous energy-based generative models. <em>arXiv:2106.10121</em>.</p>
          <p><sup>[3]</sup> Chen, Z., et al. (2025). Diffusion factor models: Generating high-dimensional returns with factor structure. <em>arXiv:2504.06566</em>.</p>
          <p><sup>[4]</sup> Gao, X., He, X., &amp; He, X. (2025). Factor-based conditional diffusion model for portfolio optimization. <em>arXiv:2509.22088</em>.</p>
          <p><sup>[5]</sup> Hamdouche, M., Henry-Labordère, P., &amp; Pham, H. (2023). Nonparametric generative modeling for time series via Schrödinger bridge. <em>HAL hal-04063041</em>.</p>
          <p><sup>[6]</sup> Uehara, M., et al. Reward-guided iterative refinement in diffusion models. Entropy-regularized control for diffusion fine-tuning. <em>NeurIPS/ICML</em>.</p>
          <p><sup>[7]</sup> Copernicus Climate Change Service (C3S) (2017): ERA5: Fifth generation of ECMWF atmospheric reanalyses of the global climate. Copernicus Climate Change Service Climate Data Store (CDS). <a href="https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview" target="_blank" rel="noopener">https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels</a></p>
          <p><sup>[8]</sup> John, J. G., et al. (2018). NOAA-GFDL GFDL-ESM4 model output prepared for CMIP6 ScenarioMIP. Earth System Grid Federation. <a href="https://doi.org/10.22033/ESGF/CMIP6.1414" target="_blank" rel="noopener">https://doi.org/10.22033/ESGF/CMIP6.1414</a></p>
          <p><sup>[9]</sup> Karras, T., Aittala, M., Aila, T., &amp; Laine, S. (2022). Elucidating the design space of diffusion-based generative models. <em>arXiv:2206.00364</em>.</p>
          <p><sup>[10]</sup> Cannon, A. J., Sobie, S. R., &amp; Murdock, T. Q. (2015). Bias correction of GCM precipitation by quantile mapping: how well do methods preserve changes in quantiles and extremes? <em>J. Climate</em>, 28, 6938–6959.</p>
          <p><sup>[11]</sup> Ho, J., Saharia, C., Chan, W., Fleet, D. J., Norouzi, M., &amp; Salimans, T. (2022). Cascaded diffusion models for high fidelity image generation. <em>J. Mach. Learn. Res.</em>, 23, 1–33.</p>
          <p><sup>[12]</sup> Saharia, C., Chan, W., Chang, H., Lee, C., Ho, J., Salimans, T., Fleet, D., &amp; Norouzi, M. (2022). Palette: Image-to-image diffusion models. <em>ACM SIGGRAPH 2022 Conference Proceedings</em>, 1–10. <a href="https://doi.org/10.1145/3528233.3530757" target="_blank" rel="noopener">https://doi.org/10.1145/3528233.3530757</a></p>
        </div>
      </section>

      <!-- Appendices -->
      <section>
        <h2>Appendices</h2>
        <p class="slide-sub">Detailed comparisons across domains</p>
      </section>

      <!-- Appendix A: Comparison 1 -->
      <section>
        <h2>Appendix A: Structural Scale Separation</h2>
        <p class="slide-sub">Aich vs. Diffusion Factor Models (Chen et al.)</p>
        <p class="small mt-md">Both domains rely on a key principle: <strong>Do not make the diffusion model learn everything.</strong> Isolate macroscopic/systematic from microscopic/idiosyncratic components.</p>
        <div class="two-col mt-lg">
          <div class="card scale-card scale--blue">
            <h4 class="card-heading blue">Aich et al. (Climate) <sup>[1]</sup></h4>
            <div class="scale-row">
              <span>Large-Scale Trends</span>
              <span class="tag tag--blue">QDM Mapping <sup>[10]</sup></span>
            </div>
            <div class="scale-row">
              <span>Small-Scale Details</span>
              <span class="tag tag--purple">Diffusion Model</span>
            </div>
            <p class="small muted mt-sm">Diffusion acts as a super-resolution / detailing engine.</p>
          </div>
          <div class="card scale-card scale--green">
            <h4 class="card-heading green">Chen et al. (Finance) <sup>[3]</sup></h4>
            <div class="scale-row">
              <span>Systematic Returns</span>
              <span class="tag tag--green">Factor Structure</span>
            </div>
            <div class="scale-row">
              <span>Idiosyncratic Noise</span>
              <span class="tag tag--purple">Diffusion Model</span>
            </div>
            <p class="small muted mt-sm">Diffusion acts as a residual / noise generator.</p>
          </div>
        </div>
      </section>

      <!-- Appendix B: Comparison 2 -->
      <section>
        <h2>Appendix B: Steering &amp; Conditioning</h2>
        <p class="slide-sub">Aich vs. ScoreGrad / Factor-Based Models</p>
        <div class="stack mt-lg">
          <div class="highlight-box highlight--blue">
            <strong>Aich et al. <sup>[1]</sup> — Spatial Feature Maps:</strong> Conditions the U-Net by concatenating the noisy, low-resolution QDM <sup>[10]</sup> image directly into input channels. The network "sees" the large-scale map and fills in the texture.
          </div>
          <div class="highlight-box highlight--green">
            <strong>Yan et al. (ScoreGrad) <sup>[2]</sup> — Time-Series Extraction:</strong> Uses an explicit feature extraction step (RNNs / TCNs) to process the historical sequence, generating a condition vector that guides the continuous energy-based score network.
          </div>
          <div class="highlight-box highlight--green">
            <strong>Gao et al. <sup>[4]</sup> — Factor Conditioning:</strong> Conditions generation of asset returns on macroeconomic factors. Similar to Aich relying on QDM <sup>[10]</sup> for macro trends, Gao relies on exogenous factors to anchor the portfolio diffusion.
          </div>
        </div>
      </section>

      <!-- Appendix C: Comparison 3 -->
      <section>
        <h2>Appendix C: Distribution Matching</h2>
        <p class="slide-sub">Aich vs. Uehara / Yoon &amp; Schrödinger Bridges</p>
        <p class="small mt-sm">How do we force a diffusion model to generate the <em>right</em> distribution?</p>
        <div class="stack mt-md">
          <div class="highlight-box highlight--blue">
            <strong>Aich et al. <sup>[1]</sup> — Input-Side Mapping:</strong> Trains standard DM on OBS. Solves distribution shift by forcing the inference input <code>g(ESM)</code> to look identically distributed to the training input <code>f(OBS)</code>.
          </div>
          <div class="highlight-box highlight--yellow">
            <strong>Uehara / Yoon <sup>[6]</sup> — Output-Side Fine-Tuning:</strong> Treats DM generation as an MDP. Uses Entropy-Regularized Control / Max-Ent RL to fine-tune the score function to maximize a specific reward while regularizing against a prior.
          </div>
          <div class="highlight-box highlight--purple">
            <strong>Hamdouche (SBTS) <sup>[5]</sup> — Optimal Transport:</strong> Schrödinger Bridges compute the most likely stochastic path between two known marginal distributions. Instead of a fixed Gaussian noise schedule, SBTS explicitly solves for the transition dynamics between distributions.
          </div>
        </div>
      </section>

      <!-- Appendix D: Diffusion Pipeline Summary -->
      <section class="appendix-table-slide">
        <div class="appendix-table-header">
          <h2>Appendix D: Diffusion Pipeline Summary</h2>
          <p class="slide-sub">Imagen (Palette-style) <sup>[12]</sup> vs. EDM (NVIDIA Modulus) <sup>[9]</sup></p>
        </div>
        <div class="table-scroll">
          <table class="slide-table slide-table--compact">
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Imagen (Palette-style) <sup>[12]</sup></th>
                <th>EDM (NVIDIA Modulus) <sup>[9]</sup></th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Sampling</td><td>DDPM-style iterative denoising</td><td>Stochastic sampler (Algorithm 2)</td></tr>
              <tr><td>Sampling steps</td><td>100</td><td>18</td></tr>
              <tr><td>Time / noise schedule</td><td>Continuous $t \\in [0, 1]$</td><td>$\\sigma$ discretized with $\\rho = 7$</td></tr>
              <tr><td>Schedule formula</td><td>log_snr = α_cosine(t) or β_linear(t)</td><td>$t_i = (\\sigma_{\\max}^{1/\\rho} + \\frac{i}{N-1}(\\sigma_{\\min}^{1/\\rho} - \\sigma_{\\max}^{1/\\rho}))^\\rho$</td></tr>
              <tr><td>σ range</td><td>Implicit via α, σ from log_snr</td><td>$\\sigma_{\\min} = 0.002$, $\\sigma_{\\max} = 800$</td></tr>
              <tr><td>σ sampling (training)</td><td>$t \\sim U(0, 1)$</td><td>$\\sigma = \\exp(\\mathrm{rnd}·P_{\\mathrm{std}} + P_{\\mathrm{mean}})$, $P_{\\mathrm{mean}} = -1.2$, $P_{\\mathrm{std}} = 1.2$</td></tr>
              <tr><td>Forward process</td><td>$x_t = \\alpha x_0 + \\sigma \\varepsilon$</td><td>$x_t = x_0 + \\sigma \\varepsilon$</td></tr>
              <tr><td>α, σ from</td><td>α, σ = √sigmoid(log_snr), √sigmoid(−log_snr)</td><td>Direct σ (no α)</td></tr>
              <tr><td>Prediction target</td><td>v (velocity) or ε (noise) or x₀</td><td>Denoised $D_\\theta(x; \\sigma)$</td></tr>
              <tr><td>Preconditioning</td><td>None (raw UNet)</td><td>$c_{\\mathrm{skip}}$, $c_{\\mathrm{out}}$, $c_{\\mathrm{in}}$, $c_{\\mathrm{noise}}$</td></tr>
              <tr><td>c_skip</td><td>—</td><td>$\\sigma_{\\mathrm{data}}^2 / (\\sigma^2 + \\sigma_{\\mathrm{data}}^2)$</td></tr>
              <tr><td>c_out</td><td>—</td><td>$\\sigma \\sigma_{\\mathrm{data}} / \\sqrt{\\sigma^2 + \\sigma_{\\mathrm{data}}^2}$</td></tr>
              <tr><td>c_in</td><td>—</td><td>$1 / \\sqrt{\\sigma^2 + \\sigma_{\\mathrm{data}}^2}$</td></tr>
              <tr><td>c_noise</td><td>—</td><td>$\\log(\\sigma) / 4$</td></tr>
              <tr><td>σ_data</td><td>—</td><td>0.5</td></tr>
              <tr><td>Network input</td><td>[x_noisy, log_snr, lowres_cond, lowres_noise_times]</td><td>[c_in·x ‖ img_lr], c_noise (scalar embedding)</td></tr>
              <tr><td>Network output</td><td>v or ε or x₀</td><td>$F_\\theta(x; \\sigma)$ (raw)</td></tr>
              <tr><td>Effective output</td><td>x̂₀ from v/ε</td><td>$D_x = c_{\\mathrm{skip}} x + c_{\\mathrm{out}} F_\\theta(x)$</td></tr>
              <tr><td>LR conditioning</td><td>Lowres image (optionally noised)</td><td>img_lr concatenated with scaled x</td></tr>
              <tr><td>LR noise schedule</td><td>Linear, sample level 0 or 0.2</td><td>Not used</td></tr>
              <tr><td>Loss weight</td><td>min_snr (optional)</td><td>$(\\sigma^2 + \\sigma_{\\mathrm{data}}^2) / (\\sigma \\sigma_{\\mathrm{data}})^2$</td></tr>
              <tr><td>Solver</td><td>DDIM / DDPM step</td><td>Euler + 2nd-order correction</td></tr>
              <tr><td>Churn (S_churn)</td><td>—</td><td>0 (disabled)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Appendix E: DDPM Algorithms -->
      <section class="appendix-algorithms-slide">
        <h2>Appendix E: DDPM Algorithm</h2>
        <p class="slide-sub">Training and sampling (Ho et al., 2020)</p>
        <div class="algorithm-two-col mt-md">
          <div class="algorithm-box">
            <h4 class="algorithm-heading">Training (Algorithm 1)</h4>
            <ol class="algorithm-steps">
              <li>Sample $x_0 \\sim q(x_0)$ (ERA5 precipitation field)</li>
              <li>Sample $t \\sim \\mathrm{Uniform}\\{1, \\ldots, T\\}$</li>
              <li>Sample $\\varepsilon \\sim \\mathcal{N}(0, I)$</li>
              <li>Compute noisy sample: $x_t = \\sqrt{\\bar{\\alpha}_t} \\, x_0 + \\sqrt{1 - \\bar{\\alpha}_t} \\, \\varepsilon$</li>
              <li>Take gradient step on: $\\nabla_\\theta \\|\\varepsilon - \\varepsilon_\\theta(x_t, t, c)\\|^2$</li>
            </ol>
          </div>
          <div class="algorithm-box">
            <h4 class="algorithm-heading">Sampling (Algorithm 2)</h4>
            <ol class="algorithm-steps">
              <li>Initialize $x_T \\sim \\mathcal{N}(0, I)$</li>
              <li>For $t = T, T-1, \\ldots, 1$:
                <ul class="algorithm-sublist">
                  <li>$z \\sim \\mathcal{N}(0, I)$ if $t > 1$, else $z = 0$</li>
                  <li>$x_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}} \\left[ x_t - \\frac{\\beta_t}{\\sqrt{1-\\bar{\\alpha}_t}} \\, \\varepsilon_\\theta(x_t, t, c) \\right] + \\sigma_t z$</li>
                </ul>
              </li>
              <li>Return $x_0$</li>
            </ol>
          </div>
        </div>
      </section>

    </div>
  </div>
`

const deck = new Reveal({
  hash: true,
  slideNumber: true,
  controls: true,
  progress: true,
  center: true,
  width: 1280,
  height: 800,
  plugins: [Zoom],
})

deck.initialize().then(() => {
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.querySelector('.reveal .slides'), {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    })
  }

  const footer = document.createElement('div')
  footer.className = 'reveal-footer'
  footer.textContent = 'PSTAT 262DM · Narjes Mathlouthi · Winter 2026'
  document.querySelector('.reveal-viewport').appendChild(footer)

  const qr = document.createElement('div')
  qr.className = 'slide-qr'
  qr.innerHTML = `
    <a href="https://arxiv.org/abs/2404.14416" target="_blank" title="Aich et al. (2024) — arXiv:2404.14416">
      <img
        src="https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=https://arxiv.org/abs/2404.14416&color=1a3560&bgcolor=ffffff&margin=2"
        alt="QR code — arXiv:2404.14416"
        width="72" height="72"
      >
    </a>
  `
  document.querySelector('.reveal-viewport').appendChild(qr)

  // ── QDM Plotly charts ────────────────────────────────
  function normalPDF(x, mu, sigma) {
    return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))
  }
  function erf(x) {
    const s = x < 0 ? -1 : 1, ax = Math.abs(x)
    const t = 1 / (1 + 0.3275911 * ax)
    const p = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))))
    return s * (1 - p * Math.exp(-ax * ax))
  }
  function normalCDF(x, mu, sigma) {
    return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))))
  }

  const xs = Array.from({ length: 300 }, (_, i) => i * 12 / 299)   // 0 → 12 mm/day
  const muObs = 6, sigObs = 1.5
  const muMod = 4, sigMod = 2.0

  const pdfObs = xs.map(x => normalPDF(x, muObs, sigObs))
  const pdfMod = xs.map(x => normalPDF(x, muMod, sigMod))
  const cdfObs = xs.map(x => normalCDF(x, muObs, sigObs))
  const cdfMod = xs.map(x => normalCDF(x, muMod, sigMod))

  // Quantile mapping illustration at p = 0.35
  const p = 0.35
  // Approximate quantile via the arrays
  const xMod = xs[cdfMod.findIndex(v => v >= p)]
  const xObs = xs[cdfObs.findIndex(v => v >= p)]
  const yPdfMod = normalPDF(xMod, muMod, sigMod)
  const yPdfObs = normalPDF(xObs, muObs, sigObs)

  const chartW = 520, chartH = 300
  const baseLayout = {
    width: chartW,
    height: chartH,
    autosize: false,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor:  '#f8fafc',
    margin: { t: 20, r: 12, b: 40, l: 50 },
    font: { family: 'IBM Plex Sans, sans-serif', size: 10.5, color: '#2d3748' },
    xaxis: {
      title: { text: 'Daily precipitation (mm/day)', font: { size: 10 }, standoff: 6 },
      range: [0, 11], showgrid: true, gridcolor: '#e2e8f0', zeroline: false,
      linecolor: '#94a3b8', tickcolor: '#94a3b8', tickfont: { size: 10 },
    },
    showlegend: true,
    legend: { x: 0.02, y: 0.98, xanchor: 'left', yanchor: 'top',
              bgcolor: 'rgba(255,255,255,0.9)', bordercolor: '#dbeafe',
              borderwidth: 1, font: { size: 9.5 }, tracegroupgap: 2 },
  }

  // ── PDF chart ──
  const obsTrace = { x: xs, y: pdfObs, type: 'scatter', mode: 'lines', name: 'PDF – Observations',
    line: { color: '#1a3560', width: 2.5 } }
  const modTrace = { x: xs, y: pdfMod, type: 'scatter', mode: 'lines', name: 'PDF – Climate model',
    line: { color: '#3b82c4', width: 2, dash: 'dash' } }
  const dotMod = { x: [xMod], y: [yPdfMod], type: 'scatter', mode: 'markers', showlegend: false,
    marker: { color: '#ef4444', size: 9, symbol: 'circle' } }
  const dotObs = { x: [xObs], y: [yPdfObs], type: 'scatter', mode: 'markers', showlegend: false,
    marker: { color: '#ef4444', size: 9, symbol: 'circle' } }

  const pdfMax = Math.max(...pdfObs, ...pdfMod)

  Plotly.newPlot('qdm-pdf-chart', [obsTrace, modTrace, dotMod, dotObs], {
    ...baseLayout,
    yaxis: { title: { text: 'Probability density', font: { size: 10 }, standoff: 4 },
             range: [-0.01, pdfMax * 1.12], showgrid: true, gridcolor: '#e2e8f0',
             zeroline: false, linecolor: '#94a3b8', tickcolor: '#94a3b8', tickfont: { size: 10 } },
    annotations: [
      { x: xMod, y: yPdfMod, xref: 'x', yref: 'y',
        text: 'Model quantile', showarrow: true, arrowhead: 2, arrowsize: 0.8,
        arrowcolor: '#ef4444', ax: -48, ay: 32, font: { size: 9.5, color: '#ef4444' } },
      { x: xObs, y: yPdfObs, xref: 'x', yref: 'y',
        text: 'Obs quantile', showarrow: true, arrowhead: 2, arrowsize: 0.8,
        arrowcolor: '#ef4444', ax: 42, ay: 32, font: { size: 9.5, color: '#ef4444' } },
    ],
    shapes: [
      { type: 'line', x0: xMod, x1: xObs, y0: -0.005, y1: -0.005,
        xref: 'x', yref: 'y', line: { color: '#ef4444', width: 2 } },
      // arrowhead right
      { type: 'line', x0: xObs, x1: xObs - 0.3, y0: -0.005, y1: 0.002,
        xref: 'x', yref: 'y', line: { color: '#ef4444', width: 2 } },
      { type: 'line', x0: xObs, x1: xObs - 0.3, y0: -0.005, y1: -0.012,
        xref: 'x', yref: 'y', line: { color: '#ef4444', width: 2 } },
    ],
  }, { responsive: false, displayModeBar: false })

  // ── CDF chart ──
  const obsCdfTrace = { x: xs, y: cdfObs, type: 'scatter', mode: 'lines', name: 'CDF – Observations',
    line: { color: '#1a3560', width: 2.5 } }
  const modCdfTrace = { x: xs, y: cdfMod, type: 'scatter', mode: 'lines', name: 'CDF – Climate model',
    line: { color: '#3b82c4', width: 2, dash: 'dash' } }
  const hLine = { x: [0, xMod, xMod, null, xObs, xObs], y: [p, p, 0, null, p, 0],
    type: 'scatter', mode: 'lines', showlegend: false,
    line: { color: '#ef4444', width: 1.4, dash: 'dot' } }
  const dotCdfMod = { x: [xMod], y: [p], type: 'scatter', mode: 'markers', showlegend: false,
    marker: { color: '#ef4444', size: 9 } }
  const dotCdfObs = { x: [xObs], y: [p], type: 'scatter', mode: 'markers', showlegend: false,
    marker: { color: '#ef4444', size: 9 } }

  Plotly.newPlot('qdm-cdf-chart', [obsCdfTrace, modCdfTrace, hLine, dotCdfMod, dotCdfObs], {
    ...baseLayout,
    margin: { t: 20, r: 12, b: 52, l: 50 },
    yaxis: { title: { text: 'Cumulative probability', font: { size: 10 }, standoff: 4 },
             range: [0, 1.05], showgrid: true, gridcolor: '#e2e8f0',
             zeroline: false, linecolor: '#94a3b8', tickcolor: '#94a3b8', tickfont: { size: 10 } },
    annotations: [
      { x: xMod, y: 0, xref: 'x', yref: 'y',
        text: '(x<sub>m</sub>)', showarrow: false, font: { size: 10, color: '#ef4444' },
        bgcolor: 'rgba(255,255,255,0.9)', bordercolor: '#ef4444', borderwidth: 1, borderpad: 3,
        yanchor: 'top' },
      { x: xMod, y: p, xref: 'x', yref: 'y',
        text: 'F<sub>m</sub>(x<sub>m</sub>)', showarrow: true, arrowhead: 2, arrowsize: 0.6,
        arrowcolor: '#ef4444', ax: -38, ay: 22, font: { size: 9.5, color: '#ef4444' },
        bgcolor: 'rgba(255,255,255,0.9)', bordercolor: '#ef4444', borderwidth: 1, borderpad: 2 },
      { x: xMod - 0.4, y: p - 0.06, xref: 'x', yref: 'y',
        text: 'Model quantile', showarrow: false, font: { size: 8.5, color: '#ef4444' } },
      { x: xObs, y: p, xref: 'x', yref: 'y',
        text: 'Obs quantile', showarrow: true, arrowhead: 2, arrowsize: 0.6,
        arrowcolor: '#ef4444', ax: 42, ay: -22, font: { size: 9.5, color: '#ef4444' } },
      { x: xObs, y: 0, xref: 'x', yref: 'y',
        text: 'F<sub>o</sub><sup>−1</sup>(F<sub>m</sub>(x<sub>m</sub>))', showarrow: false,
        font: { size: 9, color: '#ef4444' },
        bgcolor: 'rgba(255,255,255,0.9)', bordercolor: '#ef4444', borderwidth: 1, borderpad: 3,
        yanchor: 'top' },
    ],
    shapes: [
      { type: 'line', x0: xMod, x1: xObs, y0: 0.03, y1: 0.03,
        xref: 'x', yref: 'y', line: { color: '#ef4444', width: 2.5 } },
      { type: 'line', x0: xObs, x1: xObs - 0.25, y0: 0.03, y1: 0.07,
        xref: 'x', yref: 'y', line: { color: '#ef4444', width: 2.5 } },
      { type: 'line', x0: xObs, x1: xObs - 0.25, y0: 0.03, y1: -0.01,
        xref: 'x', yref: 'y', line: { color: '#ef4444', width: 2.5 } },
    ],
  }, { responsive: false, displayModeBar: false })
})
