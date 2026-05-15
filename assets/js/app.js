const body = document.body;
const toggle = document.getElementById("modeToggle");

toggle.addEventListener("click", () => {
    if (body.classList.contains("light")) {
        body.classList.remove("light");
        body.classList.add("dark");
        toggle.textContent = "🌙 / ☀️";
    } else {
        body.classList.remove("dark");
        body.classList.add("light");
        toggle.textContent = "🌑 / 🌞";
    }
});
