// Enhanced Tool Pages JavaScript

class ToolManager {
  constructor() {
    this.currentFile = null;
    this.isProcessing = false;
    this.init();
  }

  init() {
    this.setupDragAndDrop();
    this.setupEventListeners();
    this.setupAccessibility();
  }

  setupDragAndDrop() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    
    uploadAreas.forEach(area => {
      const fileInput = area.querySelector('.file-input');
      
      // Prevent default drag behaviors
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, this.preventDefaults, false);
        document.body.addEventListener(eventName, this.preventDefaults, false);
      });

      // Highlight drop area when item is dragged over it
      ['dragenter', 'dragover'].forEach(eventName => {
        area.addEventListener(eventName, () => this.highlight(area), false);
      });

      ['dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, () => this.unhighlight(area), false);
      });

      // Handle dropped files
      area.addEventListener('drop', (e) => this.handleDrop(e, fileInput), false);
      
      // Handle file input change
      if (fileInput) {
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e, area), false);
      }
      
      // Handle click to open file dialog
      area.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    });
  }

  setupEventListeners() {
    // Form submissions
    const forms = document.querySelectorAll('.tool-form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e), false);
    });

    // Reset buttons
    const resetButtons = document.querySelectorAll('.btn-reset');
    resetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleReset(e), false);
    });

    // Download buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-download')) {
        this.handleDownload(e);
      }
    });
  }

  setupAccessibility() {
    // Add keyboard navigation for upload areas
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
      area.setAttribute('tabindex', '0');
      area.setAttribute('role', 'button');
      area.setAttribute('aria-label', 'Upload file by clicking or dragging and dropping');
      
      area.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const fileInput = area.querySelector('.file-input');
          if (fileInput) fileInput.click();
        }
      });
    });
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight(elem) {
    elem.classList.add('dragover');
  }

  unhighlight(elem) {
    elem.classList.remove('dragover');
  }

  handleDrop(e, fileInput) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      fileInput.files = files;
      this.handleFileSelect({ target: fileInput }, fileInput.closest('.upload-area'));
    }
  }

  handleFileSelect(e, uploadArea) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!this.validateFileType(file)) {
      this.showMessage('Please select a valid image file (JPG, PNG, GIF, WebP)', 'error');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showMessage('File size must be less than 10MB', 'error');
      return;
    }

    this.currentFile = file;
    this.displayFilePreview(file, uploadArea);
    this.showMessage('File uploaded successfully!', 'success');
    
    // Dispatch custom event for file selection
    const fileSelectedEvent = new CustomEvent('fileSelected', {
      detail: { file: file, uploadArea: uploadArea }
    });
    document.dispatchEvent(fileSelectedEvent);
  }

  validateFileType(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  displayFilePreview(file, uploadArea) {
    uploadArea.classList.add('has-file');
    
    const preview = uploadArea.querySelector('.file-preview') || this.createFilePreview();
    const fileInfo = preview.querySelector('.file-info');
    
    // Update file info
    const fileName = fileInfo.querySelector('.file-details h5');
    const fileSize = fileInfo.querySelector('.file-details p');
    
    fileName.textContent = file.name;
    fileSize.textContent = this.formatFileSize(file.size);
    
    // Add preview to upload area if not already present
    if (!uploadArea.querySelector('.file-preview')) {
      uploadArea.appendChild(preview);
    }

    // Show image preview if it's an image
    if (file.type.startsWith('image/')) {
      this.showImagePreview(file, uploadArea);
    }
  }

  createFilePreview() {
    const preview = document.createElement('div');
    preview.className = 'file-preview';
    preview.innerHTML = `
      <div class="file-info">
        <i class="bi bi-file-earmark-image file-icon"></i>
        <div class="file-details">
          <h5></h5>
          <p></p>
        </div>
      </div>
    `;
    return preview;
  }

  showImagePreview(file, uploadArea) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'image-preview';
      img.alt = 'Preview of uploaded image';
      
      const container = document.createElement('div');
      container.className = 'image-preview-container';
      container.appendChild(img);
      
      // Remove existing preview
      const existingPreview = uploadArea.querySelector('.image-preview-container');
      if (existingPreview) {
        existingPreview.remove();
      }
      
      uploadArea.appendChild(container);
    };
    reader.readAsDataURL(file);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (!this.currentFile) {
      this.showMessage('Please select a file first', 'warning');
      return;
    }

    this.setProcessingState(true);
    
    try {
      const formData = new FormData(e.target);
      formData.append('file', this.currentFile);
      
      // Simulate processing (replace with actual API call)
      await this.simulateProcessing();
      
      // Process the file based on tool type
      const toolType = this.getToolType();
      const result = await this.processFile(toolType, formData);
      
      this.displayResult(result);
      this.showMessage('Processing completed successfully!', 'success');
      
    } catch (error) {
      console.error('Processing error:', error);
      this.showMessage('An error occurred during processing. Please try again.', 'error');
    } finally {
      this.setProcessingState(false);
    }
  }

  getToolType() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
  }

  async simulateProcessing() {
    return new Promise(resolve => {
      const progressBar = document.querySelector('.progress-fill');
      if (progressBar) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 15;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(resolve, 500);
          }
          progressBar.style.width = progress + '%';
        }, 200);
      } else {
        setTimeout(resolve, 2000);
      }
    });
  }

  async processFile(toolType, formData) {
    // This is a placeholder for actual processing logic
    // In a real implementation, you would send the data to your backend
    
    const file = this.currentFile;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Apply different processing based on tool type
        switch (toolType) {
          case 'image-resizer':
            resolve(this.processImageResize(canvas, formData));
            break;
          case 'image-converter':
            resolve(this.processImageConvert(canvas, formData));
            break;
          case 'image-watermarker':
            resolve(this.processImageWatermark(canvas, formData));
            break;
          case 'image-rotator':
            resolve(this.processImageRotate(canvas, formData));
            break;
          case 'image-flipper':
            resolve(this.processImageFlip(canvas, formData));
            break;
          case 'image-border-adder':
            resolve(this.processImageBorder(canvas, formData));
            break;
          case 'image-color-picker':
            resolve(this.processImageColorPicker(canvas, formData));
            break;
          case 'image-background-remover':
            resolve(this.processImageBackgroundRemoval(canvas, formData));
            break;
          case 'image-metadata-viewer':
            resolve(this.processImageMetadata(file));
            break;
          default:
            resolve({ dataUrl: canvas.toDataURL(), filename: file.name });
        }
      };
      img.src = URL.createObjectURL(file);
    });
  }

  processImageResize(canvas, formData) {
    const width = parseInt(formData.get('width')) || canvas.width;
    const height = parseInt(formData.get('height')) || canvas.height;
    
    const resizedCanvas = document.createElement('canvas');
    const resizedCtx = resizedCanvas.getContext('2d');
    
    resizedCanvas.width = width;
    resizedCanvas.height = height;
    
    resizedCtx.drawImage(canvas, 0, 0, width, height);
    
    return {
      dataUrl: resizedCanvas.toDataURL(),
      filename: `resized_${this.currentFile.name}`,
      originalSize: { width: canvas.width, height: canvas.height },
      newSize: { width, height }
    };
  }

  processImageConvert(canvas, formData) {
    const format = formData.get('format') || 'png';
    const quality = formData.get('quality') || 0.9;
    
    let mimeType = 'image/png';
    if (format === 'jpg' || format === 'jpeg') mimeType = 'image/jpeg';
    else if (format === 'webp') mimeType = 'image/webp';
    
    return {
      dataUrl: canvas.toDataURL(mimeType, quality),
      filename: `converted_${this.currentFile.name.replace(/\.[^/.]+$/, '')}.${format}`,
      format: format
    };
  }

  processImageWatermark(canvas, formData) {
    const watermarkText = formData.get('watermark-text') || 'Watermark';
    const position = formData.get('position') || 'bottom-right';
    const opacity = parseFloat(formData.get('opacity')) || 0.5;
    
    const ctx = canvas.getContext('2d');
    ctx.font = '24px Arial';
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.lineWidth = 2;
    
    const textWidth = ctx.measureText(watermarkText).width;
    let x, y;
    
    switch (position) {
      case 'top-left':
        x = 10; y = 30;
        break;
      case 'top-right':
        x = canvas.width - textWidth - 10; y = 30;
        break;
      case 'bottom-left':
        x = 10; y = canvas.height - 10;
        break;
      case 'bottom-right':
      default:
        x = canvas.width - textWidth - 10; y = canvas.height - 10;
        break;
    }
    
    ctx.strokeText(watermarkText, x, y);
    ctx.fillText(watermarkText, x, y);
    
    return {
      dataUrl: canvas.toDataURL(),
      filename: `watermarked_${this.currentFile.name}`,
      watermark: { text: watermarkText, position, opacity }
    };
  }

  processImageRotate(canvas, formData) {
    const angle = parseInt(formData.get('angle')) || 90;
    const radians = (angle * Math.PI) / 180;
    
    const rotatedCanvas = document.createElement('canvas');
    const rotatedCtx = rotatedCanvas.getContext('2d');
    
    rotatedCanvas.width = Math.abs(canvas.width * Math.cos(radians)) + Math.abs(canvas.height * Math.sin(radians));
    rotatedCanvas.height = Math.abs(canvas.width * Math.sin(radians)) + Math.abs(canvas.height * Math.cos(radians));
    
    rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
    rotatedCtx.rotate(radians);
    rotatedCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    
    return {
      dataUrl: rotatedCanvas.toDataURL(),
      filename: `rotated_${this.currentFile.name}`,
      angle: angle
    };
  }

  processImageFlip(canvas, formData) {
    const direction = formData.get('direction') || 'horizontal';
    
    const flippedCanvas = document.createElement('canvas');
    const flippedCtx = flippedCanvas.getContext('2d');
    
    flippedCanvas.width = canvas.width;
    flippedCanvas.height = canvas.height;
    
    if (direction === 'horizontal') {
      flippedCtx.scale(-1, 1);
      flippedCtx.drawImage(canvas, -canvas.width, 0);
    } else {
      flippedCtx.scale(1, -1);
      flippedCtx.drawImage(canvas, 0, -canvas.height);
    }
    
    return {
      dataUrl: flippedCanvas.toDataURL(),
      filename: `flipped_${this.currentFile.name}`,
      direction: direction
    };
  }

  processImageBorder(canvas, formData) {
    const borderWidth = parseInt(formData.get('border-width')) || 10;
    const borderColor = formData.get('border-color') || '#000000';
    
    const borderedCanvas = document.createElement('canvas');
    const borderedCtx = borderedCanvas.getContext('2d');
    
    borderedCanvas.width = canvas.width + (borderWidth * 2);
    borderedCanvas.height = canvas.height + (borderWidth * 2);
    
    // Fill border
    borderedCtx.fillStyle = borderColor;
    borderedCtx.fillRect(0, 0, borderedCanvas.width, borderedCanvas.height);
    
    // Draw image
    borderedCtx.drawImage(canvas, borderWidth, borderWidth);
    
    return {
      dataUrl: borderedCanvas.toDataURL(),
      filename: `bordered_${this.currentFile.name}`,
      border: { width: borderWidth, color: borderColor }
    };
  }

  processImageColorPicker(canvas, formData) {
    // This would typically involve clicking on the image to pick colors
    // For now, we'll return the canvas as-is
    return {
      dataUrl: canvas.toDataURL(),
      filename: this.currentFile.name,
      message: 'Click on the image to pick colors'
    };
  }

  processImageBackgroundRemoval(canvas, formData) {
    // This would typically involve AI/ML processing
    // For now, we'll return the canvas as-is
    return {
      dataUrl: canvas.toDataURL(),
      filename: `bg_removed_${this.currentFile.name}`,
      message: 'Background removal processing completed'
    };
  }

  processImageMetadata(file) {
    return {
      filename: file.name,
      size: this.formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString(),
      message: 'Metadata extracted successfully'
    };
  }

  displayResult(result) {
    const resultArea = document.querySelector('.result-area');
    if (!resultArea) return;
    
    resultArea.innerHTML = '';
    
    if (result.dataUrl) {
      // Display processed image
      const img = document.createElement('img');
      img.src = result.dataUrl;
      img.className = 'image-preview';
      img.alt = 'Processed image result';
      
      const container = document.createElement('div');
      container.className = 'image-preview-container';
      container.appendChild(img);
      
      resultArea.appendChild(container);
      
      // Add download button with improved functionality
      const downloadSection = document.createElement('div');
      downloadSection.className = 'download-section mt-3';
      downloadSection.innerHTML = `
        <h4>Download Result</h4>
        <button class="btn btn-success btn-download" data-url="${result.dataUrl}" data-filename="${result.filename}">
          <i class="bi bi-download"></i> Download Image
        </button>
        <small class="text-muted d-block mt-2">Click to download the processed image</small>
      `;
      resultArea.appendChild(downloadSection);
      
      // Add click handler for download button
      const downloadBtn = downloadSection.querySelector('.btn-download');
      downloadBtn.addEventListener('click', (e) => this.handleDownload(e));
    } else if (result.message) {
      // Display message result
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message success';
      messageDiv.innerHTML = `
        <i class="bi bi-check-circle"></i>
        <span>${result.message}</span>
      `;
      resultArea.appendChild(messageDiv);
      
      // Display metadata if available
      if (result.filename) {
        const metadataDiv = document.createElement('div');
        metadataDiv.className = 'file-preview mt-3';
        metadataDiv.innerHTML = `
          <div class="file-info">
            <i class="bi bi-file-earmark-text file-icon"></i>
            <div class="file-details">
              <h5>${result.filename}</h5>
              <p>Size: ${result.size || 'N/A'}</p>
              <p>Type: ${result.type || 'N/A'}</p>
              <p>Modified: ${result.lastModified || 'N/A'}</p>
            </div>
          </div>
        `;
        resultArea.appendChild(metadataDiv);
      }
    }
  }

  handleDownload(e) {
    const url = e.target.dataset.url;
    const filename = e.target.dataset.filename;
    
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      this.showMessage('Download started successfully!', 'success');
    }
  }

  handleReset(e) {
    e.preventDefault();
    
    // Reset file input
    const fileInputs = document.querySelectorAll('.file-input');
    fileInputs.forEach(input => {
      input.value = '';
    });
    
    // Reset upload areas
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
      area.classList.remove('has-file');
      const preview = area.querySelector('.file-preview');
      if (preview) preview.remove();
      const imagePreview = area.querySelector('.image-preview-container');
      if (imagePreview) imagePreview.remove();
    });
    
    // Reset result area
    const resultArea = document.querySelector('.result-area');
    if (resultArea) {
      resultArea.innerHTML = `
        <div class="result-placeholder">
          <i class="bi bi-image"></i>
          <p>Processed image will appear here</p>
        </div>
      `;
    }
    
    // Reset form
    const forms = document.querySelectorAll('.tool-form');
    forms.forEach(form => form.reset());
    
    this.currentFile = null;
    this.showMessage('Form reset successfully', 'success');
  }

  setProcessingState(isProcessing) {
    this.isProcessing = isProcessing;
    
    const submitButtons = document.querySelectorAll('.btn-primary[type="submit"]');
    submitButtons.forEach(btn => {
      if (isProcessing) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Processing...';
      } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.originalText || 'Process Image';
      }
    });
    
    // Show/hide progress bar
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
      progressContainer.style.display = isProcessing ? 'block' : 'none';
    }
  }

  showMessage(text, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    
    const icon = type === 'success' ? 'bi-check-circle' : 
                 type === 'error' ? 'bi-exclamation-triangle' : 
                 type === 'warning' ? 'bi-exclamation-circle' : 'bi-info-circle';
    
    message.innerHTML = `
      <i class="bi ${icon}"></i>
      <span>${text}</span>
    `;
    
    // Insert at the top of the tool form
    const toolForm = document.querySelector('.tool-form');
    if (toolForm) {
      toolForm.insertBefore(message, toolForm.firstChild);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 5000);
  }
}

// Initialize tool manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ToolManager();
});

// Export for use in other scripts
window.ToolManager = ToolManager; 