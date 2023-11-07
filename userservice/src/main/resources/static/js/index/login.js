const labels = document.querySelectorAll('.form-login label');

labels.forEach(label => {
    label.innerHTML=label.innerText.split('')
        .map((letter,idx)=>`<span style="transition-delay:${idx*50}ms">${letter}</span>`)
        .join('');
})


const signin = document.querySelector("#change-mode-to-sign-in");
const signup = document.querySelector("#change-mode-to-sign-up");
const container = document.querySelector(".container-login");

signup.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
});

signin.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
});

