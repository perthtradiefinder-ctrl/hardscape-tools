// Photo preview functionality
document.getElementById('photoUpload')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `<img src="${event.target.result}" alt="Photo preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Make photo preview clickable
document.getElementById('photoPreview')?.addEventListener('click', function() {
    document.getElementById('photoUpload').click();
});

// Calculate materials and costs
function calculateMaterials() {
    const width = parseFloat(document.getElementById('width').value);
    const length = parseFloat(document.getElementById('length').value);
    const thickness = parseFloat(document.getElementById('thickness').value);
    const concreteType = document.getElementById('concreteType').value;
    const laborRate = parseFloat(document.getElementById('laborRate').value);

    // Validate inputs
    if (!width || !length || !thickness || !laborRate) {
        alert('Please fill in all fields');
        return;
    }

    // Get concrete price from selected type
    const concretePrices = {
        'standard': 150,
        'reinforced': 175,
        'colored': 200,
        'stamped': 225
    };
    const concretePrice = concretePrices[concreteType];

    // Calculate square footage
    const squareFeet = width * length;

    // Calculate cubic yards needed
    // Formula: (sqft * depth in inches) / 324 = cubic yards
    const cubicYards = (squareFeet * thickness) / 324;

    // Calculate costs
    const materialCost = cubicYards * concretePrice;
    const laborCost = laborRate * 8; // Assume 8 hour job
    const totalCost = materialCost + laborCost;
    const markupCost = totalCost * 1.2; // 20% markup

    // Display results
    document.getElementById('resultArea').textContent = squareFeet.toFixed(0) + ' sq ft';
    document.getElementById('resultVolume').textContent = cubicYards.toFixed(2) + ' cubic yards';
    document.getElementById('resultMaterialCost').textContent = '$' + materialCost.toFixed(2);
    document.getElementById('resultLaborCost').textContent = '$' + laborCost.toFixed(2);
    document.getElementById('resultTotal').textContent = '$' + totalCost.toFixed(2);
    document.getElementById('resultMarkup').textContent = '$' + markupCost.toFixed(2);

    // Show results section
    document.getElementById('results').style.display = 'block';
    document.getElementById('noResults').style.display = 'none';
}

// Save estimate to local storage
function saveEstimate() {
    const width = document.getElementById('width').value;
    const length = document.getElementById('length').value;
    const total = document.getElementById('resultTotal').textContent;
    const timestamp = new Date().toLocaleDateString();

    let estimates = JSON.parse(localStorage.getItem('estimates')) || [];
    
    const estimate = {
        id: Date.now(),
        width,
        length,
        total,
        timestamp
    };

    estimates.push(estimate);
    localStorage.setItem('estimates', JSON.stringify(estimates));

    displaySavedEstimates();
    alert('Estimate saved successfully!');
}

// Display saved estimates
function displaySavedEstimates() {
    const estimates = JSON.parse(localStorage.getItem('estimates')) || [];
    const savedList = document.getElementById('savedList');

    if (estimates.length === 0) {
        savedList.innerHTML = '<p>No saved estimates yet</p>';
        return;
    }

    savedList.innerHTML = estimates.map(est => `
        <div class="saved-item">
            <h3>${est.width}' × ${est.length}'</h3>
            <div class="saved-details">${est.timestamp}</div>
            <p><strong>${est.total}</strong></p>
            <button class="btn btn-secondary btn-sm" onclick="deleteEstimate(${est.id})">Delete</button>
        </div>
    `).join('');
}

// Delete saved estimate
function deleteEstimate(id) {
    let estimates = JSON.parse(localStorage.getItem('estimates')) || [];
    estimates = estimates.filter(e => e.id !== id);
    localStorage.setItem('estimates', JSON.stringify(estimates));
    displaySavedEstimates();
}

// Use in invoice (pass data to invoice page)
function useInInvoice() {
    const width = document.getElementById('width').value;
    const length = document.getElementById('length').value;
    const total = document.getElementById('resultTotal').textContent;
    const markup = document.getElementById('resultMarkup').textContent;

    // Store calculation in session storage
    sessionStorage.setItem('estimateData', JSON.stringify({
        width,
        length,
        total,
        markup
    }));

    // Redirect to invoice page
    window.location.href = 'invoice.html';
}

// Load saved estimates on page load
window.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('savedList')) {
        displaySavedEstimates();
    }
});
