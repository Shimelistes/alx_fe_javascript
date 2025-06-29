// Load quotes from localStorage or use default if none exist
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "HTML is the basic for web application", category: "Front-end" },
  { text: "Node is the fundamental for connection", category: "Back-end" },
  { text: "Work as front-end and back-end together at once", category: "Fullstack" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  localStorage.setItem("lastSyncTime", Date.now());
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

  sessionStorage.setItem("lastQuoteIndex", quotes.indexOf(quote));
}

// Restore last viewed quote
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

// Populate categories in dropdown
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

// Create Add Quote Form
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
      const newQuote = { text, category };
      quotes.push(newQuote);
      saveQuotes();
      postQuoteToServer(newQuote);
      populateCategories();
      filterQuotes();
      alert("Quote added successfully!");
    } else {
      alert("Please enter both quote text and category.");
    }
  });
}

// Export Quotes
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

// Import Quotes
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
        populateCategories();
        filterQuotes();
        alert(`${validQuotes.length} quote(s) imported successfully!`);
      } else {
        alert("Invalid JSON format: Expected an array of quotes.");
      }
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsText(file);

  event.target.value = "";
}

// Fetch quotes from server (mock API)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const posts = await response.json();

    // Convert posts to quote-like objects
    const remoteQuotes = posts.map(post => ({
      text: post.title,
      category: "Server"
    }));

    mergeQuotes(remoteQuotes);
  } catch (error) {
    console.error("Failed to fetch from server:", error);
  }
}

// Merge remote data with local data (server wins strategy)
function mergeQuotes(remoteQuotes) {
  const existingTexts = new Set(quotes.map(q => q.text));

  let newQuotes = 0;
  remoteQuotes.forEach(remoteQuote => {
    if (!existingTexts.has(remoteQuote.text)) {
      quotes.push(remoteQuote);
      newQuotes++;
    }
  });

  if (newQuotes > 0) {
    saveQuotes();
    populateCategories();
    notifyUser(`✅ ${newQuotes} new quote(s) downloaded from the server.`);
    filterQuotes(); // Refresh display
  }
}

// Post new quote to server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(" https://jsonplaceholder.typicode.com/posts ", {
      method: "POST",
      body: JSON.stringify({
        title: quote.text,
        body: quote.category,
        userId: 1
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    });
    const data = await response.json();
    console.log("Posted to server:", data);
  } catch (error) {
    console.error("Failed to post to server:", error);
  }
}

// Notify user via simple notification
function notifyUser(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 5000);
}

// Start periodic sync
function startAutoSync(interval = 30000) {
  setInterval(fetchQuotesFromServer, interval);
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  const notifyDiv = document.createElement("div");
  notifyDiv.id = "notification";
  notifyDiv.style.background = "#d4edda";
  notifyDiv.style.padding = "10px";
  notifyDiv.style.marginTop = "10px";
  notifyDiv.style.display = "none";
  document.body.appendChild(notifyDiv);

  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", () => {
    const selectedCategory = document.getElementById("categoryFilter").value;
    if (selectedCategory === "all") {
      showRandomQuote();
    } else {
      const filtered = quotes.filter(q => q.category === selectedCategory);
      showRandomQuote(filtered);
    }
  });

  populateCategories();
  restoreLastQuote();

  const savedFilter = localStorage.getItem("lastSelectedCategory") || "all";
  if (savedFilter !== "all") {
    const filtered = quotes.filter(q => q.category === savedFilter);
    showRandomQuote(filtered);
  } else {
    showRandomQuote();
  }

  // Start syncing every 30 seconds
  fetchQuotesFromServer();
  startAutoSync(30000);
});