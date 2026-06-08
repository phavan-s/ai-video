<script>
let selectedVoice = 'male';
let selectedService = 'service1';
let description = '';
let uploadedImages = [];
let fileInput;
let isSending = false;
let backendMessage = '';
let aiAnalysis = "";

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
  const files = Array.from(event.target.files);

  files.forEach(file => {
    const reader = new FileReader();

    reader.onload = (e) => {
      uploadedImages = [
        ...uploadedImages,
        {
          id: Date.now() + Math.random(),
          url: e.target.result,
          name: file.name,
          file
        }
      ];
    };

    reader.readAsDataURL(file);
  });
}

function removeImage(id) {
  uploadedImages = uploadedImages.filter(img => img.id !== id);
}

function triggerFileInput() {
  fileInput.click();
}

async function sendImagesToBackend() {

  console.log("BUTTON CLICKED");

  if (uploadedImages.length === 0) {
    backendMessage = 'Please upload at least one image first.';
    return;
  }

  isSending = true;
  backendMessage = '';

  try {
    const formData = new FormData();

    uploadedImages.forEach((image) => {
      formData.append('images', image.file);
    });

    const response = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    console.log('Backend Response:', data);
    aiAnalysis = data.analysis || "No AI analysis provided.";

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    console.log('S3 URLs:', data.imageUrls);

    backendMessage =
      `Successfully uploaded ${data.imageUrls.length} image(s) to S3`;


    

  } catch (error) {

    console.error(error);

    backendMessage =
      `Failed to upload: ${
        error instanceof Error
          ? error.message
          : 'Unknown error'
      }`;

  } finally {
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

            <button
              class="send-backend-btn"
              on:click={sendImagesToBackend}
              disabled={isSending}
              type="button"
            >
              {isSending ? 'Sending...' : 'Send to Backend'}
            </button>

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
        <button class="generate-btn">
          Generate Video
        </button>
      </div>
    </div>

    <!-- Right Panel - Preview -->
    <div class="right-panel">
      <div class="preview-card">
        <h2 class="card-title">Video Preview</h2>
        <div class="video-player">
          <div class="play-icon">
            <svg viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
        {#if aiAnalysis}
        <div class="analysis-box">
          <h3>AI Analysis</h3>
            <pre>{aiAnalysis}</pre>
        </div>
        {/if}
        
      </div>
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
