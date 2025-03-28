// Lista de usuarios ficticios
const users = {
  "usuario1": "password1",
  "usuario2": "password2",
  "admin": "12345",
};

// Obtener referencias a los elementos del DOM
const submitButton = document.getElementById("div_button");
const termsButton = document.getElementById("terms_input");
const inputs = document.getElementsByClassName("div_input");

// Evento de clic en el botón "ENTER"
submitButton.addEventListener("click", function (event) {
  event.preventDefault(); // Evita que el formulario se recargue

  const username = inputs[0].value; // Obtiene el valor del nombre de usuario
  const password = inputs[1].value; // Obtiene el valor de la contraseña


  // Verificar si el nombre y contraseña son válidos

  if(termsButton.checked){
    (users[username] && users[username]===password) ? alert("entraste") : ((!username || !password)?alert("los campos no pueden estar vacios"):alert("usuario o password incorrecta"));
  } else{
    alert("para entrar a este sitio es necesario vender tu alma a satanas");
  }
});
