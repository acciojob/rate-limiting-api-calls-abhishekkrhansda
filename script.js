let btn = document.querySelector("#btn");
let count = document.querySelector("#count");
let results = document.querySelector("#results");

let clickCount = 0;
let clickTimer;

// Rate limiter variables
let queue = [];
let callCount = 0;
let windowStart = Date.now();
let timer = null;

const API = "https://jsonplaceholder.typicode.com/todos/1";

// Promise-based rate limiter
function rateLimitedFetch() {

    return new Promise((resolve, reject) => {

        queue.push({ resolve, reject });

        processQueue();
    });
}

// Process queued requests
function processQueue() {

    let now = Date.now();

    // Check if 1 second has passed
    if (now - windowStart >= 1000) {
        windowStart = now;
        callCount = 0;
    }

    // Maximum 5 API calls per second
    if (callCount >= 5) {

        if (!timer) {

            let remainingTime = 1000 - (now - windowStart);

            timer = setTimeout(() => {
                timer = null;
                processQueue();
            }, remainingTime);
        }

        return;
    }

    // Execute requests
    while (queue.length > 0 && callCount < 5) {

        let request = queue.shift();

        callCount++;

        fetch(API)
            .then(response => {
                if (!response.ok) {
                    throw new Error("API request failed");
                }

                return response.json();
            })
            .then(data => request.resolve(data))
            .catch(error => request.reject(error));
    }

    // Process remaining requests after 1 second
    if (queue.length > 0) {

        let remainingTime = Math.max(
            0,
            1000 - (Date.now() - windowStart)
        );

        if (!timer) {
            timer = setTimeout(() => {
                timer = null;
                processQueue();
            }, remainingTime);
        }
    }
}

// Button click event
btn.addEventListener("click", () => {

    // Increment click count
    clickCount++;

    count.textContent = `Clicks: ${clickCount}`;

    // Reset click counter after 10 seconds
    clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
        clickCount = 0;
        count.textContent = "Clicks: 0";
    }, 10000);

    // Make API request
    rateLimitedFetch()
        .then(data => {

            let div = document.createElement("div");

            div.classList.add("item");

            div.innerHTML = `
                <p>ID: ${data.id}</p>
                <p>Title: ${data.title}</p>
                <p>Completed: ${data.completed}</p>
            `;

            results.appendChild(div);
        })
        .catch(error => {
            console.error(error);
        });

});
