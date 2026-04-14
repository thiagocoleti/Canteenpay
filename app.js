/**
 * Cantina Digital - Core Logic
 */

// --- State Management ---
// Fallback for when localStorage is not available (common in some file:// environments)
const storage = {
    getItem: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage.getItem failed:', e);
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('localStorage.setItem failed:', e);
        }
    }
};

const getInitialState = () => {
    let students, sellers, products, orders, payments;
    
    try {
        students = JSON.parse(storage.getItem('students'));
        sellers = JSON.parse(storage.getItem('sellers'));
        products = JSON.parse(storage.getItem('products'));
        orders = JSON.parse(storage.getItem('orders'));
        payments = JSON.parse(storage.getItem('payments'));
    } catch (e) {
        console.error('Error parsing localStorage data:', e);
    }

    // Default mock data if nothing is found
    if (!students || students.length === 0) {
        return {
            students: [
                { id: '1', name: 'João Silva', grade: '5º Ano A', parentName: 'Maria Silva', parentPhone: '(11) 98888-7777', date: new Date().toISOString() },
                { id: '2', name: 'Ana Oliveira', grade: '6º Ano C', parentName: 'Pedro Oliveira', parentPhone: '(11) 97777-6666', date: new Date().toISOString() }
            ],
            sellers: [
                { id: '1', name: 'Carlos (Cantina Principal)', phone: '(11) 95555-4444', date: new Date().toISOString() }
            ],
            products: [
                { id: '1', name: 'Salgado Assado', price: 6.50, stock: 50, date: new Date().toISOString() },
                { id: '2', name: 'Suco Natural', price: 5.00, stock: 30, date: new Date().toISOString() },
                { id: '3', name: 'Fruta da Estação', price: 3.50, stock: 20, date: new Date().toISOString() }
            ],
            orders: orders || [],
            payments: payments || [],
            currentSection: 'dashboard'
        };
    }

    return {
        students: students,
        sellers: sellers || [],
        products: products || [],
        orders: orders || [],
        payments: payments || [],
        currentSection: 'dashboard'
    };
};

const state = getInitialState();

const saveState = () => {
    storage.setItem('students', JSON.stringify(state.students));
    storage.setItem('sellers', JSON.stringify(state.sellers));
    storage.setItem('products', JSON.stringify(state.products));
    storage.setItem('orders', JSON.stringify(state.orders));
    storage.setItem('payments', JSON.stringify(state.payments));
};

// Initial save of mock data if needed
if (!storage.getItem('students')) saveState();

// --- UI Helpers ---
const getEl = (id) => document.getElementById(id);

// --- Navigation ---
window.switchSection = (sectionId) => {
    state.currentSection = sectionId;
    
    // Update Sidebar
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => {
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update Title
    const titles = {
        dashboard: 'Dashboard',
        students: 'Gestão de Alunos',
        sellers: 'Gestão de Vendedores',
        products: 'Gestão de Produtos',
        orders: 'Registro de Pedidos',
        payments: 'Controle de Pagamentos'
    };
    const titleEl = getEl('section-title');
    if (titleEl) titleEl.innerText = titles[sectionId];

    renderSectionContent(sectionId);
};

// --- Modal Logic ---
window.openModal = (title, bodyHtml) => {
    const modalTitle = getEl('modal-title');
    const modalBody = getEl('modal-body');
    const modalContainer = getEl('modal-container');
    
    if (modalTitle) modalTitle.innerText = title;
    if (modalBody) modalBody.innerHTML = bodyHtml;
    if (modalContainer) modalContainer.classList.remove('hidden');
};

window.closeModal = () => {
    const modalContainer = getEl('modal-container');
    const modalBody = getEl('modal-body');
    if (modalContainer) modalContainer.classList.add('hidden');
    if (modalBody) modalBody.innerHTML = '';
};

// --- Rendering Logic ---
const renderSectionContent = (sectionId) => {
    console.log('Rendering section:', sectionId);
    if (sectionId === 'dashboard') {
        renderDashboard();
    } else {
        renderEntitySection(sectionId);
    }
};

const renderDashboard = () => {
    const totalSales = state.orders.reduce((acc, order) => {
        const product = state.products.find(p => p.id === order.productId);
        return acc + (product ? product.price : 0);
    }, 0);

    const contentArea = getEl('content-area');
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total de Alunos</h3>
                <p>${state.students.length}</p>
            </div>
            <div class="stat-card">
                <h3>Vendas Totais</h3>
                <p>R$ ${totalSales.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="stat-card">
                <h3>Total de Pedidos</h3>
                <p>${state.orders.length}</p>
            </div>
        </div>
        
        <div class="recent-activity" style="margin-top: 2rem;">
            <h3>Atividade Recente</h3>
            <div class="table-container" style="margin-top: 1rem;">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Aluno</th>
                            <th>Produto</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.orders.slice(-5).reverse().map(order => {
                            const student = state.students.find(s => s.id === order.studentId);
                            const product = state.products.find(p => p.id === order.productId);
                            return `
                                <tr>
                                    <td>${new Date(order.date).toLocaleDateString()}</td>
                                    <td>${student ? student.name : 'N/A'}</td>
                                    <td>${product ? product.name : 'N/A'}</td>
                                    <td>R$ ${product ? product.price.toFixed(2).replace('.', ',') : '0,00'}</td>
                                </tr>
                            `;
                        }).join('')}
                        ${state.orders.length === 0 ? '<tr><td colspan="4" style="text-align: center;">Nenhum pedido registrado.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

const renderEntitySection = (entityType) => {
    const configs = {
        students: {
            title: 'Alunos',
            headers: ['Nome', 'Turma', 'Responsável', 'Telefone'],
            btnText: 'Novo Aluno',
            getData: () => state.students,
            rowTemplate: (item) => `
                <td>${item.name}</td>
                <td>${item.grade}</td>
                <td>${item.parentName}</td>
                <td>${item.parentPhone}</td>
            `
        },
        sellers: {
            title: 'Vendedores',
            headers: ['Nome', 'Telefone'],
            btnText: 'Novo Vendedor',
            getData: () => state.sellers,
            rowTemplate: (item) => `
                <td>${item.name}</td>
                <td>${item.phone}</td>
            `
        },
        products: {
            title: 'Produtos',
            headers: ['Nome', 'Preço', 'Quantidade'],
            btnText: 'Novo Produto',
            getData: () => state.products,
            rowTemplate: (item) => `
                <td>${item.name}</td>
                <td>R$ ${item.price.toFixed(2).replace('.', ',')}</td>
                <td>${item.stock}</td>
            `
        },
        orders: {
            title: 'Pedidos',
            headers: ['Data', 'Aluno', 'Vendedor', 'Produto', 'Total'],
            btnText: 'Novo Pedido',
            getData: () => state.orders,
            rowTemplate: (item) => {
                const student = state.students.find(s => s.id === item.studentId);
                const seller = state.sellers.find(s => s.id === item.sellerId);
                const product = state.products.find(p => p.id === item.productId);
                return `
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${student ? student.name : 'Removido'}</td>
                    <td>${seller ? seller.name : 'Removido'}</td>
                    <td>${product ? product.name : 'Removido'}</td>
                    <td>R$ ${product ? product.price.toFixed(2).replace('.', ',') : '0,00'}</td>
                `;
            }
        },
        payments: {
            title: 'Pagamentos',
            headers: ['Data', 'Aluno', 'Valor'],
            btnText: 'Registrar Pagamento',
            getData: () => state.payments,
            rowTemplate: (item) => {
                const student = state.students.find(s => s.id === item.studentId);
                return `
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${student ? student.name : 'Removido'}</td>
                    <td>R$ ${item.amount.toFixed(2).replace('.', ',')}</td>
                `;
            }
        }
    };

    const config = configs[entityType];
    const contentArea = getEl('content-area');
    if (!contentArea) return;
    
    contentArea.innerHTML = `
        <div class="section-header">
            <h3>Lista de ${config.title}</h3>
            <div class="actions">
                ${entityType === 'payments' ? '<button class="btn-secondary" onclick="notifyAllParents()" style="margin-right: 1rem;">🔔 Notificar Responsáveis</button>' : ''}
                <button class="btn-primary" onclick="showCreateForm('${entityType}')">➕ ${config.btnText}</button>
            </div>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        ${config.headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${config.getData().length > 0 
                        ? config.getData().map(item => `<tr>${config.rowTemplate(item)}</tr>`).join('')
                        : `<tr><td colspan="${config.headers.length}" style="text-align: center;">Nenhum registro encontrado.</td></tr>`
                    }
                </tbody>
            </table>
        </div>
    `;
};

// --- Form Handling ---
window.showCreateForm = (entityType) => {
    let formHtml = '';
    let title = '';

    if (entityType === 'students') {
        title = 'Cadastrar Aluno';
        formHtml = `
            <form id="entity-form">
                <div class="form-group">
                    <label>Nome do Aluno</label>
                    <input type="text" id="name" required placeholder="Ex: João Silva">
                </div>
                <div class="form-group">
                    <label>Turma</label>
                    <input type="text" id="grade" required placeholder="Ex: 5º Ano A">
                </div>
                <div class="form-group">
                    <label>Nome do Responsável</label>
                    <input type="text" id="parentName" required placeholder="Ex: Maria Silva">
                </div>
                <div class="form-group">
                    <label>Telefone do Responsável</label>
                    <input type="tel" id="parentPhone" required placeholder="(11) 99999-9999">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Salvar</button>
                </div>
            </form>
        `;
    } else if (entityType === 'sellers') {
        title = 'Cadastrar Vendedor';
        formHtml = `
            <form id="entity-form">
                <div class="form-group">
                    <label>Nome do Vendedor</label>
                    <input type="text" id="name" required>
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="tel" id="phone" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Salvar</button>
                </div>
            </form>
        `;
    } else if (entityType === 'products') {
        title = 'Cadastrar Produto';
        formHtml = `
            <form id="entity-form">
                <div class="form-group">
                    <label>Nome do Produto</label>
                    <input type="text" id="name" required>
                </div>
                <div class="form-group">
                    <label>Preço (R$)</label>
                    <input type="number" step="0.01" id="price" required>
                </div>
                <div class="form-group">
                    <label>Estoque Inicial</label>
                    <input type="number" id="stock" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Salvar</button>
                </div>
            </form>
        `;
    } else if (entityType === 'orders') {
        title = 'Novo Pedido';
        formHtml = `
            <form id="entity-form">
                <div class="form-group">
                    <label>Aluno</label>
                    <select id="studentId" required>
                        <option value="">Selecione um aluno</option>
                        ${state.students.map(s => `<option value="${s.id}">${s.name} (${s.grade})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Vendedor</label>
                    <select id="sellerId" required>
                        <option value="">Selecione um vendedor</option>
                        ${state.sellers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Produto</label>
                    <select id="productId" required>
                        <option value="">Selecione um produto</option>
                        ${state.products.map(p => `<option value="${p.id}">${p.name} - R$ ${p.price.toFixed(2).replace('.', ',')}</option>`).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Registrar</button>
                </div>
            </form>
        `;
    } else if (entityType === 'payments') {
        title = 'Registrar Pagamento';
        formHtml = `
            <form id="entity-form">
                <div class="form-group">
                    <label>Aluno</label>
                    <select id="studentId" required>
                        <option value="">Selecione um aluno</option>
                        ${state.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Valor (R$)</label>
                    <input type="number" step="0.01" id="amount" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal()">Cancelar</button>
                    <button type="submit" class="btn-primary">Registrar</button>
                </div>
            </form>
        `;
    }

    openModal(title, formHtml);

    const form = getEl('entity-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEntity(entityType);
        });
    }
};

const saveEntity = (entityType) => {
    const data = {};
    const inputs = document.querySelectorAll('#entity-form input, #entity-form select');
    inputs.forEach(input => {
        if (input.type === 'number') {
            data[input.id] = parseFloat(input.value);
        } else {
            data[input.id] = input.value;
        }
    });

    data.id = Date.now().toString();
    data.date = new Date().toISOString();

    state[entityType].push(data);
    saveState();
    closeModal();
    renderSectionContent(entityType);
    showNotification('Registro salvo com sucesso!');
};

// --- Notifications ---
window.showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `<span>✅</span> <span>${message}</span>`;
    
    let container = document.querySelector('.notification-area');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-area';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

window.notifyAllParents = () => {
    if (state.students.length === 0) {
        showNotification('Nenhum aluno cadastrado para notificar.');
        return;
    }
    
    showNotification(`Notificações enviadas para ${state.students.length} responsáveis.`);
    console.log('Sending monthly notifications to parents...');
    state.students.forEach(student => {
        const studentOrders = state.orders.filter(o => o.studentId === student.id);
        const total = studentOrders.reduce((acc, order) => {
            const product = state.products.find(p => p.id === order.productId);
            return acc + (product ? product.price : 0);
        }, 0);
        
        console.log(`To: ${student.parentPhone} (${student.parentName}) - Student: ${student.name} - Total to Pay: R$ ${total.toFixed(2)}`);
    });
};

// --- Initialization ---
const initApp = () => {
    console.log('Initializing Cantina App...');
    const dateEl = getEl('current-date');
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString('pt-BR', { dateStyle: 'long' });
    
    // Attach sidebar event listeners
    const navItems = document.querySelectorAll('.sidebar-nav li');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            console.log('Nav item clicked:', item.dataset.section);
            e.preventDefault();
            switchSection(item.dataset.section);
        });
    });

    // Initial switch
    switchSection('dashboard');
};

// Run as soon as possible, but ensure DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
