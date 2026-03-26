const loginForm = document.getElementById("login-form");
const loginUI = document.getElementById("login-ui");
const swaggerUI = document.getElementById("swagger-ui");
const backToLoginButton = document.getElementById("back-to-login");

backToLoginButton.addEventListener('click', () => {

  backToLoginButton.style.display = 'none';
  swaggerUI.style.display = "none";
  loginUI.style.display = "block";
})

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(e.target);
  const username = data.get("username");
  const password = data.get("password");
  
  try {

    const BEARER_AUTH_TOKEN = await getToken(username, password);
    
    loginUI.style.display = "none";
    swaggerUI.style.display = "block";
    
    //creates the swagger dashboard from the swagger yaml file
    const ui = await SwaggerUIBundle({
      url: "https://api.emeraldtechnology.net/v1/auth/swagger-all.yaml",
      dom_id: "#swagger-ui",
      
      //routes the api call through a proxy to bypass cors policy 
      requestInterceptor: (req) => {
        const PROXY = "https://corsproxy.io/?";
        
        req.url = PROXY + encodeURIComponent(req.url);
        
        req.headers["api-key"] = API_KEY_AUTH;
        
        return req;
      },
      
      onComplete: async () => {
        // prefills API key
        ui.preauthorizeApiKey("ApiKeyAuth", API_KEY_AUTH);
        
        // prefills Bearer token
        ui.preauthorizeApiKey("BearerAuth", BEARER_AUTH_TOKEN);
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    document.getElementById("error").textContent = error;
  }

  //clears the login screen fields and makes backtologin button visible
  e.target.reset();
  backToLoginButton.style.display = "block";
});

async function getToken(userNameOrEmail, password) {
  const PROXY = "https://corsproxy.io/?";
  const URL = "https://api.emeraldtechnology.net/v1/auth/login";

  let headers = {
    accept: "application/json",
    "api-key": API_KEY_AUTH,
    "Content-Type": "*/*",
    "Content-Type": "application/json",
  };

  const DATA = {
    password,
    userNameOrEmail,
  };

  let response = await axios.post(PROXY + encodeURIComponent(URL), DATA, {
    headers,
  });
  return response.data.accessToken;
}
