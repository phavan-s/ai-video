<script>
	let screenshots = [];

	function handleFiles(event) {
		const files = Array.from(event.target.files);

		screenshots = [
			...screenshots,
			...files.map((file) => ({
				file,
				preview: URL.createObjectURL(file)
			}))
		];
	}

	function removeImage(index) {
		screenshots.splice(index, 1);
		screenshots = [...screenshots];
	}
</script>

<div class="uploader-card">
	<h2>Upload Journey Screenshots</h2>

	<label class="upload-box">
		<input
			type="file"
			accept="image/*"
			multiple
			on:change={handleFiles}
		/>

		<div>
			📸 Upload screenshots of the service journey
		</div>
	</label>

	{#if screenshots.length > 0}
		<div class="preview-grid">
			{#each screenshots as screenshot, index}
				<div class="preview-card">
					<img src={screenshot.preview} alt="Screenshot Preview" />

					<button
						class="remove-btn"
						on:click={() => removeImage(index)}
					>
						✕
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.uploader-card {
		background: white;
		padding: 24px;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.upload-box {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px dashed #ccc;
		padding: 40px;
		border-radius: 10px;
		cursor: pointer;
		margin-top: 16px;
	}

	.upload-box input {
		display: none;
	}

	.preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 16px;
		margin-top: 24px;
	}

	.preview-card {
		position: relative;
	}

	.preview-card img {
		width: 100%;
		height: 120px;
		object-fit: cover;
		border-radius: 8px;
	}

	.remove-btn {
		position: absolute;
		top: 6px;
		right: 6px;
		border: none;
		background: red;
		color: white;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		cursor: pointer;
	}
</style>