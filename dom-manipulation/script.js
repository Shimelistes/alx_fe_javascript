// Load quotes from localStorage or use default if none exist
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "HTML is the basic for web application", category: "Front-end" },
  { text: "Node is the fundamental for connection", category: "Back-end" },
  { text: "Work as front-end and back-end together at once", category: "Fullstack" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote from filtered results
function showRandomQuote(filteredQuotes = quotes) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes match this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  const categoryText = document.createElement("small");
  categoryText.textContent = `Category: ${quote.category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(categoryText);

  // Store last viewed quote index in session storage
  sessionStorage.setItem("lastQuoteIndex", quotes.indexOf(quote));
}

// Restore last viewed quote from sessionStorage
function restoreLastQuote() {
  const lastIndex = sessionStorage.getItem("lastQuoteIndex");
  if (lastIndex !== null && quotes[lastIndex]) {
    const quote = quotes[lastIndex];
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = "";

    const quoteText = document.createElement("p");
    quoteText.textContent = `"${quote.text}"`;

    const categoryText = document.createElement("small");
    categoryText.textContent = `Category: ${quote.category}`;

    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(categoryText);
  }
}

// Populate categories in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("lastSelectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

// Filter quotes by selected category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  if (selectedCategory === "all") {
    showRandomQuote();
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
    showRandomQuote(filtered);
  }
}

// Create form dynamically to add new quotes
function createAddQuoteForm() {
  const formDiv = document.createElement("div");
  formDiv.id = "form-quote";

  const form = document.createElement("form");
  form.id = "add-quote-form";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.required = true;
  textInput.id = "newQuoteText";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.required = true;
  categoryInput.id = "newQuoteCategory";

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Quote";

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);
  formDiv.appendChild(form);
  document.body.appendChild(formDiv);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();

    if (text && category) {
      quotes.push({ text, category });
      saveQuotes();
      populateCategories(); // Update category list
      textInput.value = "";
      categoryInput.value = "";
      filterQuotes(); // Reapply current filter
      alert("Quote added successfully!");
    } else {
      alert("Please enter both quote text and category.");
    }
  });
}

// Export quotes to JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        const validQuotes = importedQuotes.filter(q => q.text && q.category);
        quotes.push(...validQuotes);
        saveQuotes();
        populateCategories(); // Update category list
        filterQuotes(); // Reapply current filter
        alert(`${validQuotes.length} quote(s) imported successfully!`);
      } else {
        alert("Invalid JSON format: Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);

  // Reset input to allow importing same file again
  event.target.value = "";
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm(); // Add the quote form

  // Attach click handler to show new quote
  document.getElementById("newQuote").addEventListener("click", () => {
    const selectedCategory = document.getElementById("categoryFilter").value;
    if (selectedCategory === "all") {
      showRandomQuote();
    } else {
      const filtered = quotes.filter(q => q.category === selectedCategory);
      showRandomQuote(filtered);
    }
  });

  // Populate categories
  populateCategories();

  // Restore last viewed quote
  restoreLastQuote();

  // Apply last selected filter
  const savedFilter = localStorage.getItem("lastSelectedCategory") || "all";
  if (savedFilter !== "all") {
    const filtered = quotes.filter(q => q.category === savedFilter);
    showRandomQuote(filtered);
  } else {
    showRandomQuote();
  }
});