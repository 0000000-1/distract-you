async function renderSites() {
  const data = await chrome.storage.local.get(["blockedSites"]);
  const sites = data.blockedSites || [];

  const list = document.getElementById("wayh-site-list");
  list.innerHTML = "";

  sites.forEach((site) => {
    const li = document.createElement("li");
    li.textContent = site;
    list.appendChild(li);
  });
}

document.getElementById("wayh-add-btn").addEventListener("click", async () => {
  const input = document.getElementById("wayh-site-input");
  const newSite = input.value;

  if(!newSite) return
  const data = await chrome.storage.local.get(["blockedSites"]);
  const sites = data.blockedSites || [];
  sites.push(newSite);
  await chrome.storage.local.set({ blockedSites: sites });
  renderSites()
});
renderSites();
