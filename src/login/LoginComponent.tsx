import React, { useState } from "react";
import "./LoginStyle.css"; // Importar estilos
import Chessboard from "../components/Chessboard/Chessboard";

const LoginComponent: React.FunctionComponent= () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const users:{[key:string]:string} = {
      usuario1: "password1",
      usuario2: "password2",
      admin: "12345",
    };

    if (!username || !password) {
      alert("Los campos no pueden estar vacíos");
      return;
    }

    if (!termsAccepted) {
      alert("Para entrar a este sitio es necesario vender tu alma a Satanás");
      return;
    }

    users[username] && users[username] === password
      ? setIsLoggedIn(true): alert("Usuario o contraseña incorrecta");
  };

  return (
    <div>
      {isLoggedIn ? ( // Renderizado condicional
        <div className="Chess" id="app">
          <Chessboard />
        </div>
      ) : (
        <div id="container">
          <h1>
            <span id="title">CHESSS</span>
          </h1>
          <hr />
          <form onSubmit={handleLogin}>
            <input
              className="div_input div_input-hover"
              type="text"
              placeholder="TU NOMBRE"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
              className="div_input"
              type="password"
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <input id="div_button" type="submit" value="ENTER" />
            <br />
            <label id="terms">
              <input
                type="checkbox"
                id="terms_input"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
            </label>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginComponent;