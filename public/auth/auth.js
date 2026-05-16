const btnLogin = document.getElementById("btnLogin");
import { addSessionStorage } from "../utils/sessionStorage.controller.js";



const auth = async (username, password) => {
    const user = await fetch('http://localhost:5000/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "username": username, "password": password })
    }).then((res=>{
        if(!res.ok){
            throw new Error('Error en la autenticación');
        }
        return res.json();
    } )).catch(error=>{
        console.error('Error:', error);
        throw new Error('Error en la autenticación');
    })
    return user;
};

btnLogin.addEventListener("click", async() => {
  const username = document.getElementById('txtName').value;
  const password = document.getElementById('txtPassword').value;

  if (username != "" && password !== "") {
    try{
        const user = await auth(username, password);
        //funcion con el session storage para guardar el usuario logueado
        addSessionStorage(user);
        window.location.href = "../pages/home.html";
    }catch(error){
        alert("Error en la autenticación");
    }
  }else{
    alert("Debe completar ambos campos");
}});

