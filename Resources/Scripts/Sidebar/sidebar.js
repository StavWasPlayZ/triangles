const shapeSidebar = document.getElementById("shapepicker"), sidebars = document.querySelectorAll(".sidebar");
const texttoggle = document.getElementById("texttoggle");


sidebars.forEach((sidebar) => {
    // Hover functionality
    sidebar.addEventListener("mouseenter", () => {
        if (!sidebar.classList.contains("hover"));
            sidebar.classList.add("hover");
    });
    sidebar.addEventListener("mouseleave", () => {
        if (!sidebar.classList.contains("fhover") && sidebar.classList.contains("hover"))
            sidebar.classList.remove("hover");
    });
    // & for touch
    let sidebarTouchFocused = false;
    sidebar.addEventListener("touchstart", () => {
        if (sidebar.classList.contains("hover"))
            setTimeout(() => {
                if (!sidebar.classList.contains("fhover"))
                    sidebar.classList.remove("hover");
            }, 1000);
        else {
            sidebar.classList.add("hover");
            sidebarTouchFocused = true;
        }
    });
    canvas.addEventListener("touchstart", () => {
        if (sidebarTouchFocused)
            sidebar.classList.remove("hover");
    });


    // Pin button
    const pin = sidebar.querySelector(".pin");
    pin.addEventListener("click", () => {
        if (pin.classList.contains("selected")) {
            pin.classList.remove("selected");
            sidebar.classList.remove("fhover")
        } else {
            sidebar.classList.add("fhover");
            pin.classList.add("selected");
        }
    });
})


// Text button
let texttoggle_enabled = false, texttoggle_functions = [];
texttoggle.addEventListener("click", () => {
    texttoggle_enabled = !texttoggle_enabled;
    texttoggle.style.backgroundColor = texttoggle_enabled ? "green" : "black";
    for (let i = 0; i < texttoggle_functions.length; i++)
        texttoggle_functions[i](texttoggle_enabled);
})