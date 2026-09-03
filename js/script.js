const form = document.querySelector("form");
const inputDescription = document.querySelector("#descricao");
const inputValue = document.querySelector("#valor");
const transactionTypeSelect = document.querySelector("#tipo-transacao");
const transactionCategorySelect = document.querySelector(
  "#categoria-transacao",
);
const errorMessage = document.querySelector(".error-mensagem");
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

const filterTypeSelect = document.querySelector("#filtro-tipo-transacao");
const filterCategorySelect = document.querySelector(
  "#filtro-categoria-transacao",
);

const filterDate = document.querySelector("#filtro-data");
const btnClearFilters = document.querySelector(".limpar-filtros");

const allCategories = [
  "todos",
  ...categoriesByType["receita"],
  ...categoriesByType["despesa"],
];

const transactions = [];

const financialChart = document.querySelector("#financial-chart");

const expensesCategoryChart = document.querySelector(
  "#expenses-category-chart",
);

const revenuesCategoryChart = document.querySelector(
  "#revenues-category-chart",
);

let chart;
let categoryChart;
let revenueCategoryChart;

function idGenerator() {
  const highestID = transactions.reduce((accumulator, currentValue) => {
    if (accumulator < currentValue.id) {
      accumulator = currentValue.id;
    }

    return accumulator;
  }, 0);

  return highestID + 1;
}

function getCategories(event) {
  if (event.target.name === "tipo-transacao") {
    updateCategories(
      categoriesByType[transactionTypeSelect.value],
      transactionCategorySelect,
    );
  } else if (event.target.name === "filtro-tipo-transacao") {
    if (filterTypeSelect.value === "todos") {
      updateCategories(allCategories, filterCategorySelect);
      filterTransactions();
    } else {
      updateCategories(
        ["todos", ...categoriesByType[filterTypeSelect.value]],
        filterCategorySelect,
      );

      filterTransactions();
    }
  }
}

function updateCategories(transactionValues, categorySelect) {
  categorySelect.textContent = "";

  transactionValues.forEach((type) => {
    const newOption = document.createElement("option");

    newOption.value = type;
    newOption.textContent = type.charAt(0).toUpperCase() + type.slice(1);

    categorySelect.appendChild(newOption);
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

function saveTransactions() {
  const transactionString = JSON.stringify(transactions);

  localStorage.setItem("transactions", transactionString);
}

function loadTransactions() {
  const storagedTransactions = localStorage.getItem("transactions");

  if (!storagedTransactions) {
    return;
  } else {
    const storagedObj = JSON.parse(storagedTransactions);

    transactions.push(...storagedObj);
  }
}

function filterTransactions() {
  let filteredTransactions = transactions;

  if (filterTypeSelect.value !== "todos") {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.type === filterTypeSelect.value,
    );
  }

  if (filterCategorySelect.value !== "todos") {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.category === filterCategorySelect.value,
    );
  }

  if (filterDate.value) {
    filteredTransactions = filteredTransactions.filter(
      (transaction) => transaction.date === filterDate.value,
    );
  }

  showHistory(filteredTransactions);
}

function clearFilters() {
  filterTypeSelect.value = "todos";
  filterDate.value = "";

  updateCategories(allCategories, filterCategorySelect);

  filterTransactions();
}

function showHistory(transactionsToShow) {
  transactionList.textContent = "";

  transactionsToShow.forEach((transaction) => {
    const newLi = document.createElement("li");
    const newButton = document.createElement("button");
    const cleanDate = transaction.date.split("-");

    newLi.dataset.id = transaction.id;

    Object.entries(transaction).forEach(([key, value]) => {
      let newSpan = document.createElement("span");
      switch (key) {
        case "description":
          newSpan.textContent = value;
          newSpan.classList.add("transacao-descricao");
          newLi.appendChild(newSpan);
          break;
        case "value":
          newSpan.textContent = currencyFormatter.format(value);
          newSpan.classList.add("transacao-valor");
          newLi.appendChild(newSpan);
          break;
        case "category":
          newSpan.textContent = value;
          newSpan.classList.add("transacao-categoria");
          newLi.appendChild(newSpan);
          break;
        case "date":
          newSpan.textContent = `${cleanDate[2]}/${cleanDate[1]}/${cleanDate[0]}`;
          newSpan.classList.add("transacao-data");
          newLi.appendChild(newSpan);
          break;

        default:
      }
    });
    newButton.textContent = "Excluir";
    newButton.setAttribute("data-confirm", "false");
    newButton.classList.add("btn-excluir");
    newLi.appendChild(newButton);

    if (transaction.type === "receita") {
      newLi.classList.add("receita");
    } else {
      newLi.classList.add("despesa");
    }

    transactionList.appendChild(newLi);
  });
}

function removeTransaction(event) {
  if (event.target.tagName === "BUTTON") {
    const btnRemoveClicked = document.querySelector('[data-confirm="true"]');

    if (event.target.dataset.confirm === "true") {
      const searchIndex = transactions.findIndex(
        (transaction) =>
          transaction.id === +event.target.parentElement.dataset.id,
      );

      if (searchIndex === -1) {
        return;
      }

      transactions.splice(searchIndex, 1);

      saveTransactions();
      calculateFinancialSummary();
      updateFinancialSummary();
      updateChart();
      updateCategoryChart();
      updateRevenueCategoryChart();
      filterTransactions();

      return;
    }

    if (event.target.dataset.confirm === "false") {
      if (btnRemoveClicked) {
        btnRemoveClicked.dataset.confirm = "false";
        btnRemoveClicked.textContent = "Excluir";
      }
      event.target.textContent = "Confirmar?";
      event.target.dataset.confirm = "true";
    }
  } else {
    const btnRemoveClicked = document.querySelector('[data-confirm="true"]');

    if (btnRemoveClicked) {
      btnRemoveClicked.dataset.confirm = "false";
      btnRemoveClicked.textContent = "Excluir";
    }
  }
}

function getTransactions(event) {
  event.preventDefault();
  errorMessage.style.display = "none";
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

    filterTransactions();
    calculateFinancialSummary();
    updateFinancialSummary();
    updateChart();
    updateCategoryChart();
    updateRevenueCategoryChart();
    saveTransactions();
  } else {
    errorMessage.style.display = "block";
  }
}

function getChartData(revenue, expense) {
  const financialData = {
    revenue,
    expense,
  };

  return financialData;
}

function createChart() {
  const financialData = getChartData(totalRevenue, totalExpense);

  const labels = ["Receitas", "Despesas"];

  const values = [financialData.revenue, financialData.expense];

  chart = new Chart(financialChart, {
    type: "pie",

    data: {
      labels: labels,

      datasets: [
        {
          label: "Resumo financeiro",
          data: values,
          backgroundColor: [
            "rgba(46, 204, 113, 1.0)",
            "rgba(231, 76, 80, 1.0)",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              size: 11,
            },
          },
        },
      },
    },
  });
}
function createRevenueCategoryChart() {
  const categoryData = getRevenuesByCategory();

  revenueCategoryChart = new Chart(revenuesCategoryChart, {
    type: "pie",

    data: {
      labels: categoryData.labels,

      datasets: [
        {
          label: "Receitas por categoria",
          data: categoryData.values,
          backgroundColor: ["#2563eb", "#16a34a", "#f59e0b"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              size: 11,
            },
          },
        },
      },
    },
  });
}

function createCategoryChart() {
  const categoryData = getExpensesByCategory();

  categoryChart = new Chart(expensesCategoryChart, {
    type: "pie",

    data: {
      labels: categoryData.labels,

      datasets: [
        {
          label: "Despesas por categoria",
          data: categoryData.values,
          backgroundColor: ["#2563eb", "#16a34a", "#f59e0b"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              size: 11,
            },
          },
        },
      },
    },
  });
}
function updateRevenueCategoryChart() {
  const categoryData = getRevenuesByCategory();

  revenueCategoryChart.data.labels = categoryData.labels;
  revenueCategoryChart.data.datasets[0].data = categoryData.values;

  revenueCategoryChart.update();
}

function getRevenuesByCategory() {
  const revenues = transactions.filter((transaction) => {
    return transaction.type === "receita";
  });

  const revenuesByCategory = revenues.reduce((accumulator, transaction) => {
    if (!accumulator[transaction.category]) {
      accumulator[transaction.category] = 0;
    }

    accumulator[transaction.category] += transaction.value;

    return accumulator;
  }, {});

  const labels = Object.keys(revenuesByCategory);
  const values = Object.values(revenuesByCategory);

  return {
    labels,
    values,
  };
}

function updateChart() {
  chart.data.datasets[0].data = [totalRevenue, totalExpense];

  chart.update();
}

function updateCategoryChart() {
  const categoryData = getExpensesByCategory();

  categoryChart.data.labels = categoryData.labels;
  categoryChart.data.datasets[0].data = categoryData.values;

  categoryChart.update();
}

function getExpensesByCategory() {
  const expenses = transactions.filter((transaction) => {
    return transaction.type === "despesa";
  });

  const expensesByCategory = expenses.reduce((accumulator, transaction) => {
    if (!accumulator[transaction.category]) {
      accumulator[transaction.category] = 0;
    }

    accumulator[transaction.category] += transaction.value;

    return accumulator;
  }, {});

  const labels = Object.keys(expensesByCategory);
  const values = Object.values(expensesByCategory);

  return {
    labels,
    values,
  };
}

transactionTypeSelect.addEventListener("change", getCategories);
filterTypeSelect.addEventListener("change", getCategories);
transactionList.addEventListener("click", removeTransaction);
filterCategorySelect.addEventListener("change", filterTransactions);
filterDate.addEventListener("change", filterTransactions);
btnClearFilters.addEventListener("click", clearFilters);
form.addEventListener("submit", getTransactions);

loadTransactions();

updateCategories(
  categoriesByType[transactionTypeSelect.value],
  transactionCategorySelect,
);

updateCategories(allCategories, filterCategorySelect);

filterTransactions();
calculateFinancialSummary();
updateFinancialSummary();

createChart();
createCategoryChart();
createRevenueCategoryChart();
updateRevenueCategoryChart();
