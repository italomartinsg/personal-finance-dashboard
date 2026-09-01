const form = document.querySelector("form");
const inputDescription = document.querySelector("#descricao");
const inputValue = document.querySelector("#valor");
const transactionTypeSelect = document.querySelector("#tipo-transacao");
const transactionCategorySelect = document.querySelector(
  "#categoria-transacao",
);
const inputDate = document.querySelector("#data");
const categoriesByType = {
  receita: ["Salário", "Freelance", "Investimentos"],
  despesa: ["Moradia", "Alimentação", "Lazer", "Transporte"],
};
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
let totalExpense = 0;
let totalRevenue = 0;
let totalBalance = totalRevenue - totalExpense;
const transactionList = document.querySelector(".transacao-lista");
const valueRevenue = document.querySelector(".valor-receita");
const valueExpense = document.querySelector(".valor-despesa");
const valueBalance = document.querySelector(".valor-total");

const transactions = [
  {
    id: 1,
    description: "Mercado",
    value: 100,
    type: "receita",
    category: "Salário",
    date: "2026-08-23",
  },
  {
    id: 2,
    description: "Shopping",
    value: 253.94,
    type: "despesa",
    category: "Lazer",
    date: "2026-07-02",
  },
  {
    id: 3,
    description: "Cinema",
    value: 100,
    type: "despesa",
    category: "Lazer",
    date: "2026-07-02",
  },
  {
    id: 4,
    description: "Bet365",
    value: 230,
    type: "receita",
    category: "Investimentos",
    date: "2026-07-02",
  },
];

function idGenerator() {
  const highestID = transactions.reduce((accumulator, currentValue) => {
    if (accumulator < currentValue.id) {
      accumulator = currentValue.id;
    }

    return accumulator;
  }, 0);
  return highestID + 1;
}

function updateCategories() {
  const transactionValues = categoriesByType[transactionTypeSelect.value];

  transactionCategorySelect.textContent = "";

  transactionValues.forEach((type) => {
    const newOption = document.createElement("option");

    newOption.value = type;
    newOption.textContent = type;

    transactionCategorySelect.appendChild(newOption);
  });
}
function calculateFinancialSummary() {
  const expense = transactions.filter(
    (transaction) => transaction.type === "despesa",
  );
  const revenue = transactions.filter(
    (transaction) => transaction.type === "receita",
  );
  totalRevenue = revenue.reduce((accumulator, currentValue) => {
    accumulator += currentValue.value;
    return accumulator;
  }, 0);
  totalExpense = expense.reduce((accumulator, currentValue) => {
    accumulator += currentValue.value;
    return accumulator;
  }, 0);
  totalBalance = +(totalRevenue - totalExpense).toFixed(2);
}
function updateFinancialSummary() {
  valueRevenue.textContent = currencyFormatter.format(totalRevenue);
  valueExpense.textContent = currencyFormatter.format(totalExpense);
  valueBalance.textContent = currencyFormatter.format(totalBalance);
}

function showHistory() {
  transactionList.textContent = "";
  transactions.forEach((transaction) => {
    const newLi = document.createElement("li");
    const cleanDate = transaction.date.split("-");
    newLi.textContent = `${transaction.description} ${currencyFormatter.format(transaction.value)} ${transaction.category} ${cleanDate[2]}/${cleanDate[1]}/${cleanDate[0]} `;
    if (transaction.type === "receita") {
      newLi.classList.add("receita");
    } else {
      newLi.classList.add("despesa");
    }
    transactionList.appendChild(newLi);
  });
}

function getTransactions(event) {
  event.preventDefault();
  const description = inputDescription.value.trim();
  const value = +inputValue.value;
  const type = transactionTypeSelect.value;
  const category = transactionCategorySelect.value;
  const date = inputDate.value;

  if (description && value > 0 && type && category && date) {
    const transaction = {
      id: idGenerator(),
      description,
      value,
      type,
      category,
      date,
    };
    transactions.push(transaction);
    inputDescription.value = "";
    inputValue.value = "";
    inputDate.value = "";
    showHistory();
    calculateFinancialSummary();
    updateFinancialSummary();
  }
}
transactionTypeSelect.addEventListener("change", updateCategories);
form.addEventListener("submit", getTransactions);
updateCategories();
showHistory();
calculateFinancialSummary();
updateFinancialSummary();
