// Global Variables
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let totalIncome = 0; // Set initial total income to zero

// Function to update total income display
function updateTotalIncome() {
    document.getElementById('total-income').innerText = `₹${totalIncome}`;
}

// Function to calculate and update total expenses
function updateTotalExpenses() {
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    document.getElementById('total-expenses').innerText = `₹${totalExpenses}`;
}

// Function to update charts
function updateCharts() {
    const expenseCategories = {};
    expenses.forEach(expense => {
        expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + expense.amount;
    });

    const expenseLabels = Object.keys(expenseCategories);
    const expenseData = Object.values(expenseCategories);

    const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');
    if (window.expenseChart) {
        window.expenseChart.destroy();
    }
    window.expenseChart = new Chart(expenseChartCtx, {
        type: 'pie',
        data: {
            labels: expenseLabels,
            datasets: [{
                label: 'Expense Distribution',
                data: expenseData,
                backgroundColor: expenseLabels.map(() => '#' + Math.floor(Math.random() * 16777215).toString(16)),
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Expense Distribution by Category'
                }
            }
        }
    });

    const incomeChartCtx = document.getElementById('income-chart').getContext('2d');
    if (window.incomeChart) {
        window.incomeChart.destroy();
    }
    window.incomeChart = new Chart(incomeChartCtx, {
        type: 'bar',
        data: {
            labels: ['Total Income'],
            datasets: [{
                label: 'Income',
                data: [totalIncome],
                backgroundColor: '#36a2eb',
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Total Income'
                }
            }
        }
    });
}

// Function to render expenses in the table
function renderExpenses() {
    const expensesBody = document.getElementById('expenses-body');
    expensesBody.innerHTML = '';
    expenses.forEach((expense, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.category}</td>
            <td>₹${expense.amount}</td>
            <td>${expense.description || 'N/A'}</td>
            <td>
                <button onclick="editExpense(${index})">Edit</button>
                <button class="delete" onclick="deleteExpense(${index})">Delete</button>
            </td>
        `;
        expensesBody.appendChild(row);
    });
}

// Function to add expense
document.getElementById('add-expense-btn').addEventListener('click', () => {
    const category = document.getElementById('expense-category').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const description = document.getElementById('expense-description').value;

    if (category && amount && date) {
        expenses.push({ category, amount, date, description });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        document.getElementById('expense-category').value = '';
        document.getElementById('expense-amount').value = '';
        document.getElementById('expense-description').value = '';
        document.getElementById('expense-date').value = '';
        renderExpenses();
        updateCharts();
        updateTotalExpenses(); // Update total expenses here
        hideErrorMessage();
    } else {
        showErrorMessage('Please fill in all required fields.');
    }
});


// Function to edit expense
function editExpense(index) {
    const expense = expenses[index];
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-description').value = expense.description;
    document.getElementById('expense-date').value = expense.date;
    deleteExpense(index);
}

// Function to delete expense
function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    updateCharts();
    updateTotalExpenses(); // Update total expenses here
}


// Function to add income
document.getElementById('add-income-btn').addEventListener('click', () => {
    const incomeAmount = parseFloat(document.getElementById('income-amount').value);
    const incomeDescription = document.getElementById('income-description').value;

    if (incomeAmount) {
        totalIncome += incomeAmount;
        localStorage.setItem('totalIncome', JSON.stringify(totalIncome));
        document.getElementById('income-amount').value = '';
        document.getElementById('income-description').value = '';
        updateTotalIncome();
        updateCharts();
        hideErrorMessage();
    } else {
        showErrorMessage('Please fill in the required income amount.');
    }
});

// Function to reset income and expenses
function resetBudget() {
    expenses = [];
    totalIncome = 0;
    localStorage.removeItem('expenses');
    localStorage.removeItem('totalIncome');
    updateTotalIncome();
    renderExpenses();
    updateCharts();
}

// Function to show error message
function showErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.innerText = message;
    errorMessageElement.style.display = 'block';
}

// Function to hide error message
function hideErrorMessage() {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.style.display = 'none';
}

// Event listener for reset button
document.getElementById('reset-btn').addEventListener('click', resetBudget);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const storedIncome = JSON.parse(localStorage.getItem('totalIncome'));
    if (storedIncome) {
        totalIncome = storedIncome;
        updateTotalIncome();
    }
    renderExpenses();
    updateCharts();
    updateTotalExpenses(); // Update total expenses on load
});


// Function to validate only required input fields (Amount, Category, and Date)
function validateFields() {
    const expenseCategory = document.getElementById('expense-category').value.trim();
    const expenseAmount = document.getElementById('expense-amount').value.trim();
    const expenseDate = document.getElementById('expense-date').value.trim();

    let missingFields = [];

    // Check required fields for expenses
    if (!expenseCategory) {
        missingFields.push("Expense Category");
    }
    if (!expenseAmount) {
        missingFields.push("Expense Amount");
    }
    if (!expenseDate) {
        missingFields.push("Expense Date");
    }

    const errorMessageDiv = document.getElementById('error-message');
    if (missingFields.length > 0) {
        errorMessageDiv.innerText = "Please fill in the following required fields: " + missingFields.join(", ");
        errorMessageDiv.style.display = 'block'; // Show error message if validation failed
        return false; // Validation failed
    } else {
        errorMessageDiv.style.display = 'none'; // Hide error message if validation passed
    }

    return true; // Validation passed
}

// Add event listeners to fields to check for validity as the user types
document.getElementById('expense-category').addEventListener('input', hideErrorOnInput);
document.getElementById('expense-amount').addEventListener('input', hideErrorOnInput);
document.getElementById('expense-date').addEventListener('input', hideErrorOnInput);

// Function to hide error messages dynamically when fields are filled
function hideErrorOnInput() {
    validateFields();
}

// Example button click event to validate fields before adding expense
document.getElementById('add-expense-btn').addEventListener('click', function() {
    if (validateFields()) {
        // Proceed with adding expense if validation passes
        const category = document.getElementById('expense-category').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const date = document.getElementById('expense-date').value;
        const description = document.getElementById('expense-description').value; // Optional

        expenses.push({ category, amount, date, description });
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // Clear the input fields
        document.getElementById('expense-category').value = '';
        document.getElementById('expense-amount').value = '';
        document.getElementById('expense-date').value = '';
        document.getElementById('expense-description').value = '';

        renderExpenses();
        updateCharts();
    }
});
