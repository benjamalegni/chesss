import React, { useState } from "react";
import "./LoginStyle.css"; // Importar estilos
import Chessboard from "../components/Chessboard/Chessboard";
import Title from "./Title/Title";

const LoginComponent: React.FunctionComponent= () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
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
          <h1 className="title">
              <Title/>
          </h1>
          <hr />
          <form className="form" onSubmit={handleLogin}>
            <input
              className="div_input div_input-hover"
              type="text"
              placeholder="USER"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
              className="div_input div_input-hover"
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <br/>
            <input id="div_button" type="submit" value="λ" />
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginComponent;