<script>
  import { onDestroy } from 'svelte';

  let selectedVoice = 'male';
  let selectedService = 'service1';
  let description = '';

  let uploadedImages = [];
  let fileInput;

  let isSending = false;
  let backendMessage = '';
  let generatedVideoUrl = '';
  let currentStep = 0;
  let isTrackerFading = false;
  let showVideoPanel = false;
  let showSuccessBanner = false;

  let isDarkMode = false;

  let sustainabilityFactIndex = 0;
  let factTicker;

  let isDownloading = false;
  let showDownloadToast = false;

  const pipelineSteps = [
    'Upload Images',
    'Generate Narration',
    'Create Voiceover',
    'Render Slides',
    'Merge Video',
    'Complete'
  ];

  const sustainabilityFacts = [
    'Cloud-based collaboration can reduce the need for printed documentation and physical distribution processes.',
    'Digital partner onboarding workflows help reduce manual effort and operational waste.',
    'Automated content generation reduces repetitive work and improves resource utilization.',
    'Sustainable digital operations contribute to lower environmental impact and improved business efficiency.',
    'AI-assisted workflows help teams spend less time on repetitive tasks and more time on value creation.'
  ];

  const voices = [
    { id: 'male', label: 'Male Voice' },
    { id: 'female', label: 'Female Voice' },
    { id: 'neutral', label: 'Neutral Voice' }
  ];

  const services = [
    { id: 'service1', label: 'Programmes' },
    { id: 'service2', label: 'Opportunities' },
    { id: 'service3', label: 'Orders' },
    { id: 'service4', label: 'Admin Console' }
  ];

  function handleFileSelect(event) {
    const files = Array.from(event.target.files || []);

    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      name: file.name,
      file
    }));

    uploadedImages = [...uploadedImages, ...newImages];
  }

  function removeImage(id) {
    const image = uploadedImages.find((img) => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.url);
    }
    uploadedImages = uploadedImages.filter((img) => img.id !== id);
  }

  function triggerFileInput() {
    fileInput?.click();
  }

  function restartFactTicker() {
    clearInterval(factTicker);
    sustainabilityFactIndex = 0;
    factTicker = setInterval(() => {
      sustainabilityFactIndex = (sustainabilityFactIndex + 1) % sustainabilityFacts.length;
    }, 6000);
  }

  function clearFactTicker() {
    clearInterval(factTicker);
  }

  function resetGenerationState() {
    currentStep = 0;
    isTrackerFading = false;
    showVideoPanel = false;
    showSuccessBanner = false;
    backendMessage = '';
  }

  async function sendImagesToBackend() {
    if (uploadedImages.length === 0) {
      backendMessage = 'Please upload at least one image first.';
      return;
    }

    isSending = true;
    generatedVideoUrl = '';
    resetGenerationState();
    currentStep = 1;
    restartFactTicker();

    const progressTimers = [];
    progressTimers.push(setTimeout(() => (currentStep = 2), 900));
    progressTimers.push(setTimeout(() => (currentStep = 3), 2500));
    progressTimers.push(setTimeout(() => (currentStep = 4), 4200));
    progressTimers.push(setTimeout(() => (currentStep = 5), 6200));

    try {
      const formData = new FormData();

      uploadedImages.forEach((image) => {
        formData.append('images', image.file);
      });

      formData.append('description', description);
      formData.append('voice', selectedVoice);
      formData.append('service', selectedService);

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Video generation failed');
      }

      if (!data.videoUrl) {
        throw new Error('Backend response missing videoUrl.');
      }

      generatedVideoUrl = `${data.videoUrl}?t=${Date.now()}`;
      currentStep = 6;
      showSuccessBanner = true;
      backendMessage = 'All generation stages completed successfully.';

      setTimeout(() => {
        isTrackerFading = true;
        setTimeout(() => {
          isSending = false;
          showVideoPanel = true;
        }, 760);
      }, 1000);
    } catch (error) {
      backendMessage = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      isSending = false;
      showSuccessBanner = false;
    } finally {
      progressTimers.forEach((timer) => clearTimeout(timer));
      clearFactTicker();
    }
  }

  async function downloadVideo() {
    if (!generatedVideoUrl || isDownloading) return;

    isDownloading = true;

    try {
      const response = await fetch(generatedVideoUrl);
      if (!response.ok) {
        throw new Error('Unable to download video');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ai-demo-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      showDownloadToast = true;
      setTimeout(() => {
        showDownloadToast = false;
      }, 3000);
    } catch (error) {
      backendMessage = `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    } finally {
      isDownloading = false;
    }
  }

  function regenerateVideo() {
    generatedVideoUrl = '';
    showVideoPanel = false;
    backendMessage = '';
    currentStep = 0;
    sendImagesToBackend();
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode;
  }

  onDestroy(() => {
    clearFactTicker();
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.url));
  });
</script>

<div class="container" class:dark={isDarkMode}>
  <header class="header">
    <h1>AI Micro Video Generator</h1>
    <button
      class="theme-toggle"
      type="button"
      on:click={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {#if isDarkMode}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3c0.5 2.1 1.6 4 3.15 5.55A8.7 8.7 0 0 0 21 12.79z"></path>
        </svg>
      {/if}
    </button>
  </header>

  <div class="content-wrapper">
    <div class="left-panel">
      <div class="settings-card">
        <h2 class="card-title">Input Settings</h2>

        <div class="form-group">
          <label for="image-upload" class="form-label">Screenshot Upload</label>
          <div class="upload-area">
            <input
              bind:this={fileInput}
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              on:change={handleFileSelect}
              class="file-input"
            />

            {#if uploadedImages.length > 0}
              <div class="preview-grid">
                {#each uploadedImages as img (img.id)}
                  <div class="preview-item">
                    <img src={img.url} alt={img.name} class="preview-img" />
                    <button
                      class="delete-btn"
                      on:click={() => removeImage(img.id)}
                      title="Delete image"
                      type="button"
                    >
                      X
                    </button>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="empty-upload-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p>Upload screenshots to generate an AI-powered narrated walkthrough.</p>
              </div>
            {/if}

            <button class="upload-placeholder" on:click={triggerFileInput} type="button">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Choose Images</span>
            </button>

            {#if backendMessage}
              <p class="backend-message" aria-live="polite">{backendMessage}</p>
            {/if}
          </div>
        </div>

        <div class="form-group">
          <label for="service-select" class="form-label">Service Selection</label>
          <select id="service-select" class="select" bind:value={selectedService}>
            {#each services as service (service.id)}
              <option value={service.id}>{service.label}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="voice-select" class="form-label">Voice Selection</label>
          <select id="voice-select" class="select" bind:value={selectedVoice}>
            {#each voices as voice (voice.id)}
              <option value={voice.id}>{voice.label}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">Service Description</label>
          <textarea
            id="description"
            placeholder="Enter the service description or explanation..."
            class="textarea"
            bind:value={description}
          ></textarea>
        </div>

        <button class="generate-btn" on:click={sendImagesToBackend} disabled={isSending} type="button">
          {isSending ? 'Generating...' : 'Generate Video'}
        </button>
      </div>
    </div>

    <div class="right-panel">
      {#if isSending}
        <div class="tracker-wrapper" class:fading={isTrackerFading}>
          <div class="tracker-header">
            <h2 class="tracker-title">Generating Demo Video</h2>
            <p class="tracker-subtitle">Please wait while the AI generation pipeline completes.</p>
          </div>

          <div class="pipeline" role="list" aria-label="Video generation pipeline">
            {#each pipelineSteps as step, index}
              <div
                class="milestone"
                class:completed={index + 1 < currentStep}
                class:active={index + 1 === currentStep}
                class:pending={index + 1 > currentStep}
                role="listitem"
                aria-current={index + 1 === currentStep ? 'step' : undefined}
              >
                <div class="milestone-track">
                  <div class="milestone-circle">
                    {#if index + 1 < currentStep}
                      <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    {:else}
                      {index + 1}
                    {/if}
                  </div>
                  {#if index < pipelineSteps.length - 1}
                    <div class="connector" class:filled={index + 1 < currentStep}></div>
                  {/if}
                </div>

                <div class="milestone-label">
                  <span class="step-name">{step}</span>
                </div>
              </div>
            {/each}
          </div>

          <div class="sustainability-card" aria-live="polite">
            <h3>Did You Know?</h3>
            <p>{sustainabilityFacts[sustainabilityFactIndex]}</p>
          </div>

          {#if showSuccessBanner}
            <div class="completion-banner" aria-live="polite">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>All generation stages completed successfully.</span>
            </div>
          {/if}
        </div>
      {:else if generatedVideoUrl}
        <div class="video-wrapper" class:visible={showVideoPanel}>
          <div class="video-title-wrap">
            <h2>Generated Demo Video</h2>
            <p>Created successfully using AI narration and voice synthesis.</p>
          </div>

          <video controls width="100%" preload="metadata" aria-label="Generated demo video preview">
            <source src={generatedVideoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>

          <div class="video-actions">
            <button class="download-btn" type="button" on:click={downloadVideo} disabled={isDownloading}>
              {#if isDownloading}
                <span class="spinner" aria-hidden="true"></span>
                Downloading...
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Video
              {/if}
            </button>

            <button class="regen-btn" type="button" on:click={regenerateVideo}>
              Generate Another Video
            </button>
          </div>
        </div>
      {:else}
        <div class="placeholder">
          <div class="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h3>Upload screenshots and generate your AI-powered demo video.</h3>
          <p>Progress visibility, sustainability context, and enterprise-grade automation appear here.</p>
        </div>
      {/if}
    </div>
  </div>

  {#if showDownloadToast}
    <div class="toast" role="status" aria-live="polite">Video downloaded successfully.</div>
  {/if}
</div>

<style>
  :global(body),
  :global(html) {
    margin: 0;
    padding: 0;
    height: 100%;
    background: #f5f8f6;
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .container {
    --bg: #f5f8f6;
    --surface: #ffffff;
    --surface-soft: #f8faf9;
    --border: #e3e8e5;
    --text: #1f2a24;
    --muted: #666666;
    --pending: #d9d9d9;
    --accent: #3dcd58;
    --accent-2: #22b14c;
    --ring: rgba(61, 205, 88, 0.22);

    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: var(--text);
    transition: background 0.3s ease, color 0.3s ease;
  }

  .container.dark {
    --bg: #121212;
    --surface: #1e1e1e;
    --surface-soft: #1a1a1a;
    --border: #2a2a2a;
    --text: #eaeaea;
    --muted: #a0a0a0;
    --pending: #4a4a4a;
    --accent: #3dcd58;
    --accent-2: #3dcd58;
    --ring: rgba(61, 205, 88, 0.3);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    transition: background 0.3s ease, border-color 0.3s ease;
  }

  .header h1 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: -0.01em;
  }

  .theme-toggle {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface-soft);
    color: var(--text);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .theme-toggle:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .theme-toggle:focus-visible,
  button:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .theme-toggle svg {
    width: 18px;
    height: 18px;
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: minmax(320px, 420px) 1fr;
    gap: 1rem;
    padding: 1rem;
    flex: 1;
    min-height: 0;
  }

  .left-panel,
  .right-panel {
    min-height: 0;
  }

  .settings-card,
  .right-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    transition: background 0.3s ease, border-color 0.3s ease;
  }

  .settings-card {
    padding: 1rem;
    height: 100%;
    overflow: auto;
  }

  .card-title {
    margin: 0 0 0.85rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent);
  }

  .form-group {
    margin-bottom: 0.75rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.35rem;
    color: var(--muted);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }

  .file-input {
    display: none;
  }

  .upload-area {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .empty-upload-state {
    border: 1px dashed var(--border);
    background: var(--surface-soft);
    border-radius: 10px;
    padding: 0.75rem;
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
    color: var(--muted);
  }

  .empty-upload-state svg {
    width: 18px;
    height: 18px;
    color: var(--accent);
    flex-shrink: 0;
    margin-top: 1px;
  }

  .empty-upload-state p {
    margin: 0;
    font-size: 0.76rem;
    line-height: 1.45;
  }

  .preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .preview-item {
    position: relative;
  }

  .preview-img {
    width: 72px;
    height: 54px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--border);
  }

  .delete-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    border: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ea3f3f;
    color: white;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
  }

  .upload-placeholder {
    border: 1px dashed var(--accent);
    background: transparent;
    color: var(--accent);
    border-radius: 10px;
    padding: 0.6rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    cursor: pointer;
    transition: all 0.25s ease;
    font-weight: 600;
    font-size: 0.8rem;
  }

  .upload-placeholder:hover {
    background: color-mix(in srgb, var(--accent) 9%, transparent);
  }

  .upload-icon {
    width: 16px;
    height: 16px;
  }

  .backend-message {
    margin: 0;
    font-size: 0.78rem;
    color: var(--muted);
  }

  .select,
  .textarea {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface-soft);
    color: var(--text);
    padding: 0.58rem 0.68rem;
    font-size: 0.84rem;
    transition: border-color 0.25s ease, background 0.3s ease, color 0.3s ease;
  }

  .textarea {
    min-height: 84px;
    resize: vertical;
    line-height: 1.45;
  }

  .generate-btn {
    width: 100%;
    border: 0;
    border-radius: 10px;
    background: var(--accent);
    color: #fff;
    padding: 0.72rem 0.8rem;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
  }

  .generate-btn:hover:not(:disabled) {
    background: var(--accent-2);
    transform: translateY(-1px);
  }

  .generate-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .right-panel {
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .tracker-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }

  .tracker-wrapper.fading {
    opacity: 0;
    transform: translateY(-12px);
    pointer-events: none;
  }

  .tracker-header {
    text-align: center;
  }

  .tracker-title {
    margin: 0 0 0.35rem;
    font-size: 24px;
    font-weight: 700;
    color: var(--accent);
  }

  .tracker-subtitle {
    margin: 0;
    font-size: 14px;
    color: var(--muted);
    font-weight: 400;
  }

  .pipeline {
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
  }

  .milestone {
    display: flex;
    gap: 0.8rem;
    align-items: flex-start;
  }

  .milestone-track {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .milestone-circle {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid var(--pending);
    color: var(--muted);
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    font-weight: 700;
    transition: all 0.3s ease;
  }

  .connector {
    width: 2px;
    height: 26px;
    background: var(--pending);
    transition: background 0.4s ease;
  }

  .connector.filled {
    background: var(--accent);
  }

  .step-name {
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 34px;
    transition: color 0.3s ease;
  }

  .milestone.active .step-name {
    color: var(--accent);
    font-weight: 700;
  }

  .milestone.active .milestone-circle {
    border-color: var(--accent);
    color: var(--accent);
    animation: activePulse 1.5s ease-in-out infinite;
  }

  .milestone.completed .milestone-circle {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    animation: pop 0.3s ease-out;
  }

  .milestone.completed .step-name {
    color: var(--text);
  }

  .check-icon {
    width: 14px;
    height: 14px;
    stroke: #fff;
  }

  .sustainability-card {
    width: 100%;
    max-width: 500px;
    border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--border));
    border-left: 4px solid var(--accent);
    border-radius: 10px;
    background: color-mix(in srgb, var(--accent) 6%, var(--surface));
    padding: 0.78rem 0.9rem;
    transition: background 0.5s ease;
  }

  .sustainability-card h3 {
    margin: 0 0 0.28rem;
    color: var(--accent);
    font-size: 0.83rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .sustainability-card p {
    margin: 0;
    color: var(--text);
    font-size: 0.84rem;
    line-height: 1.45;
    animation: factFade 0.5s ease;
  }

  .completion-banner {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--text);
    font-size: 0.86rem;
    font-weight: 600;
    animation: bannerIn 0.35s ease;
  }

  .completion-banner svg {
    width: 16px;
    height: 16px;
    color: var(--accent);
  }

  .video-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.78s ease, transform 0.78s ease;
  }

  .video-wrapper.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .video-title-wrap h2 {
    margin: 0 0 0.25rem;
    font-size: 1.05rem;
    color: var(--text);
  }

  .video-title-wrap p {
    margin: 0;
    color: var(--muted);
    font-size: 0.82rem;
  }

  .video-wrapper video {
    width: 100%;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: #000;
  }

  .video-actions {
    display: flex;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  .download-btn,
  .regen-btn {
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface-soft);
    color: var(--text);
    padding: 0.58rem 0.8rem;
    font-size: 0.83rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.38rem;
  }

  .download-btn {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .download-btn svg {
    width: 14px;
    height: 14px;
  }

  .download-btn:disabled {
    opacity: 0.75;
    cursor: not-allowed;
  }

  .regen-btn:hover,
  .download-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }

  .placeholder {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.65rem;
    text-align: center;
    color: var(--muted);
    padding: 1rem;
  }

  .placeholder-icon {
    width: 58px;
    height: 58px;
    color: color-mix(in srgb, var(--accent) 35%, var(--muted));
  }

  .placeholder-icon svg {
    width: 100%;
    height: 100%;
  }

  .placeholder h3 {
    margin: 0;
    font-size: 1rem;
    color: var(--text);
    font-weight: 700;
  }

  .placeholder p {
    margin: 0;
    font-size: 0.85rem;
    max-width: 520px;
    line-height: 1.5;
  }

  .toast {
    position: fixed;
    right: 1.15rem;
    bottom: 1.15rem;
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
    border-radius: 9px;
    padding: 0.65rem 0.85rem;
    font-size: 0.82rem;
    font-weight: 600;
    animation: toastIn 0.25s ease;
    z-index: 20;
  }

  @keyframes activePulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 rgba(61, 205, 88, 0);
    }
    50% {
      box-shadow: 0 0 0 8px var(--ring);
    }
  }

  @keyframes pop {
    0% {
      transform: scale(0.8);
    }
    60% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes factFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes bannerIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1050px) {
    .content-wrapper {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .right-panel {
      min-height: 460px;
    }
  }
</style>
