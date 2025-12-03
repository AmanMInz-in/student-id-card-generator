document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("studentForm");
    const submitBtn = document.getElementById("submitBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const previewContainer = document.getElementById("previewContainer");
    const previewDetails = document.getElementById("previewDetails");
    
    // Photo elements
    const photoUpload = document.getElementById("photoUpload");
    const photoImage = document.getElementById("photoImage");
    const previewPhotoImage = document.getElementById("previewPhotoImage");
    const removePhotoBtn = document.getElementById("removePhotoBtn");
    const captureBtn = document.getElementById("captureBtn");
    
    // Camera modal elements
    const cameraModal = document.getElementById("cameraModal");
    const cameraFeed = document.getElementById("cameraFeed");
    const photoCanvas = document.getElementById("photoCanvas");
    const capturePhotoBtn = document.getElementById("capturePhotoBtn");
    const cancelCaptureBtn = document.getElementById("cancelCaptureBtn");
    const closeModalBtn = document.querySelector(".close-modal");
    
    let formData = {
        photoDataUrl: null
    };
    let studentId = "";
    let stream = null;
    
    // Generate a student ID
    function generateStudentId() {
        const year = new Date().getFullYear().toString().slice(-2);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `STU${year}${randomNum}`;
    }
    
    // Handle photo upload
    photoUpload.addEventListener("change", function(e) {
        handlePhotoFile(e.target.files[0]);
    });
    
    function handlePhotoFile(file) {
        if (!file) return;
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("File size should be less than 2MB");
            return;
        }
        
        // Validate image type
        if (!file.type.match('image.*')) {
            alert("Please select an image file (JPG or PNG)");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            updatePhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    }
    
    function updatePhotoPreview(dataUrl) {
        formData.photoDataUrl = dataUrl;
        photoImage.src = dataUrl;
        photoImage.classList.remove("hidden");
        document.querySelector('#photoPreview .default-avatar').classList.add("hidden");
        removePhotoBtn.classList.remove("hidden");
        
        // Update preview
        previewPhotoImage.src = dataUrl;
        previewPhotoImage.classList.remove("hidden");
        document.querySelector('#previewPhoto .default-avatar').classList.add("hidden");
    }
    
    // Remove photo
    removePhotoBtn.addEventListener("click", function() {
        formData.photoDataUrl = null;
        photoImage.src = "";
        photoImage.classList.add("hidden");
        document.querySelector('#photoPreview .default-avatar').classList.remove("hidden");
        removePhotoBtn.classList.add("hidden");
        
        previewPhotoImage.src = "";
        previewPhotoImage.classList.add("hidden");
        document.querySelector('#previewPhoto .default-avatar').classList.remove("hidden");
        photoUpload.value = "";
    });
    
    // Camera functionality
    captureBtn.addEventListener("click", async function() {
        try {
            cameraModal.classList.remove("hidden");
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            cameraFeed.srcObject = stream;
        } catch (err) {
            alert("Error accessing camera: " + err.message);
            cameraModal.classList.add("hidden");
        }
    });
    
    // Capture photo from camera
    capturePhotoBtn.addEventListener("click", function() {
        const context = photoCanvas.getContext('2d');
        photoCanvas.width = cameraFeed.videoWidth;
        photoCanvas.height = cameraFeed.videoHeight;
        
        // Draw the current frame from video
        context.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);
        
        // Convert to data URL and update preview
        updatePhotoPreview(photoCanvas.toDataURL('image/png'));
        
        // Close camera
        closeCamera();
    });
    
    // Close camera modal
    function closeCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        cameraModal.classList.add("hidden");
        cameraFeed.srcObject = null;
    }
    
    closeModalBtn.addEventListener("click", closeCamera);
    cancelCaptureBtn.addEventListener("click", closeCamera);
    
    // Update preview
    function updatePreview() {
        const fullName = `${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}`.trim().replace(/\s+/g, ' ');
        
        previewDetails.innerHTML = `
            <h4><i class="fas fa-id-badge"></i> Student ID Card</h4>
            <p><span class="label">Student ID:</span> ${studentId}</p>
            <p><span class="label">Full Name:</span> ${fullName}</p>
            <p><span class="label">Date of Birth:</span> ${formData.dob || 'Not provided'}</p>
            <p><span class="label">Phone:</span> ${formData.phone || 'Not provided'}</p>
            <p><span class="label">Address:</span> ${formData.address || 'Not provided'}</p>
            <p><span class="label">Date Issued:</span> ${new Date().toLocaleDateString()}</p>
        `;
    }
    
    // Handle form submission
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        
        // Get form values
        formData.firstName = document.getElementById("firstName").value.trim();
        formData.middleName = document.getElementById("middleName").value.trim();
        formData.lastName = document.getElementById("lastName").value.trim();
        formData.dob = document.getElementById("dob").value;
        formData.phone = document.getElementById("phone").value.trim();
        formData.address = document.getElementById("address").value.trim();
        
        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.dob || !formData.phone || !formData.address) {
            alert("Please fill in all required fields (marked with *)");
            return;
        }
        
        // Validate photo
        if (!formData.photoDataUrl) {
            alert("Please upload or capture a passport photo");
            return;
        }
        
        // Validate phone number (10 digits)
        if (!/^\d{10}$/.test(formData.phone)) {
            alert("Please enter a valid 10-digit phone number");
            return;
        }
        
        // Generate student ID if not already generated
        if (!studentId) {
            studentId = generateStudentId();
        }
        
        // Show success message
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Form Submitted!';
        submitBtn.style.background = '#00c896';
        
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Update Information';
        }, 2000);
        
        // Show preview
        updatePreview();
        previewContainer.classList.remove("hidden");
        
        // Scroll to preview
        previewContainer.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Handle PDF download with photo
    downloadBtn.addEventListener("click", function () {
        // Check if form is submitted
        if (!studentId) {
            alert("Please submit the form first before downloading the ID card");
            return;
        }
        
        const { jsPDF } = window.jspdf;
        
        // Use A6 size for ID card
        const doc = new jsPDF('p', 'mm', 'a6'); // A6 is perfect for ID cards
        
        const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim().replace(/\s+/g, ' ');
        
        // Get page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();  // 105mm for A6
        const pageHeight = doc.internal.pageSize.getHeight(); // 148mm for A6
        const centerX = pageWidth / 2;
        
        // Add blue background
        doc.setFillColor(37, 117, 252);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Create white ID card (centered)
        const cardWidth = 90;
        const cardHeight = 125;
        const cardX = (pageWidth - cardWidth) / 2;
        const cardY = (pageHeight - cardHeight) / 2;
        
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 8, 8, 'F');
        
        // Header
        doc.setTextColor(37, 117, 252);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("STUDENT ID", centerX, cardY + 15, { align: 'center' });
        
        // Horizontal line
        doc.setDrawColor(37, 117, 252);
        doc.setLineWidth(0.8);
        doc.line(cardX + 15, cardY + 22, cardX + cardWidth - 15, cardY + 22);
        
        // PHOTO SECTION - PERFECTLY CENTERED
        const photoCenterY = cardY + 55;
        
        if (formData.photoDataUrl) {
            try {
                // Photo circle
                doc.setFillColor(245, 245, 245);
                doc.circle(centerX, photoCenterY, 16, 'F');
                
                // Photo border
                doc.setDrawColor(37, 117, 252);
                doc.setLineWidth(1.2);
                doc.circle(centerX, photoCenterY, 16, 'S');
                
                // Add photo (centered within circle)
                const photoSize = 30; // 30mm width/height
                const photoX = centerX - photoSize / 2;
                const photoY = photoCenterY - photoSize / 2;
                
                doc.addImage(formData.photoDataUrl, 'JPEG', photoX, photoY, photoSize, photoSize);
            } catch (e) {
                // Fallback if image error
                doc.setTextColor(180, 180, 180);
                doc.setFontSize(10);
                doc.text("[PHOTO]", centerX, photoCenterY, { align: 'center' });
            }
        }
        
        // Student ID (below photo)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`ID: ${studentId}`, centerX, photoCenterY + 25, { align: 'center' });
        
        // Name (centered, with line break if too long)
        doc.setFontSize(16);
        const nameLines = doc.splitTextToSize(fullName.toUpperCase(), cardWidth - 20);
        doc.text(nameLines, centerX, photoCenterY + 38, { align: 'center' });
        
        // Details (left-aligned within card)
        const detailStartX = cardX + 15;
        let detailY = photoCenterY + 55;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        // DOB
        doc.text(`Date of Birth: ${formData.dob}`, detailStartX, detailY);
        detailY += 7;
        
        // Phone
        doc.text(`Phone: ${formData.phone}`, detailStartX, detailY);
        detailY += 7;
        
        // Address (multi-line)
        doc.text(`Address:`, detailStartX, detailY);
        const addressLines = doc.splitTextToSize(formData.address, cardWidth - 25);
        doc.text(addressLines, detailStartX + 5, detailY + 4);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const issueDate = new Date().toLocaleDateString();
        doc.text(`Issued: ${issueDate}`, detailStartX, cardY + cardHeight - 15);
        
        // University
        doc.setFontSize(9);
        doc.setTextColor(37, 117, 252);
        doc.text("OFFICIAL ID CARD", centerX, cardY + cardHeight - 8, { align: 'center' });
        
        // Card border
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 8, 8, 'S');
        
        // Download
        doc.save(`ID_${studentId}.pdf`);
        
        // Visual feedback
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
        downloadBtn.style.background = '#6a11cb';
        
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.style.background = '#00c896';
        }, 1500);
    });
    
    // Initialize student ID
    studentId = generateStudentId();
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === cameraModal) {
            closeCamera();
        }
    });
    
    // Drag and drop for photo
    const photoPreview = document.getElementById('photoPreview');
    
    photoPreview.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#00c896';
        this.style.boxShadow = '0 0 15px rgba(0, 200, 150, 0.5)';
    });
    
    photoPreview.addEventListener('dragleave', function(e) {
        this.style.borderColor = '#2575fc';
        this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
    });
    
    photoPreview.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#2575fc';
        this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
        
        if (e.dataTransfer.files.length) {
            handlePhotoFile(e.dataTransfer.files[0]);
        }
    });
});