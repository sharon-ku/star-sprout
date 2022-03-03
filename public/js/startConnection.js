/**
startConnection.js
Sharon Ku & Leanne Suen Fa

Switches html file to "greenhouses.html" once user has logged in
Also stores user info from Db in local storage
*/

// Get user info from Db; only works once logged in
function startClientSocketConnection(userInfoFromDb) {
  console.log(userInfoFromDb);

  console.log(`logged in here`);
  console.log(`pod length: ${userInfoFromDb[0].podId.length}`);

  localStorage.setItem(`user`, JSON.stringify(userInfoFromDb));
  window.location = `greenhouses.html`;
}
