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
    
    // Generate student ID
    function generateStudentId() {
        const year = new Date().getFullYear().toString().slice(-2);
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        return `ID${year}${randomNum}`;
    }
    
    // Format date
    function formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    // Handle photo upload
    photoUpload.addEventListener("change", function(e) {
        handlePhotoFile(e.target.files[0]);
    });
    
    function handlePhotoFile(file) {
        if (!file) return;
        
        if (file.size > 2 * 1024 * 1024) {
            alert("File size should be less than 2MB");
            return;
        }
        
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
                video: { facingMode: 'user' }
            });
            cameraFeed.srcObject = stream;
        } catch (err) {
            alert("Camera error: " + err.message);
            cameraModal.classList.add("hidden");
        }
    });
    
    capturePhotoBtn.addEventListener("click", function() {
        const context = photoCanvas.getContext('2d');
        photoCanvas.width = cameraFeed.videoWidth;
        photoCanvas.height = cameraFeed.videoHeight;
        context.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);
        updatePhotoPreview(photoCanvas.toDataURL('image/png'));
        closeCamera();
    });
    
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
        const fullName = `${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}`.trim();
        
        previewDetails.innerHTML = `
            <h4>ID Card Preview</h4>
            <p><span class="label">ID:</span> ${studentId}</p>
            <p><span class="label">Name:</span> ${fullName}</p>
            <p><span class="label">Date of Birth:</span> ${formatDate(formData.dob)}</p>
            <p><span class="label">Phone:</span> ${formData.phone}</p>
            <p><span class="label">Address:</span> ${formData.address}</p>
            <p><span class="label">Issued:</span> ${new Date().toLocaleDateString('en-GB')}</p>
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
        
        // Validate
        if (!formData.firstName || !formData.lastName || !formData.dob || !formData.phone || !formData.address) {
            alert("Please fill all required fields");
            return;
        }
        
        if (!formData.photoDataUrl) {
            alert("Please upload a photo");
            return;
        }
        
        if (!/^\d{10}$/.test(formData.phone)) {
            alert("Please enter valid 10-digit phone");
            return;
        }
        
        if (!studentId) {
            studentId = generateStudentId();
        }
        
        // Show success
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted';
        submitBtn.style.background = '#00c896';
        
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Update';
        }, 2000);
        
        // Show preview
        updatePreview();
        previewContainer.classList.remove("hidden");
        previewContainer.scrollIntoView({ behavior: 'smooth' });
    });
    
    // MINIMAL PDF GENERATION - No university text
    downloadBtn.addEventListener("click", function () {
        if (!studentId) {
            alert("Please submit form first");
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a6'); // 105x148mm
        
        const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim();
        
        // Simple white background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 105, 148, 'F');
        
        // Thin border around entire page
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(5, 5, 95, 138, 'S');
        
        // Simple title at top
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("STUDENT ID CARD", 52.5, 15, { align: 'center' });
        
        // Thin line under title
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.2);
        doc.line(20, 18, 85, 18);
        
        // RECTANGULAR PHOTO - left side
        const photoX = 15;
        const photoY = 30;
        const photoWidth = 35;
        const photoHeight = 45;
        
        if (formData.photoDataUrl) {
            try {
                // Add photo with thin border
                doc.setDrawColor(100, 100, 100);
                doc.setLineWidth(0.5);
                doc.rect(photoX, photoY, photoWidth, photoHeight, 'S');
                
                // Add the photo
                doc.addImage(formData.photoDataUrl, 'JPEG', photoX, photoY, photoWidth, photoHeight);
            } catch (e) {
                // Placeholder
                doc.setFillColor(240, 240, 240);
                doc.rect(photoX, photoY, photoWidth, photoHeight, 'F');
                doc.setTextColor(180, 180, 180);
                doc.setFontSize(8);
                doc.text("PHOTO", photoX + 17.5, photoY + 22.5, { align: 'center' });
            }
        }
        
        // Details on right side of photo
        const detailsX = 55;
        let detailsY = 35;
        
        // Student ID
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`ID: ${studentId}`, detailsX, detailsY);
        detailsY += 8;
        
        // Name
        doc.setFontSize(12);
        doc.text(fullName, detailsX, detailsY);
        detailsY += 12;
        
        // Other details
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        
        // Date of Birth
        doc.text(`Date of Birth:`, detailsX, detailsY);
        doc.text(formatDate(formData.dob), detailsX + 28, detailsY);
        detailsY += 6;
        
        // Phone
        doc.text(`Phone:`, detailsX, detailsY);
        doc.text(formData.phone, detailsX + 28, detailsY);
        detailsY += 6;
        
        // Address
        doc.text(`Address:`, detailsX, detailsY);
        const addressLines = doc.splitTextToSize(formData.address, 38);
        const displayLines = addressLines.slice(0, 2); // Max 2 lines
        for(let i = 0; i < displayLines.length; i++) {
            doc.text(displayLines[i], detailsX + 28, detailsY + (i * 4));
        }
        
        // Thin border around content area
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.rect(10, 25, 85, 75, 'S');
        
        // Issue date at bottom
        const issueDate = new Date().toLocaleDateString('en-GB');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Issued: ${issueDate}`, 52.5, 115, { align: 'center' });
        
        // Very simple footer
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("Valid Student Identification", 52.5, 122, { align: 'center' });
        
        // Download
        doc.save(`ID_${studentId}.pdf`);
        
        // Feedback
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded';
        downloadBtn.style.background = '#6a11cb';
        
        setTimeout(() => {
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download ID';
            downloadBtn.style.background = '#00c896';
        }, 1500);
    });
    
    // Initialize
    studentId = generateStudentId();
    
    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target === cameraModal) {
            closeCamera();
        }
    });
    
    // Drag and drop
    const photoPreview = document.getElementById('photoPreview');
    
    photoPreview.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#00c896';
    });
    
    photoPreview.addEventListener('dragleave', function(e) {
        this.style.borderColor = '#2575fc';
    });
    
    photoPreview.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#2575fc';
        
        if (e.dataTransfer.files.length) {
            handlePhotoFile(e.dataTransfer.files[0]);
        }
    });
});
