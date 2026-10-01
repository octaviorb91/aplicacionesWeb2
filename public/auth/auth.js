const btnLogin = document.getElementById("btnLogin");

const auth = async (username, password) => {
    const response = await fetch('/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "username": username, "password": password })
    });

    // Procesamos el JSON antes del throw para poder leer el mensaje de error real
    const data = await response.json();

    if (!response.ok || !data.status) {
        // Lanzamos el error exacto que manda tu backend (ej: "Datos incorrectos.")
        throw new Error(data.message || 'Error en la autenticación');
    }
    
    // Retornamos el objeto completo (que ahora trae data.token y data.user)
    return data;
};

if (btnLogin) {
    btnLogin.addEventListener("click", async (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('txtName');
        const passwordInput = document.getElementById('txtPassword');

        const username = usernameInput ? usernameInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value.trim() : "";

        if (username !== "" && password !== "") {
            try {
                const textoOriginal = btnLogin.innerHTML;
                btnLogin.innerHTML = "Ingresando...";
                btnLogin.disabled = true;

                const responseData = await auth(username, password);
                
                // 1. Guardamos el pase VIP (JWT) en la sesión
                sessionStorage.setItem("token", responseData.token);
                
                // 2. Guardamos SOLO los datos del usuario en la clave "user"
                sessionStorage.setItem("user", JSON.stringify(responseData.user));
                
                window.location.href = "../index.html"; 

            } catch (error) {
                console.error('Error:', error);
                // Le mostramos al usuario el texto de error que vino del servidor
                alert(error.message);
                
                btnLogin.innerHTML = "Ingresar";
                btnLogin.disabled = false;
            }
        } else {
            alert("Debe completar ambos campos para ingresar.");
        }
    });
}

