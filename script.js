// Retrieve transactions from localStorage or initialize an empty array if there are none
const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Formatter for currency display
const formatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  signDisplay: "always",
});

// DOM elements
const list = document.getElementById("transactionList");
const form = document.getElementById("form");
const sta = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const button = document.getElementById("button");

// Event listener for form submission
form.addEventListener("submit", addTransaction);

// Function to update total income, expense, and balance
function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);
  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);
  const balanceTotal = incomeTotal - expenseTotal;

  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
  balance.textContent = formatter.format(balanceTotal);
}

// Function to render the transaction list
const renderList = () => {
  list.innerHTML = "";

  if (transactions.length === 0) {
    sta.textContent = "No transactions.";
    return;
  } else {
    sta.textContent = "";
  }

  transactions.forEach(({ id, name, amount, date, type }) => {
    const li = document.createElement("Li");
    const sign = "income" === type ? 1 : -1;

    li.innerHTML = `
      <div class="name">
          <h4>${name}</h4>
          <p>${new Date(date).toLocaleDateString()}</p>
      </div>

      <div class="amount ${type}">
          <span>${formatter.format(amount * sign)}</span>
      </div>

      <div class="action update">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" onclick="updateTransition(${id})">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
      </div>

      <div class="action delete">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" onclick="deleteTransition(${id})">
              <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
      </div>
    `;

    list.appendChild(li);
  });
};

// Initial update of totals and rendering of list
updateTotal();
renderList();

// Function to delete a transaction
function deleteTransition(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  transactions.splice(index, 1);

  updateTotal();
  saveTransactions();
  renderList();
}

// Function to update a transaction
function updateTransition(id) {
  const transaction = transactions.find((trx) => trx.id === id);

  // Populate form fields with transaction data
  form.id.value = transaction.id;
  form.name.value = transaction.name;
  form.amount.value = transaction.amount;
  form.date.valueAsDate = new Date(transaction.date);
  form.type.checked = transaction.type === "income";
  button.innerHTML = "Update";

  // Remove the previous event listener for form submission
  form.removeEventListener("submit", addTransaction);

  // Add an event listener for form submission to update the transaction
  form.addEventListener("submit", function update(e) {
    e.preventDefault();

    const formData = new FormData(this);

    const updatedTransaction = {
      id: transaction.id,
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount")),
      date: new Date(formData.get("date")),
      type: "on" === formData.get("type") ? "income" : "expense",
    };

    const index = transactions.findIndex((trx) => trx.id === transaction.id);
    transactions[index] = updatedTransaction;
    form.reset();
    updateTotal();
    saveTransactions();
    renderList();

    button.innerHTML = "Add";

    // Remove the update event listener
    form.removeEventListener("submit", update);
    // Add the addTransaction event listener back
    form.addEventListener("submit", addTransaction);
  });
}

// Function to add a new transaction
function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);
  const existingTransaction = transactions.find(
    (trx) => trx.id === parseInt(formData.get("id"))
  );

  if (!existingTransaction) {
    transactions.push({
      id: transactions.length + 1,
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount")),
      date: new Date(formData.get("date")),
      type: "on" === formData.get("type") ? "income" : "expense",
    });

    this.reset();

    updateTotal();
    saveTransactions();
    renderList();
  }
}

// Function to save transactions to localStorage
function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  localStorage.setItem("transactions", JSON.stringify(transactions));
}
