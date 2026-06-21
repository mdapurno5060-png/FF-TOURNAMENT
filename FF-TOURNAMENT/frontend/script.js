const API = "http://127.0.0.1:5000";

// SIGNUP
function signup(){
  fetch(API+"/signup", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  })
  .then(res=>res.json())
  .then(data=>{
    alert(data.message);
  });
}

// LOGIN
function login(){
  fetch(API+"/login", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  })
  .then(res=>res.json())
  .then(data=>{
    if(data.success){
      alert("Login Success");
    } else {
      alert(data.message);
    }
  });
}