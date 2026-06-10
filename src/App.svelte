<script>
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

const pipelineSteps = [
  "Upload Images",
  "Generate Narration",
  "Create Voiceover",
  "Render Slides",
  "Merge Video",
  "Complete"
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

  const files =
    Array.from(event.target.files);

  const newImages = files.map(
    (file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      name: file.name,
      file
    })
  );

  uploadedImages = [
    ...uploadedImages,
    ...newImages
  ];
}

function removeImage(id) {
  uploadedImages = uploadedImages.filter(img => img.id !== id);
}

function triggerFileInput() {
  fileInput.click();
}

async function sendImagesToBackend() {

  console.log("GENERATE VIDEO CLICKED");

  if (uploadedImages.length === 0) {
    backendMessage =
      "Please upload at least one image first.";
    return;
  }

  isSending = true;
  backendMessage = "";
  generatedVideoUrl = "";
  isTrackerFading = false;
  showVideoPanel = false;
  currentStep = 1;

  try {

    const formData = new FormData();

    uploadedImages.forEach((image) => {
      formData.append(
        "images",
        image.file
      );
    });

    formData.append(
      "description",
      description
    );

    formData.append(
      "voice",
      selectedVoice
    );

    formData.append(
      "service",
      selectedService
    );

    // Fake progress animation
    setTimeout(() => {
      currentStep = 2;
    }, 1000);

    setTimeout(() => {
      currentStep = 3;
    }, 3000);

    setTimeout(() => {
      currentStep = 4;
    }, 5000);

    setTimeout(() => {
      currentStep = 5;
    }, 7000);

    const response = await fetch(
      "http://localhost:5000/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data =
      await response.json();

    console.log(
      "Backend Response:",
      data
    );

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
        "Video generation failed"
      );
    }

    generatedVideoUrl =
      `${data.videoUrl}?t=${Date.now()}`;

    console.log(
      "VIDEO URL:",
      generatedVideoUrl
    );

    currentStep = 6;
    backendMessage = "Video generated successfully.";

    setTimeout(() => {
      isTrackerFading = true;
      setTimeout(() => {
        isSending = false;
        showVideoPanel = true;
      }, 800);
    }, 1200);

  } catch (error) {

    console.error(error);

    backendMessage =
      `Failed: ${
        error instanceof Error
          ? error.message
          : "Unknown error"
      }`;

    isSending = false;

  }

}
</script>

<div class="container">
  <header class="header">
    <h1>Video Generation</h1>
  </header>

  <div class="content-wrapper">
    <!-- Left Panel - Configuration -->
    <div class="left-panel">
      <div class="settings-card">
        <h2 class="card-title">Input Settings</h2>

        <!-- Image Upload -->
        <div class="form-group">
          <label for="image-upload" class="form-label">Upload Images</label>
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
            
            <!-- Image Previews -->
            {#if uploadedImages.length > 0}
              <div class="preview-grid">
                {#each uploadedImages as img (img.id)}
                  <div class="preview-item">
                    <img src={img.url} alt={img.name} class="preview-img" />
                    <button
                      class="delete-btn"
                      on:click={() => removeImage(img.id)}
                      title="Delete image"
                    >
                      ✕
                    </button>
                  </div>
                {/each}
              </div>
            {/if}

            <div class="upload-placeholder" on:click={triggerFileInput}>
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>Click to upload images</p>
            </div>

            

            {#if backendMessage}
              <p class="backend-message">{backendMessage}</p>
            {/if}
          </div>
        </div>


        <!-- Text Description -->   
        <div class="form-group">
          <label for="description" class="form-label">Service Description</label>
          <textarea
            id="description"
            placeholder="Enter the service description or explanation..."
            class="textarea"
            bind:value={description}
          />
        </div>

        <!-- Voice Selection -->
        <div class="form-group">
          <label for="voice-select" class="form-label">Voice Selection</label>
          <select
            id="voice-select"
            class="select"
            bind:value={selectedVoice}
          >
            {#each voices as voice (voice.id)}
              <option value={voice.id}>{voice.label}</option>
            {/each}
          </select>
        </div>

        <!-- Service Selection -->
        <div class="form-group">
          <label for="service-select" class="form-label">DCM Service</label>
          <select
            id="service-select"
            class="select"
            bind:value={selectedService}
          >
            {#each services as service (service.id)}
              <option value={service.id}>{service.label}</option>
            {/each}
          </select>
        </div>

        <!-- Generate Button -->
        <button
              class="generate-btn"
              on:click={sendImagesToBackend}
              disabled={isSending}
              type="button"
            >
              {isSending ? 'Generating...' : 'Generate Video'}
            </button>
      </div>
    </div>

    <!-- Right Panel - Preview -->
    <div class="preview-panel">

      {#if isSending}

        <div class="tracker-wrapper" class:fading={isTrackerFading}>

          <div class="tracker-header">
            <h2 class="tracker-title">Generating Demo Video</h2>
            <p class="tracker-subtitle">Please wait while the AI generation pipeline completes.</p>
          </div>

          <div class="pipeline">
            {#each pipelineSteps as step, index}
              <div
                class="milestone"
                class:completed={index + 1 < currentStep}
                class:active={index + 1 === currentStep}
                class:pending={index + 1 > currentStep}
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

        </div>

      {:else if generatedVideoUrl}

        <div class="video-wrapper" class:visible={showVideoPanel}>
          <video controls width="100%" preload="metadata">
            <source src={generatedVideoUrl} type="video/mp4" />
          </video>
        </div>

      {:else}

        <div class="placeholder">
          <div class="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h3>Generated Demo</h3>
          <p>Upload screenshots and click Generate Video</p>
        </div>

      {/if}

    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #f0f8f5 0%, #ffffff 100%);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    overflow: hidden;
  }

  :global(html) {
    height: 100%;
  }

  .container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    background: white;
    padding: 1rem 1.5rem;
    box-shadow: 0 4px 20px rgba(61, 205, 88, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
    border-bottom: 3px solid #3dcd58;
    flex-shrink: 0;
  }

  .header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #3dcd58;
    font-weight: 600;
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
    flex: 1;
    overflow: hidden;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .left-panel,
  .right-panel,
  .preview-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .preview-panel {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
  }

  /* ── Premium Tracker ── */

  .tracker-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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
    margin-bottom: 2.5rem;
  }

  .tracker-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3dcd58;
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.01em;
  }

  .tracker-subtitle {
    font-size: 0.875rem;
    color: #666;
    font-weight: 400;
    margin: 0;
    line-height: 1.5;
  }

  .pipeline {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .milestone {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .milestone-track {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .milestone-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #d9d9d9;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    color: #aaa;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    transition: background 0.3s ease, border-color 0.3s ease,
                color 0.3s ease, box-shadow 0.3s ease;
  }

  .milestone.completed .milestone-circle {
    background: #3dcd58;
    border-color: #3dcd58;
    color: white;
    animation: pop 0.35s ease-out;
  }

  .milestone.active .milestone-circle {
    border-color: #3dcd58;
    color: #3dcd58;
    font-weight: 700;
    animation: activePulse 1.5s ease-in-out infinite;
  }

  .check-icon {
    width: 15px;
    height: 15px;
    stroke: white;
    stroke-width: 3;
  }

  .connector {
    width: 2px;
    height: 30px;
    background: #d9d9d9;
    margin: 3px 0;
    flex-shrink: 0;
    transition: background 0.4s ease;
  }

  .connector.filled {
    background: #3dcd58;
  }

  .milestone-label {
    padding-top: 9px;
    padding-bottom: 4px;
  }

  .step-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #aaa;
    transition: color 0.3s ease, font-weight 0.3s ease;
    line-height: 1.4;
  }

  .milestone.completed .step-name {
    color: #1a1a2e;
    font-weight: 500;
  }

  .milestone.active .step-name {
    color: #3dcd58;
    font-weight: 600;
  }

  @keyframes activePulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(61, 205, 88, 0); }
    50%       { box-shadow: 0 0 0 8px rgba(61, 205, 88, 0.15),
                             0 0 0 4px rgba(61, 205, 88, 0.08); }
  }

  @keyframes pop {
    0%   { transform: scale(0.8); }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1.0); }
  }

  /* ── Video Reveal ── */

  .video-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: translateY(15px);
    transition: opacity 0.75s ease, transform 0.75s ease;
  }

  .video-wrapper.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .video-wrapper video {
    width: 100%;
    border-radius: 10px;
  }

  /* ── Placeholder ── */

  .placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    text-align: center;
    color: #999;
  }

  .placeholder-icon {
    width: 56px;
    height: 56px;
    color: #d9d9d9;
  }

  .placeholder-icon svg {
    width: 100%;
    height: 100%;
  }

  .placeholder h3 {
    color: #555;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .placeholder p {
    font-size: 0.85rem;
    color: #999;
    margin: 0;
    line-height: 1.5;
  }

  .left-panel,
  .right-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .settings-card,
  .preview-card {
    background: white;
    border-radius: 16px;
    padding: 1.2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
  }

  .settings-card:hover,
  .preview-card:hover {
    box-shadow: 0 12px 32px rgba(61, 205, 88, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  .card-title {
    margin: 0 0 0.8rem 0;
    font-size: 1.15rem;
    color: #3dcd58;
    font-weight: 600;
  }

  .form-group {
    margin-bottom: 0.7rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.3rem;
    color: #333;
    font-weight: 500;
    font-size: 0.8rem;
  }

  .upload-area {
    position: relative;
  }

  .file-input {
    display: none;
  }

  .upload-placeholder {
    padding: 0.8rem;
    background: #f9f9f9;
    border: 2px dashed #3dcd58;
    border-radius: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .upload-area:hover .upload-placeholder {
    background: #f0f9f5;
    border-color: #2aa644;
  }

  .upload-icon {
    width: 1.8rem;
    height: 1.8rem;
    color: #3dcd58;
    margin-bottom: 0.3rem;
  }

  .upload-placeholder p {
    margin: 0.2rem 0 0 0;
    color: #666;
    font-size: 0.75rem;
  }

  .send-backend-btn {
    margin-top: 0.6rem;
    width: 100%;
    height: 36px;
    border: 1px solid #3dcd58;
    border-radius: 10px;
    background: #ffffff;
    color: #2aa644;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .send-backend-btn:hover:not(:disabled) {
    background: #eefaf1;
  }

  .send-backend-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .backend-message {
    margin: 0.5rem 0 0 0;
    font-size: 0.78rem;
    color: #2f5f3b;
  }

  .preview-image {
    max-width: 100%;
    max-height: 80px;
    border-radius: 8px;
  }

  .preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-bottom: 0.8rem;
  }

  .preview-item {
    position: relative;
    display: inline-block;
  }

  .preview-img {
    max-height: 80px;
    border-radius: 8px;
    display: block;
  }

  .delete-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #ff4444;
    color: white;
    border: 2px solid white;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    padding: 0;
  }

  .delete-btn:hover {
    background: #cc0000;
    transform: scale(1.1);
  }

  .textarea {
    width: 100%;
    min-height: 60px;
    padding: 0.6rem;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-family: inherit;
    font-size: 0.8rem;
    resize: none;
    transition: all 0.3s ease;
    box-sizing: border-box;
    background: #f9f9f9;
  }

  .textarea:focus {
    outline: none;
    border-color: #3dcd58;
    background: white;
    box-shadow: 0 0 0 3px rgba(61, 205, 88, 0.1);
  }

  .select {
    width: 100%;
    padding: 0.5rem 0.8rem;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-family: inherit;
    font-size: 0.8rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .select:hover {
    border-color: #3dcd58;
  }

  .select:focus {
    outline: none;
    border-color: #3dcd58;
    box-shadow: 0 0 0 3px rgba(61, 205, 88, 0.1);
  }

  .generate-btn {
    padding: 0.7rem;
    background: linear-gradient(135deg, #3dcd58 0%, #2aa644 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 0.6rem;
    box-shadow: 0 6px 20px rgba(61, 205, 88, 0.3), 0 2px 8px rgba(0, 0, 0, 0.08);
    height: 45px;
    width: 100%;
  }

  .generate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(61, 205, 88, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .generate-btn:active {
    transform: translateY(0);
  }

  .video-player {
    position: relative;
    width: 100%;
    height: 220px;
    background: #1a1a1a;
    border-radius: 12px;
    overflow: hidden;
    margin-top: 0.8rem;
    box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .video-preview-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .play-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: rgba(61, 205, 88, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
    box-shadow: 0 6px 20px rgba(61, 205, 88, 0.4);
  }

  .play-icon:hover {
    background: #3dcd58;
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 8px 28px rgba(61, 205, 88, 0.5);
  }

  .play-icon svg {
    width: 25px;
    height: 25px;
    margin-left: 3px;
  }

  .analysis-box {
    margin-top: 0.8rem;
    padding: 0.7rem;
    border: 1px solid #e3efe6;
    border-radius: 10px;
    background: #f8fcf9;
  }

  .analysis-box h3 {
    margin: 0 0 0.4rem 0;
    color: #2aa644;
    font-size: 0.88rem;
  }

  .analysis-box p {
    margin: 0;
    color: #2a2a2a;
    font-size: 0.78rem;
    line-height: 1.45;
    white-space: pre-wrap;
  }

  @media (max-width: 1024px) {
    .content-wrapper {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .header h1 {
      font-size: 1.5rem;
    }

    .header {
      padding: 1rem 1.5rem;
    }
  }
</style>