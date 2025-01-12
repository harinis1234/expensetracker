document.addEventListener("DOMContentLoaded", () => {
    const transactionForm = document.getElementById("transaction-form");
    const transactionList = document.getElementById("transaction-list");
    const totalIncomeBox = document.getElementById("total-income");
    const totalExpensesBox = document.getElementById("total-expenses");
    const totalBalanceBox = document.getElementById("total-balance");
    let editIndex = -1;
  
    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  
    // Function to calculate totals
    function calculateTotals() {
      let totalIncome = 0;
      let totalExpenses = 0;
  
      transactions.forEach((transaction) => {
        if (transaction.type === "income") {
          totalIncome += transaction.amount;
        } else if (transaction.type === "expense") {
          totalExpenses += transaction.amount;
        }
      });
  
      const totalBalance = totalIncome - totalExpenses;
  
      // Update the UI
      totalIncomeBox.textContent = `$${totalIncome.toFixed(2)}`;
      totalExpensesBox.textContent = `$${totalExpenses.toFixed(2)}`;
      totalBalanceBox.textContent = `$${totalBalance.toFixed(2)}`;
    }
  
    // Function to render transactions
    function renderTransactions() {
      transactionList.innerHTML = "";
      transactions.forEach((transaction, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${transaction.date}</td>
          <td>${transaction.description}</td>
          <td>${transaction.category}</td>
          <td>${transaction.type}</td>
          <td>${transaction.amount}</td>
          <td>
            <button class="edit-btn" data-index="${index}">Edit</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
          </td>
        `;
        transactionList.appendChild(row);
      });
  
      calculateTotals();
      updateChart();
    }
  
    // Add transaction
    document.getElementById("add-transaction").addEventListener("click", () => {
      const type = document.getElementById("type").value;
      const date = document.getElementById("date").value;
      const description = document.getElementById("description").value;
      const category = document.getElementById("category").value;
      const amount = parseFloat(document.getElementById("amount").value);
  
      if (!date || !description || !category || isNaN(amount) || amount <= 0) {
        alert("Please fill out all fields with valid values.");
        return;
      }
  
      const transaction = { type, date, description, category, amount };
  
      if (editIndex === -1) {
        transactions.push(transaction);
      } else {
        transactions[editIndex] = transaction;
        editIndex = -1;
      }
  
      localStorage.setItem("transactions", JSON.stringify(transactions));
      renderTransactions();
      transactionForm.reset();
    });
  
    // Edit/Delete transaction
    transactionList.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
  
      if (e.target.classList.contains("delete-btn")) {
        transactions.splice(index, 1);
        localStorage.setItem("transactions", JSON.stringify(transactions));
        renderTransactions();
      } else if (e.target.classList.contains("edit-btn")) {
        const transaction = transactions[index];
        document.getElementById("type").value = transaction.type;
        document.getElementById("date").value = transaction.date;
        document.getElementById("description").value = transaction.description;
        document.getElementById("category").value = transaction.category;
        document.getElementById("amount").value = transaction.amount;
        editIndex = index;
      }
    });
  
    // Generate chart
    function updateChart() {
      const expenses = transactions.filter((t) => t.type === "expense");
      const categoryTotals = {};
  
      expenses.forEach((expense) => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });
  
      const data = {
        labels: Object.keys(categoryTotals),
        datasets: [{
          label: "Expenses",
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#233d4d", "#fe7f2d", "#fcca46", "#a1c181", "#619b8a"
          ],
        }]
      };
  
      if (window.expenseChart) {
        window.expenseChart.destroy();
      }
  
      window.expenseChart = new Chart(document.getElementById("expense-chart"), {
        type: "pie",
        data: data,
      });
    }
  
    // Initial rendering
    renderTransactions();
  });
  