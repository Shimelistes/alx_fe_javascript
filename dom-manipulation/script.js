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

// Show a random quote and store last viewed index in sessionStorage
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Please add some!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  const categoryText = document.createElement("small");
  categoryText.textContent = `Category: ${quote.category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(categoryText);

  // Store last viewed quote index in session storage
  sessionStorage.setItem("lastQuoteIndex", randomIndex);
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
      textInput.value = "";
      categoryInput.value = "";
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
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  // Restore last viewed quote
  restoreLastQuote();

  // Show initial random quote
  showRandomQuote();
});