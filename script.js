//your JS code here. If required.
let btn = document.querySelector("#btn");
let count = document.querySelector("#count");
let results = document.querySelector("#results");

let clickCount = 0;
let clickTimer;

// Rate limiter variables
let queue = [];
let callCount = 0;
let windowStart = null;
let timer = null;

const API = "https://jsonplaceholder.typicode.com/todos/1";

// Promise-based rate limiter
function rateLimitedFetch() {

    return new Promise((resolve, reject) => {

        // Add request to queue
        queue.push({ resolve, reject });

        processQueue();
    });
}

// Process maximum 5 requests in 10 seconds
function processQueue() {

    let now = Date.now();

    // Check whether 10 seconds have passed
    if (windowStart === null || now - windowStart >= 10000) {

        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        windowStart = now;
        callCount = 0;
    }

    // If 5 requests are already made, wait
    if (callCount >= 5) {

        if (!timer) {
            let remainingTime = 10000 - (now - windowStart);

            timer = setTimeout(() => {
                timer = null;
                processQueue();
            }, remainingTime);
        }

        return;
    }

    // Execute pending requests
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

    // If requests are remaining, wait for next window
    if (queue.length > 0) {
        let remainingTime = 10000 - (Date.now() - windowStart);

        timer = setTimeout(() => {
            timer = null;
            processQueue();
        }, remainingTime);
    }
}

// Button click event
btn.addEventListener("click", () => {

    // Update click counter
    clickCount++;
    count.textContent = `Clicks: ${clickCount}`;

    clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
        clickCount = 0;
        count.textContent = "Clicks: 0";
    }, 10000);

    // Make rate-limited API request
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
            console.log(error);
        });

});