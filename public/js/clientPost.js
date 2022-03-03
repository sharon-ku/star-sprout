window.onload = function () {
  console.log("client js POST loaded");

  $("#form_userIn").submit(function (event) {
    event.preventDefault();
    // get the form data ...

    $.post(
      "/registerIn",
      {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
      },
      function (data, status) {
        console.log(data);
        if (data === "ALREADY IN") {
          // document.getElementById("form_userIn").reset();
          $("#mess").text("Username already taken.");
        } else {
          //we have registered and so go to login ...
          $("#form_userIn").hide();
          $("#mess").css("font-size", "1.5rem");
          $("#mess").html(
            "Thank you for registering - click <a href = 'index.html'>here</a> to login "
          );
        }
        //console.log(status)
      }
    );
  }); //submit

  $("#form_login").submit(function (event) {
    event.preventDefault();
    // get the form data ...

    $.post(
      "/logIn",
      {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
      },
      function (data, status) {
        console.log(data);
        console.log(status);
        if (data === "WRONG INFO") {
          document.getElementById("form_login").reset();
          $("#mess").text("PLEASE TRY AGAIN");
        } else {
          console.log(data);
          console.log(status);

          //REMOVE THE FORM AND SHOW THE STUFF ...
          document.getElementById("form-wrapper").remove();
          $("#defaultCanvas0").css("display", "block");
          $("#content").remove();
          /**** NOW WE CAN START CLIENT SOCKET CONNECTION ****/
          startClientSocketConnection(data);
        }
      }
    );
  }); //submit
};
