// Photo preview functionality
function setupPhotoUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    if (input && preview) {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    preview.innerHTML = `<img src="${event.target.result}" alt="Photo preview">`;
                };
                reader.readAsDataURL(file);
            }
        });

        preview.addEventListener('click', function() {
            input.click();
        });
    }
}

// Add line item to invoice
function addLineItem() {
    const lineItems = document.getElementById('lineItems');
    const itemCount = lineItems.children.length;

    const lineItemHTML = `
        <div class="line-item-row" id="lineItem${itemCount}">
            <div>
                <input type="text" placeholder="Description (e.g., Concrete - 25 cubic yards)" class="item-description">
            </div>
            <div>
                <input type="number" placeholder="Quantity" step="0.1" class="item-quantity" value="1">
            </div>
            <div>
                <input type="number" placeholder="Unit Price" step="0.01" class="item-price" value="0">
            </div>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeLineItem(${itemCount})">Remove</button>
        </div>
    `;

    lineItems.insertAdjacentHTML('beforeend', lineItemHTML);
}

// Remove line item
function removeLineItem(id) {
    const item = document.getElementById(`lineItem${id}`);
    if (item) {
        item.remove();
    }
}

// Generate invoice with preview
function generateInvoice() {
    // Get business info
    const companyName = document.getElementById('companyName').value || 'Your Company Name';
    const companyPhone = document.getElementById('companyPhone').value || 'Phone';
    const companyEmail = document.getElementById('companyEmail').value || 'email@company.com';
    const companyAddress = document.getElementById('companyAddress').value || 'Address';

    // Get client info
    const clientName = document.getElementById('clientName').value || 'Client Name';
    const clientEmail = document.getElementById('clientEmail').value || 'client@email.com';
    const clientPhone = document.getElementById('clientPhone').value || 'Phone';
    const clientAddress = document.getElementById('clientAddress').value || 'Address';

    // Get project info
    const projectName = document.getElementById('projectName').value || 'Project Name';
    const projectDescription = document.getElementById('projectDescription').value || 'Project details';
    const notes = document.getElementById('notes').value || '';

    // Get photos
    const beforePhoto = document.getElementById('beforePhoto').files[0];
    const afterPhoto = document.getElementById('afterPhoto').files[0];

    // Get line items
    const lineItems = [];
    document.querySelectorAll('.line-item-row').forEach(row => {
        const description = row.querySelector('.item-description').value;
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        
        if (description && quantity && price) {
            lineItems.push({
                description,
                quantity,
                price,
                total: (quantity * price).toFixed(2)
            });
        }
    });

    if (lineItems.length === 0) {
        alert('Please add at least one line item');
        return;
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Read photos and create HTML
    let photoHTML = '';

    if (beforePhoto) {
        const beforeReader = new FileReader();
        beforeReader.onload = function(e1) {
            let completePhotoHTML = `
                <div class="photo-comparison">
                    <h4>Before</h4>
                    <img src="${e1.target.result}" alt="Before photo" style="max-width: 200px; max-height: 200px;">
                </div>
            `;

            if (afterPhoto) {
                const afterReader = new FileReader();
                afterReader.onload = function(e2) {
                    completePhotoHTML = `
                        <div class="invoice-photos">
                            <div class="photo-comparison">
                                <h4>Before</h4>
                                <img src="${e1.target.result}" alt="Before photo" style="max-width: 200px; max-height: 200px;">
                            </div>
                            <div class="photo-comparison">
                                <h4>After (Expected Result)</h4>
                                <img src="${e2.target.result}" alt="After photo" style="max-width: 200px; max-height: 200px;">
                            </div>
                        </div>
                    `;

                    displayInvoicePreview(companyName, companyPhone, companyEmail, companyAddress, 
                                        clientName, clientEmail, clientPhone, clientAddress,
                                        projectName, projectDescription, completePhotoHTML,
                                        lineItems, subtotal, tax, total, notes);
                };
                afterReader.readAsDataURL(afterPhoto);
            } else {
                displayInvoicePreview(companyName, companyPhone, companyEmail, companyAddress, 
                                    clientName, clientEmail, clientPhone, clientAddress,
                                    projectName, projectDescription, completePhotoHTML,
                                    lineItems, subtotal, tax, total, notes);
            }
        };
        beforeReader.readAsDataURL(beforePhoto);
    } else {
        displayInvoicePreview(companyName, companyPhone, companyEmail, companyAddress, 
                            clientName, clientEmail, clientPhone, clientAddress,
                            projectName, projectDescription, '',
                            lineItems, subtotal, tax, total, notes);
    }
}

// Display invoice preview
function displayInvoicePreview(companyName, companyPhone, companyEmail, companyAddress,
                              clientName, clientEmail, clientPhone, clientAddress,
                              projectName, projectDescription, photoHTML,
                              lineItems, subtotal, tax, total, notes) {
    
    const invoiceDate = new Date().toLocaleDateString();
    const invoiceNumber = 'INV-' + Date.now().toString().slice(-6);

    const lineItemsHTML = lineItems.map(item => `
        <tr>
            <td>${item.description}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">$${item.price.toFixed(2)}</td>
            <td class="text-right"><strong>$${item.total}</strong></td>
        </tr>
    `).join('');

    const invoiceHTML = `
        <div class="invoice-header">
            <div>
                <h2 style="margin: 0; color: #2563eb;">${companyName}</h2>
                <p>${companyAddress}</p>
                <p>📞 ${companyPhone}</p>
                <p>✉️ ${companyEmail}</p>
            </div>
            <div style="text-align: right;">
                <h3 style="margin: 0; font-size: 1.5rem;">QUOTE</h3>
                <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                <p><strong>Date:</strong> ${invoiceDate}</p>
            </div>
        </div>

        <div class="invoice-header" style="border-top: none;">
            <div>
                <h4>Bill To:</h4>
                <p><strong>${clientName}</strong></p>
                <p>${clientAddress}</p>
                <p>📞 ${clientPhone}</p>
                <p>✉️ ${clientEmail}</p>
            </div>
            <div style="text-align: right;">
                <h4>Project:</h4>
                <p><strong>${projectName}</strong></p>
                <p>${projectDescription}</p>
            </div>
        </div>

        ${photoHTML}

        <table class="line-items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${lineItemsHTML}
            </tbody>
        </table>

        <div class="invoice-total">
            <div>
                <div class="total-row">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-value">$${subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span class="total-label">Tax (10%):</span>
                    <span class="total-value">$${tax.toFixed(2)}</span>
                </div>
                <div class="total-row" style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #d1d5db;">
                    <span class="total-label" style="font-size: 1.2rem;">Total:</span>
                    <span class="total-value" style="font-size: 1.2rem;">$${total.toFixed(2)}</span>
                </div>
            </div>
        </div>

        ${notes ? `<div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #d1d5db;"><strong>Notes:</strong><p>${notes}</p></div>` : ''}
    `;

    document.getElementById('invoicePreview').innerHTML = invoiceHTML;

    // Save to session storage for printing/downloading
    sessionStorage.setItem('currentInvoice', JSON.stringify({
        invoiceNumber,
        invoiceDate,
        companyName,
        clientName,
        total
    }));
}

// Print invoice
function printInvoice() {
    const invoiceContent = document.getElementById('invoicePreview').innerHTML;
    
    if (invoiceContent.includes('Preview will appear here')) {
        alert('Please generate an invoice first');
        return;
    }

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="styles.css">
            <style>
                body { margin: 0; padding: 20px; }
                .invoice-document { background: white; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="invoice-document">
                ${invoiceContent}
            </div>
            <script>
                window.print();
                window.close();
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Download invoice as PDF (basic implementation using browser printing)
function downloadInvoice() {
    const invoiceContent = document.getElementById('invoicePreview').innerHTML;
    
    if (invoiceContent.includes('Preview will appear here')) {
        alert('Please generate an invoice first');
        return;
    }

    const invoiceData = JSON.parse(sessionStorage.getItem('currentInvoice') || '{}');
    
    alert('To save as PDF:\n1. Click Print from the printer dialog\n2. Select "Save as PDF"\n3. Choose your location');
    
    printInvoice();
}

// Initialize page
window.addEventListener('DOMContentLoaded', function() {
    setupPhotoUpload('beforePhoto', 'beforePhotoPreview');
    setupPhotoUpload('afterPhoto', 'afterPhotoPreview');

    // Check if estimate data was passed from calculator
    const estimateData = sessionStorage.getItem('estimateData');
    if (estimateData) {
        const data = JSON.parse(estimateData);
        
        // Add a pre-filled line item with the calculation
        addLineItem();
        const firstItem = document.querySelector('.line-item-row');
        if (firstItem) {
            firstItem.querySelector('.item-description').value = `Concrete Work - ${data.width}' × ${data.length}'`;
            firstItem.querySelector('.item-price').value = data.total.replace('$', '');
        }

        sessionStorage.removeItem('estimateData');
    }
});
