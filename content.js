function normalizeHost(host) {
  return host.replace(/^www\./, "").toLowerCase();
}

const currentHost = normalizeHost(location.hostname);

async function checkSite() {
  const data = await chrome.storage.local.get(["blockedSites"]);
  const blockedSites = data.blockedSites || [];

  const isBlocked = blockedSites.some((site) => {
    return currentHost === site || currentHost.endsWith("." + site);
  });

  if (!isBlocked) {
    console.log("Not Blocked", currentHost);
    return;
  }

  const result = await chrome.storage.local.get([currentHost]);
  const lastAnswered = result[currentHost];
  const fifteenMinutes = 15 * 60 * 1000;

  if (lastAnswered && Date.now() - lastAnswered < fifteenMinutes) {
    console.log("Already answered recently, skipping popup for", currentHost);
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "wayh-overlay";
  overlay.innerHTML = `
  <div class="wayh-card">
        <h1>Why are you here?</h1>
        <textarea id="wayh-reason" placeholder="What's the real reason?"></textarea>
        <button id="wayh-continue" disabled>Wait 10s...</button>
    </div>`;
  document.body.appendChild(overlay);

  const continueBtn = document.getElementById("wayh-continue");
  const wayh_overlay = document.getElementById("wayh-overlay");
  let secondsLeft = 10;

  const timer = setInterval(() => {
    secondsLeft = secondsLeft - 1;
    continueBtn.textContent = `wait ${secondsLeft} seconds...`;

    if (secondsLeft <= 0) {
      clearInterval(timer);
      continueBtn.textContent = "Continue anyway";
      continueBtn.disabled = false;

      continueBtn.addEventListener("click", async () => {
        wayh_overlay.remove();
        await chrome.storage.local.set({ [currentHost]: Date.now() }, () => {
          console.log("saved data successfully");
        });
      });
    }
  }, 1000);
}

checkSite();