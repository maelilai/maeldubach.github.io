async function fetchAiSuggestionsFromApi(product) {
    const OPENAI_API_KEY = "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"; // ENTER YOUR API KEY IN HERE

    // Lege System- und User-Nachricht abhängig von der gewählten Sprache fest
    let systemMessage, userMessage;
    if (window.languageEnglish) {
        systemMessage = "You are a shopping assistant. Provide only three short alternatives in bullet style, separated by commas.";
        userMessage = `What are good alternatives or additions for ${product}?`;
    } else {
        systemMessage = "Du bist ein Einkaufsassistent. Gib nur drei kurze Alternativen im Stichwortstil, getrennt mit Komma.";
        userMessage = `Was sind gute Alternativen oder Ergänzungen für ${product}?`;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7
            })
        });
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || (window.languageEnglish ? "No suggestions found." : "Keine Vorschläge gefunden.");
        return reply.split("\n").filter(line => line.trim() !== "");
    } catch (error) {
        console.error("Fehler bei API-Vorschlägen:", error);
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
                // Synchronisiere die Animation: Offset basierend auf window.baseTime (Dauer: 8000ms)
                if (window.baseTime) {
                    const offset = (Date.now() - window.baseTime) % 8000;
                    button.style.animationDelay = `-${offset}ms`;
                }
                button.onclick = () => addListItem(suggestion);
                suggestionsDiv.appendChild(button);
            }
        });
    });
    // Synchronisiere alle regenbogenbezogenen Buttons
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
    // Neuer Event-Handler: Bestätigungs-Popup vor dem Löschen.
    // Nach Bestätigung wird der Listeneintrag entfernt und anschließend, sofern noch Artikel übrig sind,
    // werden die Vorschläge für einen nicht gelöschten Artikel abgerufen.
    removeButton.onclick = () => {
        let confirmMsg = window.languageEnglish
            ? "Do you really want to delete this article?"
            : "Möchten Sie diesen Artikel wirklich löschen?";
        if (confirm(confirmMsg)) {
            listItem.remove();
            const shoppingList = document.getElementById("shoppingList");
            if (shoppingList.children.length > 0) {
                // Verwende den Text des ersten verbleibenden Artikels als Basis für die Vorschläge.
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

// Neue Funktion zum Umschalten der Sprache (Toggle)
function toggleLanguage() {
    // Falls noch nicht gesetzt, gehe von Deutsch aus
    if (typeof window.languageEnglish === "undefined") {
        window.languageEnglish = false;
    }
    // Umschalten: Wenn aktuell Deutsch → auf Englisch, sonst zurück auf Deutsch
    window.languageEnglish = !window.languageEnglish;

    if (window.languageEnglish) {
        document.getElementById("itemInput").placeholder = "Add item";
        const addButton = document.getElementById("addButton");
        if (addButton) {
            addButton.textContent = "Add";
            addButton.classList.add("rainbow-button");
        }
        const translateButton = document.getElementById("translateButton");
        if (translateButton) {
            translateButton.textContent = "Switch to German";
        }
        const footer = document.querySelector("footer");
        if (footer) {
            footer.textContent = "© 2025 - Mael Dubach";
        }
    } else {
        document.getElementById("itemInput").placeholder = "Artikel hinzufügen";
        const addButton = document.getElementById("addButton");
        if (addButton) {
            addButton.textContent = "Hinzufügen";
            addButton.classList.add("rainbow-button");
        }
        const translateButton = document.getElementById("translateButton");
        if (translateButton) {
            translateButton.textContent = "Switch to English";
        }
        const footer = document.querySelector("footer");
        if (footer) {
            footer.textContent = "© 2025 - Mael Dubach";
        }
    }
    updateRainbowSync();
}

// Beim Laden der Seite wird die Basiszeit gesetzt, ein Event Listener für die Enter-Taste und für den Sprachumschalt-Button hinzugefügt.
// Außerdem werden alle bereits vorhandenen Elemente mit der Klasse .rainbow-button synchronisiert.
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
