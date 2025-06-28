// Load quotes from localStorage or initialize with defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "HTML is the basic for web application", category: "Front-end" },
  { text: "Node is the fundamental for connection", category: "Back-end" },
  { text: "Work as front-end and back-end together at once", category: "Fullstack" }
];

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote and save last shown index to sessionStorage
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

  // Save last viewed quote index in sessionStorage
  sessionStorage.setItem("lastQuoteIndex", randomIndex);
}

// Create and handle add-quote form
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
      saveQuotes();  // <=== Save quotes immediately after adding
      textInput.value = "";
      categoryInput.value = "";
      alert("Quote added successfully!");
    } else {
      alert("Please enter both quote text and category.");
    }
  });
}

// Export quotes as JSON file
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

// Import quotes from JSON file input
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
        saveQuotes();  // <=== Save after importing
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format: Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);

  // Clear input so same file can be imported again if needed
  event.target.value = "";
}

// Restore last viewed quote on page load using sessionStorage
function restoreLastQuote() {
  const lastIndex = sessionStorage.getItem("lastQuoteIndex");
  if (lastIndex !== null && quotes[lastIndex]) {
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = "";

    const quote = quotes[lastIndex];
    const quoteText = document.createElement("p");
    quoteText.textContent = `"${quote.text}"`;

    const categoryText = document.createElement("small");
    categoryText.textContent = `Category: ${quote.category}`;

    quoteDisplay.appendChild(quoteText);
    quoteDisplay.appendChild(categoryText);
  }
}

// Create Import and Export UI controls
function createImportExportUI() {
  const container = document.createElement("div");
  container.style.marginTop = "20px";

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes";
  exportBtn.addEventListener("click", exportQuotes);

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.id = "importFile";
  importInput.style.marginLeft = "10px";
  importInput.addEventListener("change", importFromJsonFile);

  container.appendChild(exportBtn);
  container.appendChild(importInput);

  document.body.appendChild(container);
}

// Initialize everything on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();

  const showBtn = document.getElementById("newQuote");
  if (showBtn) {
    showBtn.addEventListener("click", showRandomQuote);
  }

  createImportExportUI();
  restoreLastQuote();
});
