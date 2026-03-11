const students = [
    { id: 1, name: 'Lucas Silva', initial: 'LS' },
    { id: 2, name: 'Ana Oliveira', initial: 'AO' },
    { id: 3, name: 'Pedro Santos', initial: 'PS' },
    { id: 4, name: 'Julia Costa', initial: 'JC' },
    { id: 5, name: 'Enzo Rodrigues', initial: 'ER' }
];

const products = [
    { id: 101, name: 'Suco Natural', price: 7.50 },
    { id: 102, name: 'Salgado Assado', price: 8.00 },
    { id: 103, name: 'Fruta Picada', price: 4.50 },
    { id: 104, name: 'Sanduíche Natural', price: 12.00 },
    { id: 105, name: 'Iogurte', price: 5.50 }
];

let selectedStudent = null;
let currentCart = [];
let todayTotal = 0;
let salesHistory = [
    { time: '10:15', student: 'Ana Oliveira', items: 'Suco Natural, Salgado', total: 15.50 },
    { time: '10:20', student: 'Pedro Santos', items: 'Iogurte, Fruta', total: 10.00 }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderStudents();
    renderProducts();
    renderHistory();
});

function renderStudents() {
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    students.forEach(student => {
        const div = document.createElement('div');
        div.className = 'student-item';
        div.innerHTML = `
            <div class="avatar">${student.initial}</div>
            <span style="font-size: 0.75rem">${student.name.split(' ')[0]}</span>
        `;
        div.onclick = () => selectStudent(student, div);
        list.appendChild(div);
    });
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.5rem">${product.name}</div>
            <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
        `;
        div.onclick = () => addToCart(product);
        grid.appendChild(div);
    });
}

function renderHistory() {
    const tbody = document.getElementById('sales-history-body');
    if (!tbody) return;
    tbody.innerHTML = salesHistory.map(sale => `
        <tr>
            <td>${sale.time}</td>
            <td>${sale.student}</td>
            <td>${sale.items}</td>
            <td>R$ ${sale.total.toFixed(2).replace('.', ',')}</td>
            <td><span class="badge badge-success">Registrado</span></td>
        </tr>
    `).reverse().join('');
}

function selectStudent(student, element) {
    document.querySelectorAll('.student-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    selectedStudent = student;
    document.getElementById('active-student-name').textContent = student.name;
}

function addToCart(product) {
    if (!selectedStudent) {
        alert('Por favor, selecione um aluno primeiro!');
        return;
    }
    currentCart.push(product);
    updateCartDisplay();
}

function updateCartDisplay() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    if (currentCart.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">Nenhum item selecionado</p>';
        totalEl.textContent = 'R$ 0,00';
        return;
    }

    container.innerHTML = currentCart.map((item, index) => `
        <div class="cart-item">
            <span>${item.name}</span>
            <span>R$ ${item.price.toFixed(2).replace('.', ',')}</span>
        </div>
    `).join('');

    const total = currentCart.reduce((sum, item) => sum + item.price, 0);
    totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

document.getElementById('confirm-purchase').onclick = () => {
    if (!selectedStudent || currentCart.length === 0) {
        alert('Selecione um aluno e produtos para confirmar.');
        return;
    }

    const total = currentCart.reduce((sum, item) => sum + item.price, 0);
    todayTotal += total;
    document.getElementById('total-vendas-hoje').textContent = `R$ ${todayTotal.toFixed(2).replace('.', ',')}`;

    // Add to history
    const now = new Date();
    salesHistory.push({
        time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
        student: selectedStudent.name,
        items: currentCart.map(i => i.name).join(', '),
        total: total
    });
    renderHistory();

    // Clear cart and selection
    currentCart = [];
    selectedStudent = null;
    updateCartDisplay();
    renderStudents();
    document.getElementById('active-student-name').textContent = 'Selecione um Aluno';

    showNotification('Venda registrada no extrato do aluno!');
};

document.getElementById('send-invoices').onclick = () => {
    showNotification('Enviando faturas para os pais... 📤');
    setTimeout(() => {
        showNotification('Todas as faturas foram enviadas via WhatsApp/E-mail!');
    }, 2000);
};

function showNotification(msg) {
    const toast = document.getElementById('notification');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
