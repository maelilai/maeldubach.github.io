async function fetchAiSuggestionsFromApi(product) {
    const file = window.languageEnglish ? "/Webseite/itemsen.json" : "/Webseite/itemsde.json";

    try {
        const response = await fetch(file);
        const data = await response.json();
        const key = Object.keys(data).find(k => k.toLowerCase() === product.toLowerCase());
        const suggestions = key ? data[key] : [];
        return suggestions.length > 0
            ? suggestions
            : [window.languageEnglish ? "No suggestions found." : "Keine Vorschläge gefunden."];
    } catch (error) {
        console.error("Fehler beim Laden der JSON:", error);
        return [window.languageEnglish ? "Error fetching suggestions." : "Fehler bei der Empfehlung."];
    }
}

async function showSuggestions(itemText) {
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = "";

    const suggestions = await fetchAiSuggestionsFromApi(itemText);

    suggestions.forEach(raw => {
        const parts = raw.split(",");
        parts.forEach(part => {
            const suggestion = part.trim();
            if (suggestion) {
                const button = document.createElement("button");
                button.textContent = suggestion;
                // Regenbogen-Klasse hinzufügen, damit diese Buttons den animierten Effekt bekommen
                button.classList.add("rainbow-button");
                if (window.baseTime) {
                    const offset = (Date.now() - window.baseTime) % 8000;
                    button.style.animationDelay = `-${offset}ms`;
                }
                button.onclick = () => addListItem(suggestion);
                suggestionsDiv.appendChild(button);
            }
        });
    });

    updateRainbowSync();
}

function updateRainbowSync() {
    const offset = (Date.now() - window.baseTime) % 8000;
    document.querySelectorAll(".rainbow-button").forEach(button => {
        button.style.animationDelay = `-${offset}ms`;
    });
}

function addListItem(itemText) {
    const shoppingList = document.getElementById("shoppingList");

    const listItem = document.createElement("li");

    const itemSpan = document.createElement("span");
    itemSpan.textContent = itemText;
    listItem.appendChild(itemSpan);

    const checkButton = document.createElement("button");
    checkButton.classList.add("checkButton");
    const checkIcon = document.createElement("img");
    checkIcon.src = "/ignore/check.png";
    checkIcon.alt = "Check";
    checkIcon.style.width = "20px";
    checkIcon.style.height = "20px";
    checkButton.appendChild(checkIcon);
    checkButton.onclick = () => itemSpan.classList.toggle("checked");
    listItem.appendChild(checkButton);

    const removeButton = document.createElement("button");
    const removeIcon = document.createElement("img");
    removeIcon.src = "/ignore/remove.png";
    removeIcon.alt = "Remove";
    removeIcon.style.width = "20px";
    removeIcon.style.height = "20px";
    removeButton.appendChild(removeIcon);
    removeButton.onclick = () => {
        let confirmMsg = window.languageEnglish
            ? "Do you really want to delete this article?"
            : "Möchten Sie diesen Artikel wirklich löschen?";
        if (confirm(confirmMsg)) {
            listItem.remove();
            const shoppingList = document.getElementById("shoppingList");
            if (shoppingList.children.length > 0) {
                // Verwende den Text des ersten verbleibenden Artikels für die Vorschläge
                const remainingArticle = shoppingList.querySelector("li span").textContent;
                showSuggestions(remainingArticle);
            } else {
                document.getElementById("suggestions").innerHTML = "";
            }
        }
    };
    listItem.appendChild(removeButton);

    shoppingList.appendChild(listItem);
    updateRainbowSync();
}

function addItem() {
    const itemInput = document.getElementById("itemInput");
    const itemText = itemInput.value.trim();
    if (itemText !== "") {
        addListItem(itemText);
        showSuggestions(itemText);
        itemInput.value = "";
        updateRainbowSync();
    }
}

function toggleLanguage() {
    // Falls noch nicht gesetzt, gehe von Deutsch aus
    if (typeof window.languageEnglish === "undefined") {
        window.languageEnglish = false;
    }
    // Umschalten: true wird zu false und umgekehrt
    window.languageEnglish = !window.languageEnglish;

    // Update Input-Platzhalter
    document.getElementById("itemInput").placeholder = window.languageEnglish ? "Add item" : "Artikel hinzufügen";

    // Update Add-Button: Versuche zuerst über die ID, ansonsten suche per Attribut
    let addButton = document.getElementById("addButton");
    if (!addButton) {
        addButton = document.querySelector("button[onclick='addItem()']");
    }
    if (addButton) {
        addButton.textContent = window.languageEnglish ? "Add" : "Hinzufügen";
        addButton.classList.add("rainbow-button");
    }

    // Update des Sprachumschalt-Buttons
    const translateButton = document.getElementById("translateButton");
    if (translateButton) {
        translateButton.textContent = window.languageEnglish ? "Switch to German" : "Switch to English";
    }

    // Update Footer-Text
    const footer = document.querySelector("footer");
    if (footer) {
        footer.textContent = window.languageEnglish ? "© 2025 - Mael Dubach" : "© 2025 - Mael Dubach";
    }

    // Update Vorschläge: Wenn im Input schon ein Artikel steht, nutze diesen; sonst, falls vorhanden, den ersten Artikel in der Liste
    const itemInput = document.getElementById("itemInput");
    if (itemInput.value.trim() !== "") {
        showSuggestions(itemInput.value.trim());
    } else {
        const shoppingList = document.getElementById("shoppingList");
        if (shoppingList.children.length > 0) {
            const article = shoppingList.querySelector("li span").textContent;
            showSuggestions(article);
        } else {
            document.getElementById("suggestions").innerHTML = "";
        }
    }

    updateRainbowSync();
}

window.onload = () => {
    console.log("App gestartet.");
    window.baseTime = Date.now();

    const itemInput = document.getElementById("itemInput");
    itemInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            addItem();
        }
    });

    const translateButton = document.getElementById("translateButton");
    if (translateButton) {
        translateButton.addEventListener("click", toggleLanguage);
    }

    updateRainbowSync();
};
