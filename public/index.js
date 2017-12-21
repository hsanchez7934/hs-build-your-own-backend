
$('#submit-button').on('click', getToken);

function getToken() {
  const userEmail = $('#email-input').val();
  const userAppName = $('#app-name-input').val();
  if (userEmail === '' || userAppName === '') {
    return alert('Enter email and application name');
  }
  const body = {
    email: userEmail,
    appName: userAppName
  };

  fetch(`/api/v1/authenticate`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(response => {
      $('section').append(`
        <p>Email: ${response.user.email}</p>
        <p>App Name: ${response.user.appName}</p>
        <p>Admin: ${response.user.admin}</p>
        <p>Token: ${response.user.token}</p>
      `);
    })
    //eslint-disable-next-line
    .catch(error => console.log(error));
  $('#email-input').val('');
  $('#app-name-input').val('');
}
