// ============================================================
// 🔐 Locker Page USER CREDENTIALS - CHANGE THESE HERE
// ============================================================
var VALID_USERNAME = "cusplab0098";
var VALID_PASSWORD = "12345678";
// ============================================================

// ============================================
// SESSION MANAGEMENT
// ============================================
var SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
var sessionTimeout = null;
var sessionWarningTimeout = null;
var sessionTimerInterval = null;
var sessionStartTime = null;

function startSessionTimer() {
    sessionStartTime = Date.now();
    updateSessionTimer();
    sessionTimerInterval = setInterval(updateSessionTimer, 1000);
    
    // Set warning at 11 hours 30 minutes (30 minutes before logout)
    sessionWarningTimeout = setTimeout(function() {
        document.getElementById('sessionWarning').classList.add('show');
        showToast('⚠️ Your session will expire in 30 minutes! Please save your work.', 'warning');
    }, 11 * 60 * 60 * 1000 + 30 * 60 * 1000);
    
    // Set logout at 12 hours
    sessionTimeout = setTimeout(function() {
        document.getElementById('sessionWarning').classList.remove('show');
        showToast('⏰ Session expired. Please login again.', 'error');
        alert('Your session has expired after 12 hours. You will be logged out.');
        logoutUser();
    }, SESSION_DURATION);
}

function updateSessionTimer() {
    if (!sessionStartTime) return;
    var elapsed = Date.now() - sessionStartTime;
    var remaining = SESSION_DURATION - elapsed;
    
    if (remaining <= 0) {
        document.getElementById('sessionTimer').textContent = '⏱️ 00:00:00';
        return;
    }
    
    var hours = Math.floor(remaining / (60 * 60 * 1000));
    var minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    var seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    document.getElementById('sessionTimer').textContent = 
        '⏱️ ' + String(hours).padStart(2, '0') + ':' + 
        String(minutes).padStart(2, '0') + ':' + 
        String(seconds).padStart(2, '0');
}

function clearSessionTimers() {
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        sessionTimeout = null;
    }
    if (sessionWarningTimeout) {
        clearTimeout(sessionWarningTimeout);
        sessionWarningTimeout = null;
    }
    if (sessionTimerInterval) {
        clearInterval(sessionTimerInterval);
        sessionTimerInterval = null;
    }
    document.getElementById('sessionWarning').classList.remove('show');
}

// ============================================
// LOGIN / LOGOUT
// ============================================
function loginUser() {
    var username = document.getElementById('loginUsername').value.trim();
    var password = document.getElementById('loginPassword').value.trim();
    var errorEl = document.getElementById('loginError');
    
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        errorEl.classList.remove('show');
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appContainer').classList.add('show');
        document.getElementById('userDisplay').textContent = '👤 ' + username;
        
        // Save login state
        localStorage.setItem('dentalSession', 'true');
        
        // Load data after login
        loadData();
        updateAll();
        toggleExpiry();
        
        // Start session timer
        clearSessionTimers();
        startSessionTimer();
        
        showToast('✅ Welcome back, ' + username + '! Session: 12 hours', 'success');
    } else {
        errorEl.classList.add('show');
        errorEl.textContent = '❌ Invalid username or password. Please try again.';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
    }
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        saveData();
        clearSessionTimers();
        localStorage.removeItem('dentalSession');
        document.getElementById('appContainer').classList.remove('show');
        document.getElementById('loginPage').style.display = 'block';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').classList.remove('show');
        document.getElementById('sessionTimer').textContent = '⏱️ 12:00:00';
        showToast('👋 Logged out successfully', 'info');
    }
}

// Enter key to login
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        if (document.getElementById('loginPage').style.display !== 'none') {
            loginUser();
        }
    }
});

// ============================================
// COMPANY SETTINGS
// ============================================
var COMPANY_NAME = "🦷 Dental Lab";
var VAT_NUMBER = "123456789";
var CR_NUMBER = "987654321";
var COMPANY_ADDRESS = "123 Dental Street, Riyadh, Saudi Arabia";

// ============================================
// DATA
// ============================================
var data = {
    companies: [],
    materials: [],
    technicians: [],
    incoming: [],
    outgoing: []
};

var nextId = {
    company: 1,
    material: 1,
    technician: 1,
    incoming: 1,
    outgoing: 1
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(msg, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    if (!container) {
        var newContainer = document.createElement('div');
        newContainer.id = 'toastContainer';
        newContainer.style.position = 'fixed';
        newContainer.style.top = '20px';
        newContainer.style.right = '20px';
        newContainer.style.zIndex = '9999';
        document.body.appendChild(newContainer);
        container = newContainer;
    }
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

// ============================================
// SAVE & LOAD
// ============================================
function saveData() {
    localStorage.setItem('dentalData', JSON.stringify(data));
    var status = document.getElementById('saveStatus');
    if (status) {
        status.textContent = '💾 Saved';
        setTimeout(function() {
            status.textContent = '💾 Auto-saved';
        }, 2000);
    }
}

function loadData() {
    var saved = localStorage.getItem('dentalData');
    if (saved) {
        try {
            var parsed = JSON.parse(saved);
            data = parsed;
            for (var key in nextId) {
                var arr = key + 's';
                if (data[arr]) {
                    var max = 0;
                    for (var i = 0; i < data[arr].length; i++) {
                        if (data[arr][i].id > max) max = data[arr][i].id;
                    }
                    nextId[key] = max + 1;
                }
            }
        } catch(e) {
            console.log('Error loading data:', e);
        }
    }
}

// ============================================
// HELPERS
// ============================================
function getMaterial(id) {
    for (var i = 0; i < data.materials.length; i++) {
        if (data.materials[i].id === id) return data.materials[i];
    }
    return null;
}

function getMaterialName(id) {
    var m = getMaterial(id);
    return m ? m.name : null;
}

function getMaterialStock(id) {
    var received = 0;
    var issued = 0;
    for (var i = 0; i < data.incoming.length; i++) {
        if (data.incoming[i].material_id === id) received += data.incoming[i].quantity;
    }
    for (var i = 0; i < data.outgoing.length; i++) {
        if (data.outgoing[i].material_id === id) issued += data.outgoing[i].quantity;
    }
    return received - issued;
}

function getCompanyStock(id, company) {
    var received = 0;
    var issued = 0;
    for (var i = 0; i < data.incoming.length; i++) {
        if (data.incoming[i].material_id === id && data.incoming[i].company === company) {
            received += data.incoming[i].quantity;
        }
    }
    for (var i = 0; i < data.outgoing.length; i++) {
        if (data.outgoing[i].material_id === id && data.outgoing[i].company === company) {
            issued += data.outgoing[i].quantity;
        }
    }
    return received - issued;
}

function isInRange(dateStr, startDate, endDate) {
    if (!dateStr) return false;
    if (!startDate && !endDate) return true;
    var date = new Date(dateStr);
    date.setHours(0,0,0,0);
    if (startDate) {
        var start = new Date(startDate);
        start.setHours(0,0,0,0);
        if (date < start) return false;
    }
    if (endDate) {
        var end = new Date(endDate);
        end.setHours(0,0,0,0);
        if (date > end) return false;
    }
    return true;
}

function formatCurrency(amount) {
    return 'SAR ' + amount.toFixed(2);
}

function formatDate(date) {
    if (!date) return '-';
    var d = new Date(date);
    return d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
}

function getMonthYear() {
    var d = new Date();
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[d.getMonth()] + ' ' + d.getFullYear();
}

// ============================================
// PAGE NAVIGATION
// ============================================
function showPage(page) {
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav button').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.nav button').forEach(function(b) {
        if (b.textContent.toLowerCase().includes(page)) b.classList.add('active');
    });
    if (page === 'dashboard') updateDashboard();
    if (page === 'lists') updateLists();
    if (page === 'incoming') updateIncoming();
    if (page === 'outgoing') updateOutgoing();
    if (page === 'stock') updateStock();
    if (page === 'expiry') updateExpiry();
}

// ============================================
// ADD FUNCTIONS
// ============================================
function toggleAddForm() {
    var type = document.getElementById('addType').value;
    document.getElementById('addMaterialForm').style.display = type === 'material' ? 'block' : 'none';
    document.getElementById('addCompanyForm').style.display = type === 'company' ? 'block' : 'none';
    document.getElementById('addTechnicianForm').style.display = type === 'technician' ? 'block' : 'none';
    if (type === 'material') updateAddCompanyDropdown();
}

function updateAddCompanyDropdown() {
    var select = document.getElementById('addMatCompany');
    if (!select) return;
    var val = select.value;
    select.innerHTML = '<option value="">Select Company</option>';
    for (var i = 0; i < data.companies.length; i++) {
        select.innerHTML += '<option value="' + data.companies[i].name + '">' + data.companies[i].name + '</option>';
    }
    select.value = val;
}

function addMaterial() {
    var name = document.getElementById('addMatName').value.trim();
    var unit = document.getElementById('addMatUnit').value;
    var company = document.getElementById('addMatCompany').value;
    var price = parseFloat(document.getElementById('addMatPrice').value);

    if (!name) { showToast('⚠️ Enter material name!', 'error'); return; }
    if (!company) { showToast('⚠️ Select a company!', 'error'); return; }
    if (!price || price <= 0) { showToast('⚠️ Enter valid price!', 'error'); return; }

    for (var i = 0; i < data.materials.length; i++) {
        if (data.materials[i].name.toLowerCase() === name.toLowerCase() && 
            data.materials[i].company === company) {
            showToast('⚠️ Material "' + name + '" with "' + company + '" already exists!', 'error');
            return;
        }
    }

    data.materials.push({
        id: nextId.material++,
        name: name,
        company: company,
        price: price,
        unit: unit,
        code: 'MAT-' + String(nextId.material).padStart(3, '0')
    });

    document.getElementById('addMatName').value = '';
    document.getElementById('addMatPrice').value = '';
    saveData();
    updateAll();
    showToast('✅ Material "' + name + '" added for "' + company + '" at SAR ' + price.toFixed(2));
    alert('✅ Material "' + name + '" added!\nCompany: ' + company + '\nPrice: SAR ' + price.toFixed(2));
}

function addCompany() {
    var name = document.getElementById('addCompName').value.trim();
    if (!name) { showToast('⚠️ Enter company name!', 'error'); return; }

    for (var i = 0; i < data.companies.length; i++) {
        if (data.companies[i].name.toLowerCase() === name.toLowerCase()) {
            showToast('⚠️ Company "' + name + '" already exists!', 'error');
            return;
        }
    }

    data.companies.push({
        id: nextId.company++,
        name: name,
        contact: document.getElementById('addCompContact').value.trim() || '',
        phone: document.getElementById('addCompPhone').value.trim() || '',
        email: document.getElementById('addCompEmail').value.trim() || '',
        address: document.getElementById('addCompAddress').value.trim() || ''
    });

    document.getElementById('addCompName').value = '';
    document.getElementById('addCompContact').value = '';
    document.getElementById('addCompPhone').value = '';
    document.getElementById('addCompEmail').value = '';
    document.getElementById('addCompAddress').value = '';
    saveData();
    updateAll();
    showToast('✅ Company "' + name + '" added!');
    alert('✅ Company "' + name + '" added successfully!');
}

function addTechnician() {
    var name = document.getElementById('addTechName').value.trim();
    if (!name) { showToast('⚠️ Enter technician name!', 'error'); return; }

    for (var i = 0; i < data.technicians.length; i++) {
        if (data.technicians[i].name.toLowerCase() === name.toLowerCase()) {
            showToast('⚠️ Technician "' + name + '" already exists!', 'error');
            return;
        }
    }

    data.technicians.push({
        id: nextId.technician++,
        name: name,
        specialization: document.getElementById('addTechSpec').value.trim() || ''
    });

    document.getElementById('addTechName').value = '';
    document.getElementById('addTechSpec').value = '';
    saveData();
    updateAll();
    showToast('✅ Technician "' + name + '" added!');
    alert('✅ Technician "' + name + '" added successfully!');
}

// ============================================
// DELETE FUNCTIONS
// ============================================
function deleteMaterial(id) {
    if (!confirm('Delete this material?')) return;
    data.materials = data.materials.filter(function(m) { return m.id !== id; });
    saveData();
    updateAll();
    showToast('✅ Material deleted!');
}

function deleteCompany(id) {
    if (!confirm('Delete this company?')) return;
    data.companies = data.companies.filter(function(c) { return c.id !== id; });
    saveData();
    updateAll();
    showToast('✅ Company deleted!');
}

function deleteTechnician(id) {
    if (!confirm('Delete this technician?')) return;
    data.technicians = data.technicians.filter(function(t) { return t.id !== id; });
    saveData();
    updateAll();
    showToast('✅ Technician deleted!');
}

function deleteIncoming(id) {
    if (!confirm('Delete this record?')) return;
    data.incoming = data.incoming.filter(function(item) { return item.id !== id; });
    saveData();
    updateAll();
    showToast('✅ Record deleted!');
}

function deleteOutgoing(id) {
    if (!confirm('Delete this record?')) return;
    data.outgoing = data.outgoing.filter(function(item) { return item.id !== id; });
    saveData();
    updateAll();
    showToast('✅ Record deleted!');
}

// ============================================
// AUTO-FILL FUNCTIONS
// ============================================
function autoFillIncoming() {
    var id = parseInt(document.getElementById('incMaterial').value);
    var material = getMaterial(id);
    if (material) {
        document.getElementById('incCompany').value = material.company;
        document.getElementById('incUnit').value = material.unit;
        document.getElementById('incPrice').value = material.price;
    }
}

function autoFillOutgoing() {
    var id = parseInt(document.getElementById('outMaterial').value);
    var material = getMaterial(id);
    var stockInfo = document.getElementById('outStockInfo');
    
    if (material) {
        document.getElementById('outCompany').value = material.company;
        document.getElementById('outUnit').value = material.unit;
        
        var stock = getCompanyStock(id, material.company);
        if (stock > 0) {
            stockInfo.innerHTML = '📊 Stock: ' + stock + ' ' + material.unit + ' available from ' + material.company;
            stockInfo.style.color = '#2b6cb0';
        } else {
            stockInfo.innerHTML = '⚠️ No stock available for "' + material.name + '" from ' + material.company;
            stockInfo.style.color = '#e53e3e';
        }
    } else {
        stockInfo.innerHTML = '💡 Select a material to view stock';
        stockInfo.style.color = '#4a5568';
    }
}

// ============================================
// SAVE INCOMING
// ============================================
function saveIncoming() {
    var material_id = parseInt(document.getElementById('incMaterial').value);
    var company = document.getElementById('incCompany').value;
    var quantity = parseInt(document.getElementById('incQty').value);
    var unit = document.getElementById('incUnit').value;
    var price = parseFloat(document.getElementById('incPrice').value);
    var discount = parseFloat(document.getElementById('incDiscount').value) || 0;
    var expiryType = document.getElementById('incExpiryType').value;
    var expiry = expiryType === 'unlimited' ? 'unlimited' : document.getElementById('incExpiry').value;
    var location = document.getElementById('incLocation').value.trim();
    var batch = document.getElementById('incBatch').value.trim();
    var notes = document.getElementById('incNotes').value.trim();

    if (!material_id) { showToast('⚠️ Select a material!', 'error'); return; }
    if (!company) { showToast('⚠️ Select a company!', 'error'); return; }
    if (!quantity || quantity < 1) { showToast('⚠️ Enter valid quantity!', 'error'); return; }
    if (!price || price <= 0) { showToast('⚠️ Enter valid price!', 'error'); return; }
    if (expiryType === 'date' && !expiry) { showToast('⚠️ Select expiry date!', 'error'); return; }

    var total = quantity * price * (1 - discount / 100);
    data.incoming.push({
        id: nextId.incoming++,
        material_id: material_id,
        company: company,
        quantity: quantity,
        unit: unit,
        price: price,
        discount: discount,
        total: total,
        date: new Date().toISOString().split('T')[0],
        expiry: expiry,
        location: location,
        batch: batch,
        notes: notes
    });

    document.getElementById('incQty').value = '1';
    document.getElementById('incPrice').value = '';
    document.getElementById('incDiscount').value = '0';
    document.getElementById('incExpiry').value = '';
    document.getElementById('incLocation').value = '';
    document.getElementById('incBatch').value = '';
    document.getElementById('incNotes').value = '';

    saveData();
    updateAll();
    var msg = '✅ Received ' + quantity + ' ' + unit + ' of ' + getMaterialName(material_id) + '\nTotal: ' + formatCurrency(total);
    showToast(msg);
    alert(msg);
}

// ============================================
// SAVE OUTGOING
// ============================================
function saveOutgoing() {
    var material_id = parseInt(document.getElementById('outMaterial').value);
    var company = document.getElementById('outCompany').value;
    var technician = document.getElementById('outTech').value;
    var quantity = parseInt(document.getElementById('outQty').value);
    var unit = document.getElementById('outUnit').value;
    var caseNum = document.getElementById('outCase').value.trim();
    var notes = document.getElementById('outNotes').value.trim();

    if (!material_id) { showToast('⚠️ Select a material!', 'error'); return; }
    if (!company) { showToast('⚠️ Select a company!', 'error'); return; }
    if (!technician) { showToast('⚠️ Select a technician!', 'error'); return; }
    if (!quantity || quantity < 1) { showToast('⚠️ Enter valid quantity!', 'error'); return; }

    var stock = getCompanyStock(material_id, company);
    if (stock < quantity) {
        showToast('❌ Only ' + stock + ' ' + unit + ' available from ' + company, 'error');
        return;
    }

    var material = getMaterial(material_id);
    var total = quantity * material.price;

    data.outgoing.push({
        id: nextId.outgoing++,
        material_id: material_id,
        company: company,
        technician: technician,
        quantity: quantity,
        unit: unit,
        cost: material.price,
        total: total,
        date: new Date().toISOString().split('T')[0],
        case: caseNum,
        notes: notes
    });

    document.getElementById('outQty').value = '1';
    document.getElementById('outCase').value = '';
    document.getElementById('outNotes').value = '';

    saveData();
    updateAll();
    var msg = '✅ Issued ' + quantity + ' ' + unit + ' to ' + technician + '\nTotal: ' + formatCurrency(total);
    showToast(msg);
    alert(msg);
}

// ============================================
// UPDATE DROPDOWNS
// ============================================
function updateDropdowns() {
    var matSelects = ['incMaterial', 'outMaterial'];
    for (var s = 0; s < matSelects.length; s++) {
        var select = document.getElementById(matSelects[s]);
        if (!select) continue;
        var val = select.value;
        select.innerHTML = '<option value="">Select Material</option>';
        for (var i = 0; i < data.materials.length; i++) {
            var m = data.materials[i];
            select.innerHTML += '<option value="' + m.id + '">' + m.name + ' (' + m.company + ' - SAR ' + m.price.toFixed(2) + '/' + m.unit + ')</option>';
        }
        select.value = val;
    }

    var compSelects = ['incCompany', 'outCompany', 'addMatCompany'];
    for (var s = 0; s < compSelects.length; s++) {
        var select = document.getElementById(compSelects[s]);
        if (!select) continue;
        var val = select.value;
        select.innerHTML = '<option value="">Select Company</option>';
        for (var i = 0; i < data.companies.length; i++) {
            select.innerHTML += '<option value="' + data.companies[i].name + '">' + data.companies[i].name + '</option>';
        }
        select.value = val;
    }

    var techSelect = document.getElementById('outTech');
    if (techSelect) {
        var val = techSelect.value;
        techSelect.innerHTML = '<option value="">Select Technician</option>';
        for (var i = 0; i < data.technicians.length; i++) {
            techSelect.innerHTML += '<option value="' + data.technicians[i].name + '">' + data.technicians[i].name + '</option>';
        }
        techSelect.value = val;
    }
}

// ============================================
// TOGGLE EXPIRY
// ============================================
function toggleExpiry() {
    var type = document.getElementById('incExpiryType').value;
    var group = document.getElementById('incExpiryGroup');
    if (group) {
        group.style.display = type === 'date' ? 'block' : 'none';
    }
}

// ============================================
// LIST TABS
// ============================================
function showListTab(type) {
    document.querySelectorAll('.list-tabs button').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.list-content').forEach(function(c) { c.classList.remove('active'); });
    
    if (type === 'companies') {
        document.querySelector('.list-tabs button:nth-child(1)').classList.add('active');
        document.getElementById('listCompanies').classList.add('active');
    } else if (type === 'materials') {
        document.querySelector('.list-tabs button:nth-child(2)').classList.add('active');
        document.getElementById('listMaterials').classList.add('active');
    } else if (type === 'technicians') {
        document.querySelector('.list-tabs button:nth-child(3)').classList.add('active');
        document.getElementById('listTechnicians').classList.add('active');
    }
    updateLists();
}

// ============================================
// UPDATE LISTS
// ============================================
function clearListsFilter() {
    document.getElementById('listsStartDate').value = '';
    document.getElementById('listsEndDate').value = '';
    updateLists();
}

function updateLists() {
    var startDate = document.getElementById('listsStartDate').value;
    var endDate = document.getElementById('listsEndDate').value;
    
    var totalCompanies = data.companies.length;
    var totalMaterials = data.materials.length;
    var totalTechnicians = data.technicians.length;
    var totalCost = 0;
    var totalReceived = 0;
    var totalIssued = 0;
    
    for (var i = 0; i < data.incoming.length; i++) {
        var item = data.incoming[i];
        if (isInRange(item.date, startDate, endDate)) {
            totalCost += item.total;
            totalReceived += item.quantity;
        }
    }
    for (var i = 0; i < data.outgoing.length; i++) {
        var item = data.outgoing[i];
        if (isInRange(item.date, startDate, endDate)) {
            totalIssued += item.quantity;
        }
    }
    
    var activeCompanies = 0;
    var companyNames = {};
    for (var i = 0; i < data.incoming.length; i++) {
        if (isInRange(data.incoming[i].date, startDate, endDate)) {
            if (!companyNames[data.incoming[i].company]) {
                companyNames[data.incoming[i].company] = true;
                activeCompanies++;
            }
        }
    }
    for (var i = 0; i < data.outgoing.length; i++) {
        if (isInRange(data.outgoing[i].date, startDate, endDate)) {
            if (!companyNames[data.outgoing[i].company]) {
                companyNames[data.outgoing[i].company] = true;
                activeCompanies++;
            }
        }
    }
    
    var activeTechs = 0;
    var techNames = {};
    for (var i = 0; i < data.outgoing.length; i++) {
        if (isInRange(data.outgoing[i].date, startDate, endDate)) {
            if (!techNames[data.outgoing[i].technician]) {
                techNames[data.outgoing[i].technician] = true;
                activeTechs++;
            }
        }
    }
    
    var activeMaterials = 0;
    var matIds = {};
    for (var i = 0; i < data.incoming.length; i++) {
        if (isInRange(data.incoming[i].date, startDate, endDate)) {
            if (!matIds[data.incoming[i].material_id]) {
                matIds[data.incoming[i].material_id] = true;
                activeMaterials++;
            }
        }
    }
    for (var i = 0; i < data.outgoing.length; i++) {
        if (isInRange(data.outgoing[i].date, startDate, endDate)) {
            if (!matIds[data.outgoing[i].material_id]) {
                matIds[data.outgoing[i].material_id] = true;
                activeMaterials++;
            }
        }
    }
    
    document.getElementById('listTotalCompanies').textContent = activeCompanies + ' / ' + totalCompanies;
    document.getElementById('listTotalMaterials').textContent = activeMaterials + ' / ' + totalMaterials;
    document.getElementById('listTotalTechnicians').textContent = activeTechs + ' / ' + totalTechnicians;
    document.getElementById('listTotalCost').textContent = formatCurrency(totalCost);
    document.getElementById('listTotalReceived').textContent = totalReceived;
    document.getElementById('listTotalIssued').textContent = totalIssued;
    
    // Companies
    var tbody = document.getElementById('companyList');
    var companyData = [];
    for (var i = 0; i < data.companies.length; i++) {
        var c = data.companies[i];
        var spent = 0;
        for (var j = 0; j < data.incoming.length; j++) {
            if (data.incoming[j].company === c.name && isInRange(data.incoming[j].date, startDate, endDate)) {
                spent += data.incoming[j].total;
            }
        }
        if (spent > 0 || (startDate && endDate)) {
            companyData.push({ company: c, spent: spent });
        }
    }
    
    if (companyData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#a0aec0;padding:20px;">No companies with transactions in selected date range</td></tr>';
    } else {
        var html = '';
        for (var i = 0; i < companyData.length; i++) {
            var c = companyData[i].company;
            html += '<tr><td>' + (i+1) + '</td><td><strong>' + c.name + '</strong></td><td>' + (c.contact || '-') + '</td><td>' + (c.phone || '-') + '</td><td>' + (c.email || '-') + '</td><td>' + formatCurrency(companyData[i].spent) + '</td></tr>';
        }
        tbody.innerHTML = html;
    }

    // Materials
    var tbody2 = document.getElementById('materialList');
    var materialData = [];
    for (var i = 0; i < data.materials.length; i++) {
        var m = data.materials[i];
        var received = 0;
        var issued = 0;
        for (var j = 0; j < data.incoming.length; j++) {
            if (data.incoming[j].material_id === m.id && isInRange(data.incoming[j].date, startDate, endDate)) {
                received += data.incoming[j].quantity;
            }
        }
        for (var j = 0; j < data.outgoing.length; j++) {
            if (data.outgoing[j].material_id === m.id && isInRange(data.outgoing[j].date, startDate, endDate)) {
                issued += data.outgoing[j].quantity;
            }
        }
        if (received > 0 || issued > 0 || (startDate && endDate)) {
            materialData.push({ material: m, received: received, issued: issued });
        }
    }
    
    if (materialData.length === 0) {
        tbody2.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#a0aec0;padding:20px;">No materials with transactions in selected date range</td></tr>';
    } else {
        var html = '';
        for (var i = 0; i < materialData.length; i++) {
            var m = materialData[i].material;
            var stock = materialData[i].received - materialData[i].issued;
            var color = stock <= 0 ? '#e53e3e' : stock < 5 ? '#ed8936' : '#2b6cb0';
            html += '<tr><td>' + (i+1) + '</td><td><strong>' + m.name + '</strong></td><td>' + m.company + '</td><td>' + m.unit + '</td><td>' + materialData[i].received + '</td><td>' + materialData[i].issued + '</td><td><strong style="color:' + color + ';">' + stock + '</strong></td></tr>';
        }
        tbody2.innerHTML = html;
    }

    // Technicians
    var tbody3 = document.getElementById('technicianList');
    var techData = [];
    for (var i = 0; i < data.technicians.length; i++) {
        var t = data.technicians[i];
        var totalQty = 0;
        var totalCost = 0;
        for (var j = 0; j < data.outgoing.length; j++) {
            if (data.outgoing[j].technician === t.name && isInRange(data.outgoing[j].date, startDate, endDate)) {
                totalQty += data.outgoing[j].quantity;
                totalCost += data.outgoing[j].total;
            }
        }
        if (totalQty > 0 || (startDate && endDate)) {
            techData.push({ technician: t, totalQty: totalQty, totalCost: totalCost });
        }
    }
    
    if (techData.length === 0) {
        tbody3.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#a0aec0;padding:20px;">No technicians with transactions in selected date range</td></tr>';
    } else {
        var html = '';
        for (var i = 0; i < techData.length; i++) {
            var t = techData[i].technician;
            html += '<tr><td>' + (i+1) + '</td><td><strong>' + t.name + '</strong></td><td>' + (t.specialization || '-') + '</td><td>' + techData[i].totalQty + '</td><td>' + formatCurrency(techData[i].totalCost) + '</td></tr>';
        }
        tbody3.innerHTML = html;
    }
}

// ============================================
// UPDATE INCOMING
// ============================================
function clearIncFilter() {
    document.getElementById('incStartDate').value = '';
    document.getElementById('incEndDate').value = '';
    updateIncoming();
}

function updateIncoming() {
    var startDate = document.getElementById('incStartDate').value;
    var endDate = document.getElementById('incEndDate').value;
    
    var tbody = document.getElementById('incomingTable');
    var filtered = data.incoming.filter(function(item) {
        return isInRange(item.date, startDate, endDate);
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#a0aec0;padding:20px;">No records</td></tr>';
    } else {
        var html = '';
        for (var i = filtered.length - 1; i >= 0; i--) {
            var item = filtered[i];
            var expiryDisplay = item.expiry === 'unlimited' ? '♾️ Unlimited' : formatDate(item.expiry);
            html += '<tr><td>' + formatDate(item.date) + '</td><td>' + getMaterialName(item.material_id) + '</td><td>' + item.company + '</td><td>' + item.quantity + '</td><td>' + item.unit + '</td><td>' + formatCurrency(item.total) + '</td><td>' + expiryDisplay + '</td><td><button class="small-btn delete" onclick="deleteIncoming(' + item.id + ')">🗑️</button></td></tr>';
        }
        tbody.innerHTML = html;
    }
}

// ============================================
// UPDATE OUTGOING
// ============================================
function clearOutFilter() {
    document.getElementById('outStartDate').value = '';
    document.getElementById('outEndDate').value = '';
    updateOutgoing();
}

function updateOutgoing() {
    var startDate = document.getElementById('outStartDate').value;
    var endDate = document.getElementById('outEndDate').value;
    
    var tbody = document.getElementById('outgoingTable');
    var filtered = data.outgoing.filter(function(item) {
        return isInRange(item.date, startDate, endDate);
    });
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#a0aec0;padding:20px;">No records</td></tr>';
    } else {
        var html = '';
        for (var i = filtered.length - 1; i >= 0; i--) {
            var item = filtered[i];
            html += '<tr><td>' + formatDate(item.date) + '</td><td>' + getMaterialName(item.material_id) + '</td><td>' + item.company + '</td><td>' + item.technician + '</td><td>' + item.quantity + '</td><td>' + item.unit + '</td><td>' + formatCurrency(item.total) + '</td><td><button class="small-btn delete" onclick="deleteOutgoing(' + item.id + ')">🗑️</button></td></tr>';
        }
        tbody.innerHTML = html;
    }
}

// ============================================
// UPDATE STOCK
// ============================================
function clearStockFilter() {
    document.getElementById('stockStartDate').value = '';
    document.getElementById('stockEndDate').value = '';
    updateStock();
}

function updateStock() {
    var startDate = document.getElementById('stockStartDate').value;
    var endDate = document.getElementById('stockEndDate').value;
    
    var tbody = document.getElementById('stockTable');
    if (data.materials.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#a0aec0;padding:20px;">No materials</td></tr>';
    } else {
        var html = '';
        for (var i = 0; i < data.materials.length; i++) {
            var m = data.materials[i];
            var received = 0;
            var issued = 0;
            for (var j = 0; j < data.incoming.length; j++) {
                if (data.incoming[j].material_id === m.id && isInRange(data.incoming[j].date, startDate, endDate)) {
                    received += data.incoming[j].quantity;
                }
            }
            for (var j = 0; j < data.outgoing.length; j++) {
                if (data.outgoing[j].material_id === m.id && isInRange(data.outgoing[j].date, startDate, endDate)) {
                    issued += data.outgoing[j].quantity;
                }
            }
            var stock = received - issued;
            var color = stock <= 0 ? '#e53e3e' : stock < 5 ? '#ed8936' : '#2b6cb0';
            html += '<tr><td><strong>' + m.name + '</strong></td><td>' + m.company + '</td><td>' + m.unit + '</td><td>' + received + '</td><td>' + issued + '</td><td><strong style="color:' + color + ';">' + stock + '</strong></td><td>SAR ' + m.price.toFixed(2) + '</td></tr>';
        }
        tbody.innerHTML = html;
    }
    
    prepareStockReport();
}

// ============================================
// STOCK REPORT
// ============================================
function prepareStockReport() {
    var startDate = document.getElementById('stockStartDate').value;
    var endDate = document.getElementById('stockEndDate').value;
    
    var totalMaterials = 0;
    var totalReceived = 0;
    var totalIssued = 0;
    var totalValue = 0;
    var rows = [];
    
    for (var i = 0; i < data.materials.length; i++) {
        var m = data.materials[i];
        var received = 0;
        var issued = 0;
        for (var j = 0; j < data.incoming.length; j++) {
            if (data.incoming[j].material_id === m.id && isInRange(data.incoming[j].date, startDate, endDate)) {
                received += data.incoming[j].quantity;
            }
        }
        for (var j = 0; j < data.outgoing.length; j++) {
            if (data.outgoing[j].material_id === m.id && isInRange(data.outgoing[j].date, startDate, endDate)) {
                issued += data.outgoing[j].quantity;
            }
        }
        var stock = received - issued;
        var value = stock * m.price;
        
        if (stock > 0 || received > 0 || issued > 0) {
            totalMaterials++;
            totalReceived += received;
            totalIssued += issued;
            totalValue += value;
            rows.push({
                name: m.name,
                company: m.company,
                unit: m.unit,
                received: received,
                issued: issued,
                stock: stock,
                price: m.price,
                value: value
            });
        }
    }
    
    document.getElementById('reportLabName').textContent = COMPANY_NAME;
    document.getElementById('reportVat').textContent = 'VAT: ' + VAT_NUMBER + ' | CR: ' + CR_NUMBER;
    document.getElementById('reportAddress').textContent = COMPANY_ADDRESS;
    document.getElementById('reportCompanyName').textContent = COMPANY_NAME;
    document.getElementById('reportVatNumber').textContent = VAT_NUMBER;
    document.getElementById('reportCrNumber').textContent = CR_NUMBER;
    
    var now = new Date();
    var dateStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
    document.getElementById('reportDate').textContent = dateStr;
    document.getElementById('reportGeneratedDate').textContent = now.toLocaleString();
    
    var monthYear = getMonthYear();
    if (startDate && endDate) {
        var start = new Date(startDate);
        var end = new Date(endDate);
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
            document.getElementById('reportPeriod').textContent = 'For the Month of ' + months[start.getMonth()] + ' ' + start.getFullYear();
        } else {
            document.getElementById('reportPeriod').textContent = 'From ' + startDate + ' to ' + endDate;
        }
    } else {
        document.getElementById('reportPeriod').textContent = 'For the Month of ' + monthYear;
    }
    
    document.getElementById('reportTotalMaterials').textContent = totalMaterials;
    document.getElementById('reportTotalReceived').textContent = totalReceived;
    document.getElementById('reportTotalIssued').textContent = totalIssued;
    document.getElementById('reportTotalValue').textContent = formatCurrency(totalValue);
    document.getElementById('reportTotalValue2').textContent = formatCurrency(totalValue);
    
    var tbody = document.getElementById('reportTableBody');
    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:30px;color:#a0aec0;">No data available for this period</td></tr>';
        document.getElementById('reportTotalPrice').textContent = 'SAR 0.00';
    } else {
        var html = '';
        var totalPrice = 0;
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var stockColor = r.stock <= 0 ? '#e53e3e' : r.stock < 5 ? '#ed8936' : '#2b6cb0';
            html += '<tr>' +
                '<td>' + (i+1) + '</td>' +
                '<td><strong>' + r.name + '</strong></td>' +
                '<td>' + r.company + '</td>' +
                '<td>' + r.unit + '</td>' +
                '<td style="text-align:center;">' + r.received + '</td>' +
                '<td style="text-align:center;">' + r.issued + '</td>' +
                '<td style="text-align:center;font-weight:bold;color:' + stockColor + ';">' + r.stock + '</td>' +
                '<td style="text-align:right;">' + r.price.toFixed(2) + '</td>' +
                '<td style="text-align:right;">' + r.value.toFixed(2) + '</td>' +
            '</tr>';
            totalPrice += r.price;
        }
        tbody.innerHTML = html;
        document.getElementById('reportTotalPrice').textContent = 'SAR ' + totalPrice.toFixed(2);
    }
}

function printStockReport() {
    prepareStockReport();
    var printArea = document.getElementById('printArea');
    printArea.style.display = 'block';
    
    setTimeout(function() {
        window.print();
        setTimeout(function() {
            printArea.style.display = 'none';
        }, 1000);
    }, 500);
}

// ============================================
// UPDATE EXPIRY
// ============================================
function updateExpiry() {
    var filter = document.getElementById('expiryFilter').value;
    var tbody = document.getElementById('expiryTable');
    var rows = [];
    var today = new Date();
    today.setHours(0,0,0,0);
    
    for (var i = 0; i < data.incoming.length; i++) {
        var item = data.incoming[i];
        if (!item.expiry || item.expiry === 'unlimited') continue;
        var materialName = getMaterialName(item.material_id);
        if (!materialName) continue;
        var stock = getMaterialStock(item.material_id);
        if (stock <= 0) continue;
        
        var expDate = new Date(item.expiry);
        expDate.setHours(0,0,0,0);
        var diff = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        var status = diff < 0 ? 'expired' : diff <= 30 ? 'warning' : 'good';
        
        if (filter === 'expired' && status !== 'expired') continue;
        if (filter === 'warning' && status !== 'warning') continue;
        if (filter === 'good' && status !== 'good') continue;
        
        rows.push({
            material: materialName,
            company: item.company,
            batch: item.batch || '-',
            stock: stock,
            unit: item.unit,
            expiry: item.expiry,
            status: status,
            days: diff
        });
    }
    
    rows.sort(function(a, b) { return new Date(a.expiry) - new Date(b.expiry); });
    
    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#a0aec0;padding:20px;">No materials with expiry dates</td></tr>';
    } else {
        var html = '';
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var statusBadge = '';
            var daysText = '';
            if (r.status === 'expired') {
                statusBadge = '<span class="badge-expired">🔴 EXPIRED</span>';
                daysText = 'Expired ' + Math.abs(r.days) + ' days ago';
            } else if (r.status === 'warning') {
                statusBadge = '<span class="badge-warning">🟡 Expiring Soon</span>';
                daysText = r.days + ' days left';
            } else {
                statusBadge = '<span class="badge-good">🟢 Safe</span>';
                daysText = r.days + ' days left';
            }
            html += '<tr><td><strong>' + r.material + '</strong></td><td>' + r.company + '</td><td>' + r.batch + '</td><td>' + r.stock + '</td><td>' + r.unit + '</td><td>' + formatDate(r.expiry) + '</td><td>' + statusBadge + '</td><td>' + daysText + '</td></tr>';
        }
        tbody.innerHTML = html;
    }
}

// ============================================
// UPDATE DASHBOARD
// ============================================
function clearDashFilter() {
    document.getElementById('dashStartDate').value = '';
    document.getElementById('dashEndDate').value = '';
    updateDashboard();
}

function updateDashboard() {
    var startDate = document.getElementById('dashStartDate').value;
    var endDate = document.getElementById('dashEndDate').value;
    
    document.getElementById('dashMaterials').textContent = data.materials.length;
    
    var totalReceived = 0;
    var totalIssued = 0;
    var totalCost = 0;
    var activities = [];
    
    for (var i = 0; i < data.incoming.length; i++) {
        var item = data.incoming[i];
        if (isInRange(item.date, startDate, endDate)) {
            totalReceived += item.quantity;
            totalCost += item.total;
            activities.push({
                date: item.date,
                type: '📥 Received',
                material: getMaterialName(item.material_id),
                company: item.company,
                qty: item.quantity,
                unit: item.unit,
                cost: item.total
            });
        }
    }
    for (var i = 0; i < data.outgoing.length; i++) {
        var item = data.outgoing[i];
        if (isInRange(item.date, startDate, endDate)) {
            totalIssued += item.quantity;
            activities.push({
                date: item.date,
                type: '📤 Issued',
                material: getMaterialName(item.material_id),
                company: item.company,
                qty: item.quantity,
                unit: item.unit,
                cost: item.total
            });
        }
    }
    
    document.getElementById('dashReceived').textContent = totalReceived;
    document.getElementById('dashIssued').textContent = totalIssued;
    document.getElementById('dashCost').textContent = formatCurrency(totalCost);
    
    activities.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    
    var tbody = document.getElementById('dashTable');
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#a0aec0;padding:30px;">No activity</td></tr>';
    } else {
        var html = '';
        for (var i = 0; i < Math.min(activities.length, 20); i++) {
            var a = activities[i];
            html += '<tr><td>' + formatDate(a.date) + '</td><td>' + a.type + '</td><td>' + (a.material || '-') + '</td><td>' + a.company + '</td><td>' + a.qty + ' ' + a.unit + '</td><td>' + formatCurrency(a.cost) + '</td></tr>';
        }
        tbody.innerHTML = html;
    }
}

// ============================================
// UPDATE ALL
// ============================================
function updateAll() {
    updateDropdowns();
    updateLists();
    updateIncoming();
    updateOutgoing();
    updateStock();
    updateDashboard();
    updateExpiry();
    toggleExpiry();
    prepareStockReport();
}

// ============================================
// INIT - Check for existing session
// ============================================
(function init() {
    // Check if session exists
    var sessionExists = localStorage.getItem('dentalSession');
    if (sessionExists === 'true') {
        // Auto-login
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appContainer').classList.add('show');
        document.getElementById('userDisplay').textContent = '👤 ' + VALID_USERNAME;
        loadData();
        updateAll();
        toggleExpiry();
        clearSessionTimers();
        startSessionTimer();
        showToast('🔄 Session restored. Welcome back!', 'success');
    } else {
        // Show login page
        document.getElementById('loginPage').style.display = 'block';
        document.getElementById('appContainer').classList.remove('show');
    }
})();

// Auto-save every 5 seconds (only when logged in)
setInterval(function() {
    if (document.getElementById('appContainer').classList.contains('show')) {
        saveData();
    }
}, 5000);

console.log('🦷 Cusp Dental Lab Inventory System loaded!');
console.log('🔐 Login required');
console.log('👤 Username: cusplab0098 / Password: 12345678');
console.log('⏰ Session expires after 12 hours');
console.log('✏️ Change credentials at the top of the script');