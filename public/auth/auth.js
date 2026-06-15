const btnLogin = document.getElementById("btnLogin");

const auth = async (username, password) => {
    // Usamos la ruta relativa '/users/login' en lugar del localhost fijo para que funcione en cualquier entorno
    const response = await fetch('/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "username": username, "password": password })
    });

    if(!response.ok){
        throw new Error('Error en la autenticación');
    }
    
    return await response.json();
};

if (btnLogin) {
    btnLogin.addEventListener("click", async (e) => {
        e.preventDefault(); // evita que el botón recargue la página si está dentro de un <form>

        // Buscamos los inputs con los ID
        const usernameInput = document.getElementById('txtName');
        const passwordInput = document.getElementById('txtPassword');

        const username = usernameInput ? usernameInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value.trim() : "";

        if (username !== "" && password !== "") {
            try {
                // Modificamos temporalmente el botón para dar feedback visual
                const textoOriginal = btnLogin.innerHTML;
                btnLogin.innerHTML = "Ingresando...";
                btnLogin.disabled = true;

                const user = await auth(username, password);
                
                // Guardamos el usuario logueado directamente usando el sessionStorage nativo del navegador
                sessionStorage.setItem("user", JSON.stringify(user));
                
                // Redirigimos al index
                window.location.href = "../index.html"; 

            } catch (error) {
                console.error('Error:', error);
                alert("Error en la autenticación. Verificá tus credenciales.");
                
                // Restauramos el boton si hubo error
                btnLogin.innerHTML = "Ingresar";
                btnLogin.disabled = false;
            }
        } else {
            alert("Debe completar ambos campos para ingresar.");
        }
    });
}

