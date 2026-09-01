const transactionTypeSelect = document.querySelector("#tipo-transacao");

const transactionCategorySelect = document.querySelector(
  "#categoria-transacao",
);

const categoriesByType = {
  receita: ["Salário", "Freelance", "Investimentos"],
  despesa: ["Moradia", "Alimentação", "Lazer", "Transporte"],
};

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

transactionTypeSelect.addEventListener("change", updateCategories);

updateCategories();
