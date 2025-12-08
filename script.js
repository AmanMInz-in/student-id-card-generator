document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
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
    
    // Data storage
    let formData = {
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        phone: "",
        address: "",
        photoDataUrl: null
    };
    let studentId = "";
    let stream = null;
    
    // Generate a student ID
    function generateStudentId() {
        const year = new Date().getFullYear().toString().slice(-2);
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        return `STU${year}${randomNum}`;
    }
    
    // Format date from YYYY-MM-DD to DD/MM/YYYY
    function formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    }
    
    // Handle photo upload from file input
    photoUpload.addEventListener("change", function(e) {
        handlePhotoFile(e.target.files[0]);
    });
    
    // Process photo file
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
    
    // Update photo preview in form and preview section
    function updatePhotoPreview(dataUrl) {
        formData.photoDataUrl = dataUrl;
        photoImage.src = dataUrl;
        photoImage.classList.remove("hidden");
        document.querySelector('#photoPreview .default-avatar').classList.add("hidden");
        removePhotoBtn.classList.remove("hidden");
        
        // Update preview section
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
    
    // Update ID card preview
    function updatePreview() {
        const fullName = `${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}`.trim().replace(/\s+/g, ' ');
        
        previewDetails.innerHTML = `
            <h4><i class="fas fa-id-badge"></i> Student ID Card</h4>
            <p><span class="label">Student ID:</span> ${studentId}</p>
            <p><span class="label">Full Name:</span> ${fullName}</p>
            <p><span class="label">Date of Birth:</span> ${formatDate(formData.dob) || 'Not provided'}</p>
            <p><span class="label">Phone:</span> ${formData.phone || 'Not provided'}</p>
            <p><span class="label">Address:</span> ${formData.address || 'Not provided'}</p>
            <p><span class="label">Date Issued:</span> ${new Date().toLocaleDateString('en-GB')}</p>
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
    
    // Handle PDF download with photo - PROFESSIONAL VERSION
    downloadBtn.addEventListener("click", function () {
        // Check if form is submitted
        if (!studentId) {
            alert("Please submit the form first before downloading the ID card");
            return;
        }
        
        const { jsPDF } = window.jspdf;
        
        // Use A6 size (105x148mm) - perfect for ID cards
        const doc = new jsPDF('p', 'mm', 'a6');
        
        const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim();
        
        // Fixed dimensions for A6
        const pageWidth = 105;
        const pageHeight = 148;
        const centerX = pageWidth / 2;
        
        // Add watermark "Made by Aman Minz" - FADED BACKGROUND
        doc.setTextColor(220, 220, 220); // Very light gray
        doc.setFontSize(24);
        doc.setFont("helvetica", "italic");
        doc.text("Made by Aman Minz", centerX, pageHeight / 2, { 
            align: 'center',
            angle: 45 // Diagonal watermark
        });
        
        // Blue background with gradient effect
        doc.setFillColor(20, 60, 150); // Darker blue for professional look
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Add subtle pattern
        doc.setDrawColor(255, 255, 255, 20); // Very transparent white
        for(let i = 0; i < pageWidth; i += 15) {
            for(let j = 0; j < pageHeight; j += 15) {
                doc.circle(i, j, 0.5, 'F');
            }
        }
        
        // White ID card - centered with professional margins
        const cardWidth = 90;
        const cardHeight = 115;
        const cardX = (pageWidth - cardWidth) / 2;
        const cardY = (pageHeight - cardHeight) / 2;
        
        // Card background with slight shadow effect
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 8, 8, 'F');
        
        // Card shadow
        doc.setFillColor(0, 0, 0, 10);
        doc.roundedRect(cardX + 2, cardY + 2, cardWidth, cardHeight, 8, 8, 'F');
        
        // Professional header with institution logo area
        doc.setFillColor(37, 117, 252);
        doc.roundedRect(cardX, cardY, cardWidth, 25, 8, 8, 'F');
        
        // Title with white text on blue background
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("UNIVERSITY OF TECHNOLOGY", centerX, cardY + 15, { align: 'center' });
        
        // Subtitle
        doc.setFontSize(12);
        doc.text("Student Identity Card", centerX, cardY + 22, { align: 'center' });
        
        // PHOTO SECTION - Professional passport photo
        const photoY = cardY + 45;
        const photoSize = 30;
        const photoX = centerX - photoSize / 2;
        
        if (formData.photoDataUrl) {
            try {
                // Photo with professional frame
                doc.setFillColor(240, 240, 240);
                doc.roundedRect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4, 2, 2, 'F');
                
                // Photo border
                doc.setDrawColor(37, 117, 252);
                doc.setLineWidth(1.5);
                doc.roundedRect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4, 2, 2, 'S');
                
                // Add the photo
                doc.addImage(formData.photoDataUrl, 'JPEG', photoX, photoY, photoSize, photoSize);
            } catch (e) {
                console.error("Error adding image:", e);
                // Professional placeholder
                doc.setFillColor(240, 240, 240);
                doc.roundedRect(photoX, photoY, photoSize, photoSize, 2, 2, 'F');
                doc.setTextColor(150, 150, 150);
                doc.setFontSize(8);
                doc.text("PASSPORT PHOTO", centerX, photoY + 15, { align: 'center' });
            }
        }
        
        // Student details section
        const detailsStartX = cardX + 15;
        const detailsStartY = photoY + photoSize + 15;
        
        // Student ID with badge style
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(detailsStartX - 5, detailsStartY - 8, cardWidth - 20, 15, 3, 3, 'F');
        
        doc.setTextColor(37, 117, 252);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`STUDENT ID: ${studentId}`, centerX, detailsStartY, { align: 'center' });
        
        // Name section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        const nameLines = doc.splitTextToSize(fullName.toUpperCase(), cardWidth - 30);
        doc.text(nameLines, centerX, detailsStartY + 15, { align: 'center' });
        
        // Details grid - professional layout
        const detailY = detailsStartY + 25 + (nameLines.length * 5);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        // Left column
        doc.setTextColor(80, 80, 80);
        doc.text("Date of Birth:", detailsStartX, detailY);
        doc.text("Phone:", detailsStartX, detailY + 8);
        doc.text("Address:", detailsStartX, detailY + 16);
        
        // Right column (values)
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(formatDate(formData.dob), detailsStartX + 35, detailY);
        doc.text(formData.phone, detailsStartX + 35, detailY + 8);
        
        // Address with proper formatting
        const addressLines = doc.splitTextToSize(formData.address, cardWidth - 40);
        const maxLines = Math.min(addressLines.length, 3);
        for(let i = 0; i < maxLines; i++) {
            doc.text(addressLines[i], detailsStartX + 35, detailY + 16 + (i * 4));
        }
        
        // Footer section with issue date and signature area
        const footerY = cardY + cardHeight - 15;
        
        // Horizontal line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(detailsStartX, footerY, cardX + cardWidth - 15, footerY);
        
        // Issue date
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Date Issued: ${new Date().toLocaleDateString('en-GB')}`, detailsStartX, footerY + 5);
        
        // Valid until (1 year from issue)
        const validDate = new Date();
        validDate.setFullYear(validDate.getFullYear() + 1);
        doc.text(`Valid Until: ${validDate.toLocaleDateString('en-GB')}`, detailsStartX, footerY + 10);
        
        // Signature area
        doc.text("Registrar's Signature", cardX + cardWidth - 50, footerY + 10, { align: 'right' });
        doc.setDrawColor(150, 150, 150);
        doc.line(cardX + cardWidth - 50, footerY + 12, cardX + cardWidth - 15, footerY + 12);
        
        // Card border
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 8, 8, 'S');
        
        // Security features - subtle pattern
        doc.setDrawColor(37, 117, 252, 10);
        for(let i = 0; i < 5; i++) {
            doc.circle(cardX + 10 + (i * 15), cardY + cardHeight - 5, 1, 'F');
        }
        
        // Download PDF with professional filename
        doc.save(`University_ID_${studentId}.pdf`);
        
        // Visual feedback
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> ID Card Downloaded!';
        downloadBtn.style.background = '#6a11cb';
        
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.style.background = '#00c896';
        }, 2000);
    });
    
    // Initialize student ID
    studentId = generateStudentId();
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === cameraModal) {
            closeCamera();
        }
    });
    
    // Drag and drop for photo upload
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
    
    // Format date input display
    const dobInput = document.getElementById('dob');
    if (dobInput) {
        // Set max date to today
        const today = new Date().toISOString().split('T')[0];
        dobInput.max = today;
        
        // Format display on change
        dobInput.addEventListener('change', function() {
            if (this.value) {
                const formattedDate = formatDate(this.value);
                // You can display this somewhere if needed
            }
        });
    }
});
